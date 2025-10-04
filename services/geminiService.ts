
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

  let message = `Không thể ${context}. Đã xảy ra lỗi không xác định. Vui lòng thử lại.`;

  if (error instanceof Error) {
    const errorMessage = error.message; // Use original case for parsing
    
    // Check for common error types first
    if (errorMessage.toLowerCase().includes("api key not valid")) {
        message = 'Lỗi xác thực: API Key không hợp lệ hoặc bị thiếu.';
    } else if (errorMessage.includes('429')) {
      message = 'Vượt giới hạn yêu cầu (429): Quá nhiều yêu cầu được gửi đi. Vui lòng đợi một lát rồi thử lại.';
    } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
      message = 'Lỗi máy chủ AI (500/503): Dịch vụ AI đang gặp sự cố. Vui lòng thử lại sau ít phút.';
    } else if (errorMessage.includes('candidate was blocked')) {
      message = 'Nội dung bị chặn: Yêu cầu của bạn vi phạm chính sách an toàn. Vui lòng điều chỉnh lại.';
    } else if (errorMessage.includes('400')) {
      // For 400 errors, try to extract a more specific message from the JSON body
      try {
        const jsonString = errorMessage.substring(errorMessage.indexOf('{'));
        const parsedError = JSON.parse(jsonString);
        if (parsedError.error && parsedError.error.message) {
           let detailedMessage = parsedError.error.message;
           if (detailedMessage.includes("exceeds the maximum number of tokens")) {
               detailedMessage = "Tổng dung lượng hồ sơ của bạn quá lớn, vượt quá giới hạn xử lý của AI, ngay cả sau khi đã được tóm tắt tự động. Vui lòng giảm bớt số lượng tệp hoặc sử dụng các tệp có dung lượng nhỏ hơn.";
           }
           message = `Yêu cầu không hợp lệ (400) khi ${context}: ${detailedMessage}`;
        } else {
            message = `Yêu cầu không hợp lệ (400) khi ${context}. Vui lòng kiểm tra lại định dạng và nội dung.`;
        }
      } catch (e) {
        message = `Yêu cầu không hợp lệ (400) khi ${context}. Vui lòng kiểm tra lại định dạng tệp và nội dung yêu cầu của bạn.`;
      }
    } else {
        // Fallback for other errors
        message = `Lỗi khi ${context}: ${errorMessage}`;
    }
  }

  return new Error(message);
};


const supportedMimeTypesForContentAnalysis = [
    'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json',
];

