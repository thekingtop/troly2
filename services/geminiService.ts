import { GoogleGenAI, Part, Type } from "@google/genai";
import type { AnalysisReport, FileCategory, UploadedFile, DocType, FormData, LitigationStage, LitigationType } from '../types';
import { SYSTEM_INSTRUCTION, ANALYSIS_UPDATE_SYSTEM_INSTRUCTION, REPORT_SCHEMA, DOCUMENT_GENERATION_SYSTEM_INSTRUCTION, fileCategoryLabels, DOC_TYPE_FIELDS } from '../constants';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
declare var mammoth: any;

// --- Helper Functions ---

const handleGeminiError = (error: any, context: string): Error => {
  console.error(`Lỗi trong lúc ${context}:`, error);

  let message = `Không thể ${context}. Đã xảy ra lỗi không xác định khi giao tiếp với AI. Vui lòng thử lại.`;

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("api key not valid") || errorMessage.includes("401") || errorMessage.includes("unauthenticated")) {
        message = 'Lỗi xác thực (401): API Key không hợp lệ hoặc bị thiếu. Vui lòng kiểm tra lại cấu hình hoặc liên hệ quản trị viên.';
    } else if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted')) {
      message = 'Vượt giới hạn yêu cầu (429): Bạn đã gửi quá nhiều yêu cầu tới AI trong một thời gian ngắn. Vui lòng đợi một lát rồi thử lại.';
    } else if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('internal error')) {
      message = 'Lỗi máy chủ AI (500/503): Dịch vụ AI hiện đang gặp sự cố hoặc quá tải. Vui lòng thử lại sau ít phút.';
    } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
      message = `Yêu cầu không hợp lệ (400) khi ${context}. Vui lòng kiểm tra lại định dạng tệp và nội dung yêu cầu của bạn.`;
    } else if (errorMessage.includes('candidate was blocked')) {
      message = 'Nội dung bị chặn: Yêu cầu của bạn đã bị chặn vì có thể vi phạm chính sách an toàn. Vui lòng điều chỉnh lại nội dung và thử lại.';
    } else {
        // Fallback to a more detailed error message if none of the specific cases match
        message = `Lỗi khi ${context}: ${error.message}`;
    }
  }

  return new Error(message);
};


// List of MIME types that Gemini 2.5 Flash is known to support for direct content analysis.
const supportedMimeTypesForContentAnalysis = [
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json',
];

const isMimeTypeSupported = (mimeType: string): boolean => {
    return supportedMimeTypesForContentAnalysis.some(supportedType => mimeType.startsWith(supportedType));
};

// Function to convert a File object to a GoogleGenAI.Part object
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result includes the data URL prefix (e.g., "data:image/png;base64,"), remove it.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const getFileContentParts = async (files: UploadedFile[]): Promise<{ fileContentParts: string[], imageParts: Part[] }> => {
    const fileContentParts: string[] = [];
    const imageParts: Part[] = [];

    for (const f of files) {
      const categoryLabel = fileCategoryLabels[f.category] || f.category;
      if (isMimeTypeSupported(f.file.type) && f.file.type.startsWith('image/')) {
        imageParts.push(await fileToGenerativePart(f.file));
        fileContentParts.push(`Tệp hình ảnh: ${f.file.name} (Loại: ${categoryLabel}). Nội dung được đính kèm riêng.`);
      } else if (f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
          const arrayBuffer = await f.file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          fileContentParts.push(`--- TÀI LIỆU: ${f.file.name} (Loại: ${categoryLabel}) ---\n${result.value}\n--- HẾT TÀI LIỆU ---`);
        } catch (conversionError) {
          console.error(`Error converting DOCX file ${f.file.name}:`, conversionError);
          fileContentParts.push(`--- LỖI TỆP: ${f.file.name} (KHÔNG THỂ ĐỌC NỘI DUNG) ---`);
        }
      } else {
         try {
            const textContent = await f.file.text();
            fileContentParts.push(`--- TÀI LIỆU: ${f.file.name} (Loại: ${categoryLabel}) ---\n${textContent}\n--- HẾT TÀI LIỆU ---`);
        } catch (readError) {
            console.error(`Could not read file ${f.file.name} as text.`, readError);
            fileContentParts.push(`--- TỆP KHÔNG HỖ TRỢ: ${f.file.name} ---`);
        }
      }
    }
    return { fileContentParts, imageParts };
}


// --- API Service Functions ---

export const categorizeFile = async (file: File): Promise<FileCategory> => {
    try {
        const categories = Object.keys(fileCategoryLabels).join(', ');
        
        // SIMPLIFIED LOGIC: Always use filename for categorization to improve stability and avoid 500 errors from large/complex file content.
        const prompt = `Dựa vào tên tệp "${file.name}", hãy phân loại nó vào một trong các danh mục sau: ${categories}. Trả về CHỈ MỘT TỪ là tên danh mục (ví dụ: 'Contract' nếu tên tệp là 'hop_dong.pdf', 'Evidence' nếu tên tệp là 'giay_xac_nhan.docx'). Phân tích tên tệp để đưa ra loại phù hợp nhất.`;
        const contents = prompt;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                temperature: 0,
                responseSchema: {
                    type: Type.STRING,
                    description: `Chỉ một trong các giá trị sau: ${categories}`
                }
            }
        });
        
        const category = response.text.trim() as FileCategory;
        // Validate the response from the model
        if (Object.keys(fileCategoryLabels).includes(category)) {
            return category;
        }

        console.warn(`Model returned an invalid category '${category}' for file '${file.name}'. Defaulting to Uncategorized.`);
        return 'Uncategorized';
    } catch (error) {
        // This will catch 500 Internal errors and prevent the app from crashing.
        console.error(`Error categorizing file ${file.name}:`, error);
        // Fallback to 'Uncategorized' on any API error.
        // Re-throw the specific error to be handled by the caller, which can then decide on a fallback UI state.
        throw handleGeminiError(error, `phân loại tệp ${file.name}`);
    }
};

interface AnalysisUpdateContext {
  report: AnalysisReport;
  stage: LitigationStage;
}