const isMimeTypeSupported = (mimeType: string): boolean => {
    return supportedMimeTypesForContentAnalysis.some(supportedType => mimeType.startsWith(supportedType));
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
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

const summarizeDocumentContent = async (fileName: string, content: string): Promise<string> => {
    if (content.length < 2000) {
        return content;
    }

    try {
        const systemInstruction = "Bạn là trợ lý AI chuyên tóm tắt tài liệu pháp lý cho luật sư Việt Nam. Hãy tóm tắt ngắn gọn, tập trung vào các điểm chính. Kết quả phải bằng tiếng Việt.";
        const prompt = `Vui lòng tóm tắt nội dung của tài liệu sau ("${fileName}"). Tập trung vào: chủ đề chính, các bên liên quan, ngày tháng quan trọng, và các thỏa thuận hoặc tranh chấp cốt lõi. Chỉ trả về nội dung tóm tắt.\n\nNỘI DUNG:\n---\n${content.substring(0, 500000)}\n---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.1,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error(`Lỗi khi tóm tắt nội dung cho ${fileName}:`, error);
        const truncatedContent = content.length > 15000 ? content.substring(0, 15000) : content;
        return `[LỖI KHI TÓM TẮT. NỘI DUNG GỐC BỊ CẮT NGẮN.]\n${truncatedContent}...`;
    }
};

const getFileContentParts = async (files: UploadedFile[]): Promise<{ fileContentParts: string[], imageParts: Part[] }> => {
    const fileContentParts: string[] = [];
    const imageParts: Part[] = [];

    for (const f of files) {
      const categoryLabel = fileCategoryLabels[f.category] || f.category;
      let rawFileText = '';

      if (isMimeTypeSupported(f.file.type) && f.file.type.startsWith('image/')) {
        imageParts.push(await fileToGenerativePart(f.file));
        fileContentParts.push(`Tệp hình ảnh: ${f.file.name} (Loại: ${categoryLabel}).`);
        continue;
      } else if (f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
          const arrayBuffer = await f.file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          rawFileText = result.value;
        } catch (err) {
          fileContentParts.push(`--- LỖI TỆP: ${f.file.name} (KHÔNG THỂ ĐỌC NỘI DUNG) ---`);
          continue;
        }
      } else {
         try {
            rawFileText = await f.file.text();
        } catch (err) {
            fileContentParts.push(`--- TỆP KHÔNG HỖ TRỢ: ${f.file.name} ---`);
            continue;
        }
      }
      
      const processedContent = await summarizeDocumentContent(f.file.name, rawFileText);
      const prefix = rawFileText.length > 2000 ? "TÀI LIỆU (Tóm tắt)" : "TÀI LIỆU";
      fileContentParts.push(`--- ${prefix}: ${f.file.name} (Loại: ${categoryLabel}) ---\n${processedContent}\n--- HẾT TÀI LIỆU ---`);
    }
    return { fileContentParts, imageParts };
}


// --- API Service Functions ---

export const categorizeFile = async (file: File): Promise<FileCategory> => {
    try {
        const categories = Object.keys(fileCategoryLabels).join(', ');
        const prompt = `Dựa vào tên tệp "${file.name}", hãy phân loại nó vào một trong các danh mục sau: ${categories}. Trả về CHỈ MỘT TỪ là tên danh mục (ví dụ: 'Contract').`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0,
                responseSchema: { type: Type.STRING, description: `Chỉ một trong các giá trị sau: ${categories}` }
            }
        });
        
        const category = response.text.trim() as FileCategory;
        if (Object.keys(fileCategoryLabels).includes(category)) {
            return category;
        }
        return 'Uncategorized';
    } catch (error) {
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
      promptText = `Cập nhật báo cáo phân tích sau đây:\n\n**BÁO CÁO HIỆN TẠI:**\n\`\`\`json\n${JSON.stringify(updateContext.report, null, 2)}\n\`\`\`\n\n**THÔNG TIN CẬP NHẬT:**\n- Giai đoạn tố tụng mới: ${updateContext.stage}\n- Yêu cầu cập nhật: "${query}"\n- Ngày hiện tại: ${currentDate}\n- Hồ sơ/Tài liệu mới: ${filesContent}\n\n**YÊU CẦU:**\nHãy tích hợp các thông tin mới và trả về một phiên bản **hoàn chỉnh và được cập nhật** của báo cáo JSON.`;
    } else {
      const effectiveFilesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp nào được tải lên.';
      promptText = `Phân tích thông tin vụ việc và trả về báo cáo JSON.\n\n**THÔNG TIN VỤ VIỆC:**\n\n**A. Bối cảnh & Yêu cầu:**\n- Ngày hiện tại: ${currentDate}.\n- Tóm tắt nội dung: ${caseContent.trim() ? caseContent : 'Chưa cung cấp.'}\n- Yêu cầu của khách hàng: ${clientRequest.trim() ? clientRequest : 'Chưa cung cấp.'}\n- Yêu cầu của luật sư (Mục tiêu phân tích): **${query}**\n\n**B. Hồ sơ tài liệu đính kèm:**\n${effectiveFilesContent}\n\n**YÊU CẦU ĐẦU RA:**\nTrả về báo cáo dưới dạng một đối tượng JSON duy nhất, hợp lệ, tuân thủ cấu trúc đã định nghĩa.`;
    }

    const allParts: Part[] = [...imageParts, { text: promptText }];

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

    const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
    return JSON.parse(jsonText);
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
        const systemInstruction = `Bạn là một luật sư tư vấn AI tại Việt Nam, chuyên soạn thảo văn bản pháp lý (thư tư vấn, thư yêu cầu). Văn bản phải chuyên nghiệp, rõ ràng, chính xác.`;
        const extractedDataSection = extractedData ? `\nDỮ LIỆU ĐÃ TRÍCH XUẤT:\n---\n${Object.entries(extractedData).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---` : '';
        const litigationTypeSection = litigationType ? `\nPHÂN LOẠI SƠ BỘ: ${litigationType === 'civil' ? 'Dân sự' : litigationType === 'criminal' ? 'Hình sự' : 'Hành chính'}` : '';
        const prompt = `${litigationTypeSection}${extractedDataSection}\nBỐI CẢNH VỤ VIỆC:\n---\n${disputeContent}\n---\n\nYÊU CẦU SOẠN THẢO:\n---\n${request}\n---\n\nDỰA VÀO CÁC THÔNG TIN TRÊN, HÃY SOẠN THẢO VĂN BẢN HOÀN CHỈNH.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.5 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo văn bản tư vấn');
    }
}

export const generateContextualDocument = async (report: AnalysisReport, userRequest: string): Promise<string> => {
    try {
        const prompt = `DỮ LIỆU VỤ VIỆC (JSON):\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`\n\nYÊU CẦU CỦA LUẬT SƯ:\n"${userRequest}"\n\nHãy soạn thảo văn bản hoàn chỉnh.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction: DOCUMENT_GENERATION_SYSTEM_INSTRUCTION, temperature: 0.2 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo văn bản');
    }
};

export const generateDocumentFromTemplate = async (docType: DocType, formData: FormData): Promise<string> => {
    try {
        const systemInstruction = `Bạn là trợ lý luật sư AI, chuyên soạn thảo văn bản pháp lý Việt Nam. Dựa vào dữ liệu JSON và loại văn bản, hãy soạn thảo một văn bản hoàn chỉnh, đúng chuẩn.`;
        const prompt = `LOẠI VĂN BẢN: "${docType}"\n\nDỮ LIỆU (JSON):\n\`\`\`json\n${JSON.stringify(formData, null, 2)}\n\`\`\`\n\n**YÊU CẦU:** Soạn thảo văn bản hoàn chỉnh.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.4 }
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

export const generateParagraph = async (userRequest: string, options: ParagraphGenerationOptions): Promise<string> => {
  try {
    const systemInstruction = `Bạn là trợ lý luật sư AI chuyên soạn thảo đoạn văn pháp lý theo yêu cầu và các tùy chọn về văn phong.`;
    const prompt = `YÊU CẦU: "${userRequest}"\n\nHÃY SOẠN THẢO MỘT ĐOẠN VĂN THEO CÁC TIÊU CHÍ:\n- Giọng văn: ${options.tone}\n- Mức độ thuật ngữ: ${options.terminology}\n- Mức độ chi tiết: ${options.detail}\n- Định dạng: ${options.outputFormat}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction, temperature: 0.5 }
    });
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, 'soạn thảo đoạn văn');
  }
};