export const analyzeCaseFiles = async (
  files: UploadedFile[],
  query: string,
  caseContent: string,
  clientRequest: string,
  updateContext?: AnalysisUpdateContext
): Promise<AnalysisReport> => {
  try {
    const { fileContentParts, imageParts } = await getFileContentParts(files);

    const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tài liệu mới nào được cung cấp.';
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    let promptText: string;
    const systemInstruction = updateContext ? ANALYSIS_UPDATE_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION;

    if (updateContext) {
      // Prompt for updating an existing report
      promptText = `
Hãy thực hiện vai trò của bạn như một luật sư AI cao cấp. Cập nhật báo cáo phân tích dựa trên các thông tin mới.

**1. BÁO CÁO PHÂN TÍCH HIỆN TẠI ĐỂ XEM XÉT:**
\`\`\`json
${JSON.stringify(updateContext.report, null, 2)}
\`\`\`

---

**2. THÔNG TIN CẬP NHẬT:**
- **Giai đoạn tố tụng mới:** ${updateContext.stage}
- **Yêu cầu cập nhật từ luật sư:** "${query}"
- **Ngày hiện tại:** ${currentDate}
- **Hồ sơ/Tài liệu mới (nếu có):**
${filesContent}

---

**3. YÊU CẦU ĐẦU RA:**
Dựa trên vai trò của bạn (được nêu trong system instruction), hãy tích hợp các thông tin mới và trả về một phiên bản **hoàn chỉnh và được cập nhật** của báo cáo JSON.
`;
    } else {
      // Prompt for initial analysis
      const effectiveFilesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp nào được tải lên.';
      promptText = `
Hãy thực hiện vai trò của bạn như một trợ lý luật sư AI xuất sắc. Phân tích toàn bộ thông tin được cung cấp dưới đây và trả về một báo cáo JSON hoàn chỉnh.

**PHƯƠНG PHÁP LUẬN PHÂN TÍCH (BẮT BUỘC TUÂN THỦ):**
1.  **Tổng hợp bối cảnh:** Đọc kỹ tóm tắt vụ việc, yêu cầu khách hàng, và toàn bộ nội dung các tài liệu. Xây dựng một dòng thời gian các sự kiện chính.
2.  **Xác định mâu thuẫn:** Tìm kiếm bất kỳ điểm mâu thuẫn, không nhất quán nào giữa các tài liệu hoặc giữa tài liệu và lời trình bày.
3.  **Phân tích pháp lý:** Dựa trên bối cảnh đã tổng hợp, xác định quan hệ pháp luật, các vấn đề cốt lõi và viện dẫn các điều luật có liên quan (đảm bảo còn hiệu lực).
4.  **Phân tích Lỗ hổng (Gap Analysis):** a) Xác định các thông tin, tài liệu, chứng cứ quan trọng còn thiếu. b) **Quan trọng:** Phân tích và chỉ ra các "lỗ hổng pháp lý" — các điểm yếu trong lập luận, các quy định mâu thuẫn, các kẽ hở trong hợp đồng mà đối phương có thể khai thác. c) Đề xuất hành động cụ thể để thu thập thông tin hoặc củng cố các điểm yếu này.
5.  **Đánh giá Triển vọng (Case Prospects):**
    - **Điểm mạnh:** Liệt kê các lợi thế pháp lý và chứng cứ rõ ràng.
    - **Điểm yếu:** Chỉ ra các điểm bất lợi, mâu thuẫn trong hồ sơ.
    - **Rủi ro:** Phân tích các rủi ro tiềm ẩn (ví dụ: khả năng thua kiện, chi phí phát sinh).
6.  **Xây dựng Chiến lược (Proposed Strategy):** Dựa trên TOÀN BỘ KẾT QUẢ PHÂN TÍCH ở trên (đặc biệt là mục 4 và 5), hãy xây dựng một chiến lược chi tiết. Chiến lược phải chỉ rõ: a) Cách tận dụng Điểm mạnh. b) Cách khắc phục hoặc giảm thiểu Điểm yếu và Rủi ro. c) Cách khai thác các Lỗ hổng pháp lý để tạo lợi thế. d) Đề xuất các hành động cụ thể cho từng giai đoạn (Tiền tố tụng và Tố tụng).
7.  **Tạo JSON:** Cấu trúc toàn bộ kết quả phân tích vào đối tượng JSON được yêu cầu.

---

**THÔNG TIN VỤ VIỆC:**

**A. Bối cảnh & Yêu cầu chính:**
- Ngày hiện tại: ${currentDate}.
- Tóm tắt nội dung vụ việc (do luật sư cung cấp): ${caseContent.trim() ? caseContent : 'Chưa cung cấp.'}
- Yêu cầu của khách hàng (do luật sư cung cấp): ${clientRequest.trim() ? clientRequest : 'Chưa cung cấp.'}
- Yêu cầu của luật sư đối với AI (Mục tiêu phân tích): **${query}**

**B. Hồ sơ tài liệu đính kèm:**
${effectiveFilesContent}

---

**YÊU CẦU ĐẦU RA:**
Trả về báo cáo phân tích dưới dạng một đối tượng JSON duy nhất, hợp lệ, tuân thủ nghiêm ngặt cấu trúc đã được định nghĩa.
`;
    }

    const textPart: Part = { text: promptText };
    const allParts: Part[] = [...imageParts, textPart];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: allParts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');

    const parsedResponse: AnalysisReport = JSON.parse(cleanedJsonText);
    return parsedResponse;
  } catch (error) {
    const context = updateContext ? 'cập nhật phân tích' : 'phân tích hồ sơ';
    throw handleGeminiError(error, context);
  }
};

export const generateConsultingDocument = async (
    disputeContent: string, 
    request: string,
    extractedData: Record<string, string> | null,
    litigationType: LitigationType | null
): Promise<string> => {
    try {
        const systemInstruction = `Bạn là một luật sư tư vấn AI xuất sắc tại Việt Nam. Nhiệm vụ của bạn là nhận bối cảnh một vụ việc, các dữ liệu đã được trích xuất từ tài liệu, và một yêu cầu cụ thể, sau đó soạn thảo một văn bản pháp lý hoàn chỉnh (ví dụ: thư tư vấn, thư yêu cầu). Văn bản phải chuyên nghiệp, rõ ràng, chính xác và sử dụng các dữ liệu được cung cấp một cách hợp lý.`;
        
        const extractedDataSection = extractedData 
            ? `
DỮ LIỆU ĐÃ TRÍCH XUẤT TỪ TÀI LIỆU:
---
${Object.entries(extractedData).map(([key, value]) => `${key}: ${value}`).join('\n')}
---
` 
            : '';
        
        const litigationTypeSection = litigationType 
            ? `PHÂN LOẠI VỤ VIỆC SƠ BỘ: ${litigationType === 'civil' ? 'Dân sự' : litigationType === 'criminal' ? 'Hình sự' : 'Hành chính'}\n`
            : '';

        const prompt = `
${litigationTypeSection}
${extractedDataSection}
BỐI CẢNH VỤ VIỆC (DO LUẬT SƯ CUNG CẤP):
---
${disputeContent}
---

YÊU CẦU SOẠN THẢO CỦA LUẬT SƯ:
---
${request}
---

DỰA VÀO TOÀN BỘ CÁC THÔNG TIN TRÊN, HÃY SOẠN THẢO VĂN BẢN TƯƠNG ỨNG MỘT CÁCH HOÀN CHỈNH.
`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
            }
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo văn bản tư vấn');
    }
}

export const generateContextualDocument = async (report: AnalysisReport, userRequest: string): Promise<string> => {
    try {
        const prompt = `
DỮ LIệu VỤ VIỆC (JSON):
\`\`\`json
${JSON.stringify(report, null, 2)}
\`\`\`

YÊU CẦU CỦA LUẬT SƯ:
"${userRequest}"

Hãy dựa vào vai trò, nhiệm vụ, và các mẫu đã được cung cấp trong system instruction để soạn thảo văn bản hoàn chỉnh.
`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: DOCUMENT_GENERATION_SYSTEM_INSTRUCTION,
                temperature: 0.2,
            }
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo văn bản');
    }
};