export const refineText = async (text: string, mode: 'concise' | 'detailed'): Promise<string> => {
  try {
    const modeInstruction = mode === 'concise' ? "Hãy viết lại một cách ngắn gọn, súc tích." : "Hãy viết lại một cách chi tiết, diễn giải các ý để làm rõ nghĩa hơn.";
    const systemInstruction = `Bạn là một luật sư kinh nghiệm tại Việt Nam. Nhiệm vụ của bạn là đọc và viết lại văn bản để chuyên nghiệp, mạch lạc hơn, với văn phong pháp lý chuẩn mực.`;
    const prompt = `VĂN BẢN GỐC:\n---\n${text}\n---\n\nYÊU CẦU: ${modeInstruction}\n\nVui lòng chỉ trả về văn bản đã được viết lại.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction, temperature: 0.6 }
    });
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, 'hoàn thiện văn bản');
  }
};

export const generateFieldContent = async (formContext: { [key: string]: string | undefined }, docType: string, fieldName: string): Promise<string> => {
    try {
        const systemInstruction = `Bạn là trợ lý luật sư AI, chuyên soạn thảo điều khoản pháp lý tại Việt Nam.`;
        const prompt = `BỐI CẢNH (LOẠI VĂN BẢN: ${docType}):\n\`\`\`json\n${JSON.stringify(formContext, null, 2)}\n\`\`\`\n\nYÊU CẦU: Soạn thảo nội dung cho trường có tên là "${fieldName}". Chỉ trả về nội dung cho trường đó.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.7 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo nội dung cho trường này');
    }
};

export const extractInfoFromFile = async (file: UploadedFile, docType: DocType): Promise<Partial<FormData>> => {
    const fieldsToExtract = DOC_TYPE_FIELDS[docType];
    if (!fieldsToExtract || fieldsToExtract.length === 0) return {};
    let contentPart: Part;
    if (isMimeTypeSupported(file.file.type)) {
        contentPart = await fileToGenerativePart(file.file);
    } else if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
            const result = await mammoth.convertToMarkdown({ arrayBuffer: await file.file.arrayBuffer() });
            contentPart = { text: result.value };
        } catch (err) {
             throw new Error(`Không thể đọc nội dung từ tệp DOCX "${file.file.name}".`);
        }
    } else {
        throw new Error(`Định dạng tệp "${file.file.name}" không được hỗ trợ để trích xuất.`);
    }

    try {
        const schemaProperties = fieldsToExtract.reduce((acc, field) => {
            acc[field] = { type: Type.STRING, description: `The value for the '${field}' field.` };
            return acc;
        }, {} as { [key: string]: { type: Type, description: string } });
        const schema = { type: Type.OBJECT, properties: schemaProperties };
        const systemInstruction = `You are a highly accurate AI assistant. Your task is to extract specific pieces of information from a document and structure it into a JSON object.`;
        const prompt = `From the attached document (${file.file.name}), extract the information for a '${docType}' form. Adhere to the provided JSON schema. If a piece of information cannot be found, omit its key. The output MUST be only the JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [contentPart, { text: prompt }] },
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: schema, temperature: 0.0 }
        });
        return JSON.parse(response.text.trim().replace(/^```json\s*|```$/g, ''));
    } catch (error) {
        throw handleGeminiError(error, `trích xuất thông tin từ tệp`);
    }
};