export const generateDocumentFromTemplate = async (docType: DocType, formData: FormData): Promise<string> => {
    try {
        const systemInstruction = `Bạn là một trợ lý luật sư AI, chuyên gia trong việc soạn thảo các văn bản pháp lý tại Việt Nam. Nhiệm vụ của bạn là nhận một đối tượng JSON chứa dữ liệu từ một biểu mẫu và một yêu cầu về loại văn bản cần tạo. Dựa vào đó, hãy soạn thảo một văn bản hoàn chỉnh, chuyên nghiệp, đúng chuẩn văn phong và thể thức pháp lý Việt Nam. Hãy điền các thông tin từ JSON vào đúng vị trí và tự động soạn thảo các điều khoản phức tạp một cách hợp lý.`;
        
        const prompt = `
LOẠI VĂN BẢN CẦN TẠO: "${docType}"

DỮ LIỆU TỪ BIỂU MẪU (JSON):
\`\`\`json
${JSON.stringify(formData, null, 2)}
\`\`\`

**YÊU CẦU:**
Hãy soạn thảo văn bản hoàn chỉnh dựa trên các thông tin trên.
- Sử dụng đúng thể thức (Quốc hiệu, Tiêu ngữ, tên văn bản, ngày tháng, chữ ký).
- Tự động điền các thông tin đã cho vào đúng ngữ cảnh.
- Với các điều khoản phức tạp (ví dụ: phạm vi công việc, quyền và nghĩa vụ), hãy tự soạn thảo nội dung một cách chuyên nghiệp, hợp lý dựa trên bối cảnh.
- Chỉ trả về nội dung văn bản hoàn chỉnh, không thêm bất kỳ lời giải thích hay định dạng nào khác.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4,
            }
        });

        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo văn bản từ mẫu');
    }
};


export interface ParagraphGenerationOptions {
  tone: 'assertive' | 'persuasive' | 'formal' | 'conciliatory' | 'warning';
  terminology: 'legal' | 'plain';
  detail: 'concise' | 'detailed';
  outputFormat: 'text' | 'markdown';
}

export const generateParagraph = async (
  userRequest: string,
  options: ParagraphGenerationOptions
): Promise<string> => {
  try {
    const toneMap = {
      assertive: "Giọng văn quyết đoán, trực tiếp, và mạnh mẽ, phù hợp cho tranh luận hoặc yêu cầu dứt khoát.",
      persuasive: "Giọng văn mang tính thuyết phục, mềm mỏng, phù hợp cho việc thương lượng hoặc gửi công văn lần đầu.",
      formal: "Giọng văn trang trọng, lịch sự, có âm hưởng công văn, phù hợp với việc trao đổi chính thức với các cơ quan, tổ chức hoặc trong môi trường công sở. Sử dụng từ ngữ chuyên nghiệp, khách quan và cấu trúc câu rõ ràng.",
      conciliatory: "Giọng văn hòa giải, thể hiện thiện chí, nhằm mục đích đàm phán, hòa giải và tìm kiếm giải pháp chung.",
      warning: "Giọng văn cảnh báo, cứng rắn, mang tính răn đe, thường được sử dụng trong các thư yêu cầu cuối cùng trước khi khởi kiện."
    };
    const terminologyMap = {
      legal: "Sử dụng thuật ngữ pháp lý chuyên sâu, chính xác và học thuật.",
      plain: "Sử dụng ngôn ngữ phổ thông, rõ ràng, dễ hiểu cho người không có chuyên môn về luật."
    };
    const detailMap = {
      concise: "Đi thẳng vào vấn đề, trình bày ngắn gọn, súc tích, chỉ nêu những luận điểm chính.",
      detailed: "Phân tích chi tiết, đưa ra các ví dụ, giải thích cặn kẽ các cơ sở pháp lý và luận điểm."
    };
    const formatInstruction = options.outputFormat === 'markdown'
        ? "Định dạng đầu ra phải là Markdown (sử dụng các tiêu đề, in đậm, in nghiêng, danh sách nếu cần thiết để cấu trúc văn bản một cách rõ ràng)."
        : "Định dạng đầu ra là văn bản thuần túy, không có bất kỳ định dạng đặc biệt nào.";

    const systemInstruction = `Bạn là một trợ lý luật sư AI chuyên về soạn thảo văn bản pháp lý. Nhiệm vụ của bạn là tạo ra một đoạn văn hoàn chỉnh dựa trên yêu cầu của luật sư và các tùy chọn về văn phong đã được cung cấp.`;

    const prompt = `
YÊU CẦU CỦA LUẬT SƯ:
"${userRequest}"

HÃY SOẠN THẢO MỘT ĐOẠN VĂN THEO CÁC TIÊU CHÍ SAU:
- **Giọng văn:** ${toneMap[options.tone]}
- **Mức độ thuật ngữ:** ${terminologyMap[options.terminology]}
- **Mức độ chi tiết:** ${detailMap[options.detail]}
- **Định dạng:** ${formatInstruction}

Đoạn văn cuối cùng phải chuyên nghiệp, mạch lạc và đáp ứng đúng yêu cầu.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5,
      }
    });

    return response.text.trim();

  } catch (error) {
    throw handleGeminiError(error, 'soạn thảo đoạn văn');
  }
};

export const refineText = async (
  text: string,
  mode: 'concise' | 'detailed'
): Promise<string> => {
  try {
    const modeInstruction = mode === 'concise'
      ? "Hãy viết lại một cách ngắn gọn, súc tích, tập trung vào các ý chính, loại bỏ các chi tiết không cần thiết."
      : "Hãy viết lại một cách chi tiết hơn, diễn giải các ý, bổ sung các lập luận hoặc thông tin nền tảng hợp lý để làm rõ nghĩa hơn.";

    const systemInstruction = `Bạn là một luật sư dày dạn kinh nghiệm tại Việt Nam. Nhiệm vụ của bạn là đọc một đoạn văn bản do một đồng nghiệp khác soạn thảo và viết lại nó. Bạn phải giữ lại ý nghĩa cốt lõi của văn bản gốc nhưng cải thiện nó để trở nên chuyên nghiệp, mạch lạc hơn, với văn phong pháp lý chuẩn mực.`;

    const prompt = `
VĂN BẢN GỐC CẦN HOÀN THIỆN:
---
${text}
---

YÊU CẦU HOÀN THIỆN:
${modeInstruction}

Vui lòng chỉ trả về văn bản đã được viết lại, không thêm bất kỳ lời giải thích hay định dạng nào khác.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
      }
    });

    return response.text.trim();

  } catch (error) {
    throw handleGeminiError(error, 'hoàn thiện văn bản');
  }
};

export const generateFieldContent = async (
    formContext: { [key: string]: string | undefined },
    docType: string,
    fieldName: string,
): Promise<string> => {
    try {
        const systemInstruction = `Bạn là một trợ lý luật sư AI, chuyên gia trong việc soạn thảo các điều khoản pháp lý tại Việt Nam. Nhiệm vụ của bạn là nhận một phần dữ liệu từ một biểu mẫu văn bản, và tạo ra nội dung hoàn chỉnh cho một trường (field) cụ thể mà người dùng yêu cầu.`;

        const prompt = `
BỐI CẢNH DỮ LIỆU TỪ BIỂU MẪU (LOẠI VĂN BẢN: ${docType}):
\`\`\`json
${JSON.stringify(formContext, null, 2)}
\`\`\`

YÊU CẦU:
Hãy soạn thảo nội dung phù hợp, chuyên nghiệp và chuẩn pháp lý cho trường (field) có tên là "${fieldName}".

LƯU Ý:
- Chỉ trả về nội dung cho trường đó, không thêm bất kỳ lời giải thích hay định dạng nào khác.
- Dựa vào các thông tin đã có trong bối cảnh để tạo ra nội dung phù hợp nhất.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, 'tạo nội dung cho trường này');
    }
};

export const extractInfoFromFile = async (
    file: UploadedFile,
    docType: DocType
): Promise<Partial<FormData>> => {
    const fieldsToExtract = DOC_TYPE_FIELDS[docType];
    if (!fieldsToExtract || fieldsToExtract.length === 0) {
        console.warn(`No field mapping found for document type: ${docType}`);
        return {};
    }

    let contentPart: Part;
    
    if (isMimeTypeSupported(file.file.type)) {
        contentPart = await fileToGenerativePart(file.file);
    } else if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const result = await mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer });
            contentPart = { text: result.value }; // Use Markdown content directly
        } catch (conversionError) {
             console.error(`Error converting DOCX for extraction ${file.file.name}:`, conversionError);
             throw new Error(`Không thể đọc nội dung từ tệp DOCX "${file.file.name}".`);
        }
    } else {
        throw new Error(`Không thể đọc nội dung từ tệp "${file.file.name}" vì định dạng này không được hỗ trợ để trích xuất tự động.`);
    }

    try {
        const schemaProperties = fieldsToExtract.reduce((acc, field) => {
            const description = `The value for the '${field}' field. For example, for 'clientName', extract the client's full name.`;
            acc[field] = { type: Type.STRING, description };
            return acc;
        }, {} as { [key: string]: { type: Type, description: string } });

        const schema = {
            type: Type.OBJECT,
            properties: schemaProperties,
        };

        const systemInstruction = `You are a highly accurate AI assistant specializing in legal document analysis in Vietnam. Your task is to extract specific pieces of information from a given document and structure it into a JSON object.`;

        const prompt = `
        From the attached document content from (${file.file.name}), please extract the information needed to fill a '${docType}' form.
        
        Strictly adhere to the provided JSON schema and extract the values for the following fields:
        - ${fieldsToExtract.join('\n- ')}
        
        If a piece of information cannot be found in the document, omit its key from the final JSON object. Do not guess or invent information. The output MUST be only the JSON object.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [contentPart, { text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.0,
            },
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const parsedResponse: Partial<FormData> = JSON.parse(jsonText);
        return parsedResponse;

    } catch (error) {
        throw handleGeminiError(error, `trích xuất thông tin từ tệp`);
    }
};

export const generateReportSummary = async (report: AnalysisReport): Promise<string> => {
    try {
        // Create a copy of the report without any existing summary to avoid feedback loops
        const { quickSummary, ...reportData } = report;

        const systemInstruction = `Bạn là một trợ lý luật sư AI chuyên tóm tắt các báo cáo phân tích pháp lý phức tạp. Nhiệm vụ của bạn là đọc một đối tượng JSON chứa báo cáo và tạo ra một bản tóm tắt ngắn gọn, súc tích, tập trung vào những điểm quan trọng nhất.`;

        const prompt = `