export const generateReportSummary = async (report: AnalysisReport): Promise<string> => {
    try {
        const { quickSummary, ...reportData } = report;
        const systemInstruction = `Bạn là trợ lý luật sư AI chuyên tóm tắt các báo cáo phân tích pháp lý. Hãy tạo ra một bản tóm tắt ngắn gọn (3-4 câu), tập trung vào điểm chính và khuyến nghị.`;
        const prompt = `DỰA TRÊN BÁO CÁO SAU:\n\`\`\`json\n${JSON.stringify(reportData, null, 2)}\n\`\`\`\nHÃY SOẠN THẢO MỘT BẢN "TÓM TẮT NHANH". Chỉ trả về văn bản tóm tắt.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.3 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo tóm tắt báo cáo');
    }
};

export const explainLaw = async (lawText: string): Promise<string> => {
    try {
        const systemInstruction = `Bạn là chuyên gia pháp lý AI tại Việt Nam. Nhiệm vụ của bạn là giải thích ngắn gọn, súc tích và chính xác nội dung cốt lõi của một điều luật.`;
        const prompt = `Hãy giải thích nội dung chính của điều luật sau: "${lawText}".\n\nYÊU CẦU: Giải thích ngắn gọn (3-5 câu), trung lập. Chỉ trả về văn bản giải thích.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.2 }
        });
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, `giải thích điều luật "${lawText}"`);
    }
};

export const extractDataFromDocument = async (file: UploadedFile): Promise<Record<string, string>> => {
    let contentPart: Part;
    if (isMimeTypeSupported(file.file.type) && file.file.type.startsWith('image/')) {
        contentPart = await fileToGenerativePart(file.file);
    } else if (file.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
            const result = await mammoth.extractRawText({ arrayBuffer: await file.file.arrayBuffer() });
            contentPart = { text: `Nội dung tài liệu:\n${result.value}` };
        } catch (err) {
             throw new Error(`Không thể đọc nội dung từ tệp DOCX "${file.file.name}".`);
        }
    } else {
        try {
            contentPart = { text: `Nội dung tài liệu:\n${await file.file.text()}` };
        } catch (err) {
            throw new Error(`Không thể đọc nội dung từ tệp "${file.file.name}".`);
        }
    }

    try {
        const systemInstruction = `Bạn là trợ lý AI chuyên trích xuất thông tin từ văn bản pháp lý Việt Nam vào một đối tượng JSON.`;
        const prompt = `Từ nội dung tài liệu, hãy trích xuất các thông tin quan trọng (tên các bên, MST/CCCD, địa chỉ, ngày ký, giá trị hợp đồng, thời hạn, mốc thời gian). Trả về một đối tượng JSON. Nếu không tìm thấy, trả về JSON trống.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [contentPart, { text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
                temperature: 0.0,
            },
        });
        return JSON.parse(response.text.trim().replace(/^```json\s*|```$/g, ''));
    } catch (error) {
        throw handleGeminiError(error, `trích xuất thông tin từ tệp`);
    }
};

export const suggestCaseType = async (files: UploadedFile[], disputeContent: string, clientRequest: string): Promise<LitigationType> => {
    try {
        const { fileContentParts, imageParts } = await getFileContentParts(files);
        const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp.';
        const systemInstruction = `Bạn là trợ lý luật sư AI tại Việt Nam. Phân loại vụ việc vào một trong ba loại: 'civil', 'criminal', hoặc 'administrative'. Trả về CHỈ MỘT TỪ DUY NHẤT.`;
        const prompt = `Dựa trên thông tin dưới đây, hãy xác định đây là vụ việc dân sự, hình sự, hay hành chính.\n\nTài liệu: ${filesContent}\n\nBối cảnh: ${disputeContent}\n\nYêu cầu KH: ${clientRequest}`;
        const allParts: Part[] = [...imageParts, { text: prompt }];
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: allParts },
            config: {
                systemInstruction,
                temperature: 0.0,
                responseSchema: { type: Type.STRING, description: "Chỉ là 'civil', 'criminal', hoặc 'administrative'" }
            },
        });
        const result = response.text.trim() as LitigationType;
        if (['civil', 'criminal', 'administrative'].includes(result)) return result;
        throw new Error("AI đã trả về một loại vụ việc không hợp lệ.");
    } catch (error) {
        throw handleGeminiError(error, 'đề xuất loại vụ việc');
    }
};