DỰA TRÊN BÁO CÁO PHÂN TÍCH CHI TIẾT SAU (ĐỊNH DẠNG JSON):
\`\`\`json
${JSON.stringify(reportData, null, 2)}
\`\`\`

HÃY SOẠN THẢO MỘT BẢN "TÓM TẮT NHANH" (QUICK SUMMARY) CHO BÁO CÁO NÀY.

**YÊU CẦU BẮT BUỘC:**
1.  **Ngắn gọn và súc tích:** Tóm tắt phải dài không quá 3-4 câu.
2.  **Tập trung vào điểm chính:** Nêu bật những phát hiện quan trọng nhất (ví dụ: rủi ro pháp lý cao nhất, điểm mạnh/yếu cốt lõi).
3.  **Nêu bật khuyến nghị:** Chỉ ra chiến lược hành động được đề xuất hoặc các bước đi quan trọng tiếp theo.
4.  **Văn phong chuyên nghiệp:** Sử dụng ngôn ngữ pháp lý rõ ràng, trực diện, phù hợp cho luật sư đọc.
5.  **Chỉ trả về văn bản tóm tắt:** Không thêm bất kỳ lời giải thích hay định dạng nào khác.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            }
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, 'tạo tóm tắt báo cáo');
    }
};

export const explainLaw = async (lawText: string): Promise<string> => {
    try {
        const systemInstruction = `Bạn là một chuyên gia pháp lý AI tại Việt Nam. Nhiệm vụ của bạn là giải thích ngắn gọn, súc tích và chính xác nội dung cốt lõi của một điều luật được cung cấp. Lời giải thích phải chuyên nghiệp, dễ hiểu cho luật sư, không đưa ra ý kiến cá nhân.`;

        const prompt = `
        Dựa trên vai trò của bạn, hãy giải thích nội dung chính của điều luật sau đây: "${lawText}".

        **YÊU CẦU:**
        1.  **Tập trung vào nội dung cốt lõi:** Giải thích mục đích, đối tượng áp dụng và các quy định quan trọng nhất của điều luật.
        2.  **Ngắn gọn:** Giữ lời giải thích trong khoảng 3-5 câu.
        3.  **Trung lập:** Chỉ trình bày nội dung của luật, không bình luận hay tư vấn.
        4.  **Chỉ trả về văn bản giải thích:** Không thêm bất kỳ lời dẫn hay định dạng nào khác.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
            }
        });

        return response.text.trim();

    } catch (error) {
        throw handleGeminiError(error, `giải thích điều luật "${lawText}"`);
    }
};

export const extractDataFromDocument = async (
    file: UploadedFile,
): Promise<Record<string, string>> => {
    let contentPart: Part;
    
    if (isMimeTypeSupported(file.file.type) && file.file.type.startsWith('image/')) {
        contentPart = await fileToGenerativePart(file.file);
    } else if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
            const arrayBuffer = await file.file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            contentPart = { text: `Nội dung tài liệu:\n${result.value}` };
        } catch (conversionError) {
             console.error(`Error converting DOCX for extraction ${file.file.name}:`, conversionError);
             throw new Error(`Không thể đọc nội dung từ tệp DOCX "${file.file.name}".`);
        }
    } else {
        try {
            const textContent = await file.file.text();
            contentPart = { text: `Nội dung tài liệu:\n${textContent}` };
        } catch (readError) {
            console.error(`Could not read file ${file.file.name} as text.`, readError);
            throw new Error(`Không thể đọc nội dung từ tệp "${file.file.name}" vì định dạng này không được hỗ trợ để trích xuất tự động.`);
        }
    }

    try {
        const systemInstruction = `Bạn là một trợ lý AI chuyên trích xuất thông tin từ các văn bản pháp lý và kinh doanh tại Việt Nam. Nhiệm vụ của bạn là đọc nội dung văn bản được cung cấp và trích xuất các thông tin quan trọng vào một đối tượng JSON.`;

        const prompt = `Từ nội dung tài liệu được cung cấp, hãy trích xuất các thông tin quan trọng sau đây nếu có:
- Tên các bên tham gia (ví dụ: Bên A, Bên B, Tên công ty, Tên cá nhân)
- Mã số thuế / Số CCCD của các bên
- Địa chỉ của các bên
- Ngày ký / Ngày hiệu lực của văn bản
- Giá trị hợp đồng hoặc số tiền liên quan
- Thời hạn hiệu lực
- Các mốc thời gian quan trọng khác (ví dụ: ngày bàn giao, ngày thanh toán)

Hãy trả về một đối tượng JSON. Key của đối tượng là tên của thông tin (ví dụ: "Tên Bên A", "Giá trị Hợp đồng"), và value là chuỗi thông tin trích xuất được. Nếu không tìm thấy thông tin nào, hãy trả về một đối tượng JSON trống.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [contentPart, { text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    description: "Đối tượng chứa các cặp key-value của thông tin trích xuất được.",
                    additionalProperties: { type: Type.STRING },
                },
                temperature: 0.0,
            },
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const parsedResponse: Record<string, string> = JSON.parse(jsonText);
        return parsedResponse;

    } catch (error) {
        throw handleGeminiError(error, `trích xuất thông tin từ tệp`);
    }
};

export const suggestCaseType = async (
    files: UploadedFile[],
    disputeContent: string,
    clientRequest: string
): Promise<LitigationType> => {
    try {
        const { fileContentParts, imageParts } = await getFileContentParts(files);
        const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp nào được tải lên.';
        
        const systemInstruction = `Bạn là một trợ lý luật sư AI tại Việt Nam. Nhiệm vụ của bạn là phân loại một vụ việc pháp lý vào một trong ba loại: 'civil' (dân sự), 'criminal' (hình sự), hoặc 'administrative' (hành chính) dựa trên các tài liệu và bối cảnh được cung cấp. Bạn PHẢI trả về CHỈ MỘT TỪ DUY NHẤT.`;

        const prompt = `
Dựa trên các thông tin dưới đây, hãy xác định đây là vụ việc dân sự, hình sự, hay hành chính.

**1. Nội dung các tài liệu:**
${filesContent}

**2. Bối cảnh bổ sung từ luật sư:**
${disputeContent}

**3. Yêu cầu của khách hàng:**
${clientRequest}

Hãy phân loại vụ việc này.
`;
        const textPart: Part = { text: prompt };
        const allParts: Part[] = [...imageParts, textPart];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: allParts },
            config: {
                systemInstruction,
                temperature: 0.0,
                responseSchema: {
                    type: Type.STRING,
                    description: "Chỉ được phép là một trong các giá trị sau: 'civil', 'criminal', 'administrative'",
                }
            },
        });

        const result = response.text.trim() as LitigationType;
        if (['civil', 'criminal', 'administrative'].includes(result)) {
            return result;
        }
        // Fallback or error if the model returns an invalid value
        throw new Error("AI đã trả về một loại vụ việc không hợp lệ.");

    } catch (error) {
        throw handleGeminiError(error, 'đề xuất loại vụ việc');
    }
};