import { GoogleGenAI, Part, Type } from "@google/genai";
import type { AnalysisReport, FileCategory, UploadedFile, DocType, FormData, LitigationStage, LitigationType, ConsultingReport, ParagraphGenerationOptions, ChatMessage, ArgumentNode, DraftingMode, OpponentArgument } from '../types.ts';
import { 
    SYSTEM_INSTRUCTION, 
    REANALYSIS_SYSTEM_INSTRUCTION,
    ANALYSIS_UPDATE_SYSTEM_INSTRUCTION, 
    REPORT_SCHEMA, 
    DOCUMENT_GENERATION_SYSTEM_INSTRUCTION, 
    fileCategoryLabels, 
    DOC_TYPE_FIELDS, 
    CONSULTING_SYSTEM_INSTRUCTION, 
    CONSULTING_REPORT_SCHEMA,
    SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION,
    SUMMARY_EXTRACTION_SCHEMA,
    CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION,
    INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION,
    ARGUMENT_GENERATION_SYSTEM_INSTRUCTION,
    ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION,
    OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION,
    OPPONENT_ANALYSIS_SCHEMA,
    nodeTypeMeta,
    DRAFTING_MODE_LABELS
} from '../constants.ts';

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
    if (errorMessage.includes('401') || errorMessage.toUpperCase().includes('UNAUTHENTICATED')) {
        message = 'Lỗi xác thực (401): API Key của bạn không hợp lệ, bị thiếu, hoặc đã hết hạn. Vui lòng kiểm tra lại cấu hình và thử lại.';
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
    'application/pdf', // Add PDF support for direct analysis
    'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json',
];

const isMimeTypeSupportedForDirectAnalysis = (mimeType: string): boolean => {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
        .some(supportedType => mimeType.startsWith(supportedType));
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

        if (response && typeof response.text === 'string') {
            return response.text.trim();
        }
        
        console.warn(`AI did not return text for summarization of ${fileName}. Proceeding with original content.`);
        throw new Error("AI response was empty.");

    } catch (error) {
        console.error(`Lỗi khi tóm tắt nội dung cho ${fileName}:`, error);
        const truncatedContent = content.length > 15000 ? content.substring(0, 15000) : content;
        return `[LỖI KHI TÓM TẮT. NỘI DUNG GỐC BỊ CẮT NGẮN.]\n${truncatedContent}...`;
    }
};

const getFileContentParts = async (files: UploadedFile[]): Promise<{ fileContentParts: string[], multimodalParts: Part[] }> => {
    const fileContentParts: string[] = [];
    const multimodalParts: Part[] = [];

    for (const f of files) {
      const categoryLabel = fileCategoryLabels[f.category] || f.category;
      let rawFileText = '';

      // Handle multimodal files (images, PDFs) directly
      if (isMimeTypeSupportedForDirectAnalysis(f.file.type)) {
        multimodalParts.push(await fileToGenerativePart(f.file));
        const fileTypeLabel = f.file.type.startsWith('image/') ? 'Tệp hình ảnh' : 'Tệp PDF';
        fileContentParts.push(`${fileTypeLabel}: ${f.file.name} (Loại: ${categoryLabel}).`);
        continue;
      } 
      // Handle DOCX files
      else if (f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && typeof mammoth !== 'undefined') {
        try {
          const arrayBuffer = await f.file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          rawFileText = result.value;
        } catch (err) {
          fileContentParts.push(`--- LỖI TỆP: ${f.file.name} (KHÔNG THỂ ĐỌC NỘI DUNG) ---`);
          continue;
        }
      } 
      // Handle other text-based files
      else {
         try {
            rawFileText = await f.file.text();
        } catch (err) {
            // This will now correctly skip binary files like PDFs that failed the direct analysis check
            fileContentParts.push(`--- TỆP KHÔNG HỖ TRỢ ĐỌC NỘI DUNG: ${f.file.name} ---`);
            continue;
        }
      }
      
      const processedContent = await summarizeDocumentContent(f.file.name, rawFileText);
      const prefix = rawFileText.length > 2000 ? "TÀI LIỆU (Tóm tắt)" : "TÀI LIỆU";
      fileContentParts.push(`--- ${prefix}: ${f.file.name} (Loại: ${categoryLabel}) ---\n${processedContent}\n--- HẾT TÀI LIỆU ---`);
    }
    return { fileContentParts, multimodalParts };
}


// --- API Service Functions ---

export const categorizeMultipleFiles = async (files: File[]): Promise<Record<string, FileCategory>> => {
    if (files.length === 0) {
        return {};
    }
    try {
        const categories = Object.keys(fileCategoryLabels).join(', ');
        const fileNames = files.map(f => f.name);
        
        const prompt = `Dựa vào danh sách tên tệp sau đây, hãy phân loại mỗi tệp vào một trong các danh mục sau: ${categories}. Trả về một đối tượng JSON trong đó key là tên tệp và value là danh mục tương ứng.\n\nDanh sách tệp:\n${fileNames.join('\n')}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                classifications: {
                    type: Type.ARRAY,
                    description: "An array of file classification objects.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            fileName: { type: Type.STRING, description: "The name of the file." },
                            category: { type: Type.STRING, description: `The category of the file. Must be one of: ${categories}` }
                        },
                        required: ['fileName', 'category']
                    }
                }
            },
            required: ['classifications']
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        
        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
            throw new Error("AI không trả về dữ liệu phân loại hợp lệ.");
        }
        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const parsedResponse = JSON.parse(jsonText);

        const categoryMap: Record<string, FileCategory> = {};
        for (const item of parsedResponse.classifications) {
            if (fileNames.includes(item.fileName) && Object.keys(fileCategoryLabels).includes(item.category)) {
                categoryMap[item.fileName] = item.category as FileCategory;
            }
        }
        
        // Ensure all files get a category, even if the model misses some.
        for (const name of fileNames) {
            if (!categoryMap[name]) {
                categoryMap[name] = 'Uncategorized';
            }
        }
        
        return categoryMap;
    } catch (error) {
        throw handleGeminiError(error, `phân loại hàng loạt tệp`);
    }
};

export const extractSummariesFromFiles = async (
  files: UploadedFile[]
): Promise<{ caseSummary: string; clientRequestSummary: string }> => {
  try {
    const { fileContentParts, multimodalParts } = await getFileContentParts(files);
    
    if (fileContentParts.length === 0 && multimodalParts.length === 0) {
      return { caseSummary: '', clientRequestSummary: '' };
    }

    const filesContent = fileContentParts.join('\n\n');
    const promptText = `Vui lòng phân tích các tài liệu sau đây và trích xuất tóm tắt diễn biến vụ việc và yêu cầu của khách hàng.\n\n**Hồ sơ tài liệu đính kèm:**\n${filesContent}`;

    const allParts: Part[] = [...multimodalParts, { text: promptText }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: allParts },
      config: {
        systemInstruction: SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SUMMARY_EXTRACTION_SCHEMA,
        temperature: 0.1,
      },
    });

    if (!response || typeof response.text !== 'string' || !response.text.trim()) {
        throw new Error("AI không thể trích xuất tóm tắt từ hồ sơ.");
    }
    const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
    const result = JSON.parse(jsonText);
    
    return {
        caseSummary: result.caseSummary || '',
        clientRequestSummary: result.clientRequestSummary || ''
    };

  } catch (error) {
    throw handleGeminiError(error, 'trích xuất tóm tắt từ hồ sơ');
  }
};

interface AnalysisUpdateContext {
  report: AnalysisReport;
  stage: LitigationStage;
}

export const analyzeCaseFiles = async (
  files: UploadedFile[],
  query: string,
  updateContext?: AnalysisUpdateContext
): Promise<AnalysisReport> => {
  try {
    const { fileContentParts, multimodalParts } = await getFileContentParts(files);
    const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tài liệu mới nào được cung cấp.';
    const currentDate = new Date().toLocaleDateString('vi-VN');
    let promptText: string;
    const systemInstruction = updateContext ? ANALYSIS_UPDATE_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION;

    if (updateContext) {
      promptText = `Cập nhật báo cáo phân tích sau đây:\n\n**BÁO CÁO HIỆN TẠI:**\n\`\`\`json\n${JSON.stringify(updateContext.report, null, 2)}\n\`\`\`\n\n**THÔNG TIN CẬP NHẬT:**\n- Giai đoạn tố tụng mới: ${updateContext.stage}\n- Yêu cầu cập nhật: "${query}"\n- Ngày hiện tại: ${currentDate}\n- Hồ sơ/Tài liệu mới: ${filesContent}\n\n**YÊU CẦU:**\nHãy tích hợp các thông tin mới và trả về một phiên bản **hoàn chỉnh và được cập nhật** của báo cáo JSON.`;
    } else {
      const effectiveFilesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp nào được tải lên.';
      promptText = `Phân tích thông tin vụ việc và trả về báo cáo JSON.\n\n**THÔNG TIN VỤ VIỆC:**\n\n**A. Bối cảnh & Yêu cầu:**\n- Ngày hiện tại: ${currentDate}.\n- Yêu cầu của luật sư (Mục tiêu phân tích): **${query}**\n\n**B. Hồ sơ tài liệu đính kèm:**\n${effectiveFilesContent}\n\n**YÊU CẦU ĐẦU RA:**\nTrả về báo cáo dưới dạng một đối tượng JSON duy nhất, hợp lệ, tuân thủ cấu trúc đã định nghĩa.`;
    }

    const allParts: Part[] = [...multimodalParts, { text: promptText }];

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

    if (!response || typeof response.text !== 'string' || !response.text.trim()) {
        throw new Error("AI không trả về nội dung phân tích JSON hợp lệ. Phản hồi có thể đã bị chặn.");
    }
    const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
    return JSON.parse(jsonText);
  } catch (error) {
    const context = updateContext ? 'cập nhật phân tích' : 'phân tích hồ sơ';
    throw handleGeminiError(error, context);
  }
};

export const reanalyzeCaseWithCorrections = async (
  correctedReport: AnalysisReport,
  files: UploadedFile[]
): Promise<AnalysisReport> => {
  try {
    const { fileContentParts, multimodalParts } = await getFileContentParts(files);
    const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tài liệu nào được cung cấp.';
    
    // The main context is the corrected report itself.
    const promptText = `**BÁO CÁO ĐÃ ĐƯỢC NGƯỜI DÙNG ĐIỀU CHỈNH (NGUỒN THÔNG TIN CHÍNH):**
\`\`\`json
${JSON.stringify(correctedReport, null, 2)}
\`\`\`

**TÀI LIỆU GỐC (DÙNG ĐỂ THAM KHẢO CHI TIẾT):**
${filesContent}

**YÊU CẦU:**
Dựa trên báo cáo đã được điều chỉnh ở trên làm nguồn thông tin chính xác nhất, hãy tiến hành phân tích lại toàn diện và trả về một đối tượng báo cáo JSON hoàn chỉnh và mới.`;

    const allParts: Part[] = [...multimodalParts, { text: promptText }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: allParts },
      config: {
        systemInstruction: REANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
        temperature: 0.2,
      },
    });

    if (!response || typeof response.text !== 'string' || !response.text.trim()) {
        throw new Error("AI không trả về nội dung phân tích lại JSON hợp lệ.");
    }
    const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
    const newReport = JSON.parse(jsonText);

    // Preserve user-added laws and chat history from the corrected report
    newReport.userAddedLaws = correctedReport.userAddedLaws || [];
    newReport.prospectsChat = correctedReport.prospectsChat || [];
    newReport.gapAnalysisChat = correctedReport.gapAnalysisChat || [];
    newReport.strategyChat = correctedReport.strategyChat || [];
    newReport.resolutionPlanChat = correctedReport.resolutionPlanChat || [];
    newReport.intelligentSearchChat = correctedReport.intelligentSearchChat || [];
    newReport.applicableLawsChat = correctedReport.applicableLawsChat || [];
    newReport.contingencyPlanChat = correctedReport.contingencyPlanChat || [];


    return newReport;
  } catch (error) {
    throw handleGeminiError(error, 'phân tích lại hồ sơ');
  }
};


export const analyzeConsultingCase = async (
    files: UploadedFile[],
    disputeContent: string,
    clientRequest: string
): Promise<ConsultingReport> => {
    try {
        const { fileContentParts, multimodalParts } = await getFileContentParts(files);
        const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp.';
        
        const prompt = `Vui lòng phân tích thông tin dưới đây và trả về báo cáo JSON.\n\nBỐI CẢNH VỤ VIỆC:\n---\n${disputeContent}\n---\n\nYÊU CẦU CỦA KHÁCH HÀNG:\n---\n${clientRequest}\n---\n\nTÀI LIỆU ĐÍNH KÈM:\n---\n${filesContent}\n---`;

        const allParts: Part[] = [...multimodalParts, { text: prompt }];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: allParts },
            config: {
                systemInstruction: CONSULTING_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: CONSULTING_REPORT_SCHEMA,
                temperature: 0.3,
            }
        });
        
        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
            throw new Error("AI không trả về báo cáo tư vấn JSON hợp lệ.");
        }
        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        return JSON.parse(jsonText);
    } catch (error) {
        throw handleGeminiError(error, 'phân tích nghiệp vụ tư vấn');
    }
};


export const generateConsultingDocument = async (
    report: ConsultingReport | null,
    disputeContent: string, 
    request: string
): Promise<string> => {
    try {
        const systemInstruction = `Bạn là một luật sư tư vấn AI tại Việt Nam, chuyên soạn thảo văn bản pháp lý (thư tư vấn, thư yêu cầu). Văn bản phải chuyên nghiệp, rõ ràng, chính xác.`;
        const reportContext = report ? `\n\nBỐI CẢNH ĐÃ PHÂN TÍCH:\n\`\`\`json\n${JSON.stringify(report, null, 2)}\n\`\`\`` : '';
        
        const prompt = `DỰA TRÊN THÔNG TIN SAU:\n\nBỐI CẢNH CHUNG:\n---\n${disputeContent}\n---${reportContext}\n\nYÊU CẦU SOẠN THẢO CỤ THỂ:\n---\n${request}\n---\n\nHÃY SOẠN THẢO VĂN BẢN HOÀN CHỈNH.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.5 }
        });

        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không tạo được nội dung văn bản.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo văn bản tư vấn');
    }
}

export const summarizeText = async (textToSummarize: string, context: 'disputeContent' | 'clientRequest'): Promise<string> => {
    try {
        const contextDescription = context === 'disputeContent' 
            ? "tóm tắt lại bối cảnh, diễn biến chính của một vụ việc pháp lý"
            : "làm rõ và tóm tắt lại yêu cầu hoặc mong muốn chính của khách hàng";

        const systemInstruction = `Bạn là một trợ lý luật sư AI, chuyên đọc hiểu và tóm tắt thông tin do khách hàng cung cấp. Nhiệm vụ của bạn là ${contextDescription}. Hãy viết lại một cách mạch lạc, rõ ràng, chuyên nghiệp và ngắn gọn, giữ lại các ý chính.`;
        
        const prompt = `Vui lòng tóm tắt và làm rõ nội dung sau:\n\n---\n${textToSummarize}\n---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.3 }
        });

        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể tóm tắt nội dung.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tóm tắt nội dung');
    }
};

export const generateContextualDocument = async (
  report: AnalysisReport,
  userRequest: string,
  options: {
    detail: ParagraphGenerationOptions['detail'];
    draftingMode: DraftingMode;
  }
): Promise<string> => {
    try {
        const { detail, draftingMode } = options;
        
        const modeLabel = DRAFTING_MODE_LABELS[draftingMode] || 'Trung lập';
        const detailLabel = detail === 'detailed' ? 'Chi tiết' : 'Ngắn gọn';
        
        const prompt = `
        DỮ LIỆU VỤ VIỆC (JSON):
        \`\`\`json
        ${JSON.stringify(report, null, 2)}
        \`\`\`
        
        YÊU CẦU CỦA LUẬT SƯ:
        "${userRequest}"
        
        HÃY SOẠN THẢO VĂN BẢN VỚI CÁC TIÊU CHÍ SAU:
        - Lập trường Chiến lược: ${modeLabel}
        - Mức độ chi tiết: ${detailLabel}
        
        Soạn thảo văn bản hoàn chỉnh.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction: DOCUMENT_GENERATION_SYSTEM_INSTRUCTION, temperature: 0.5 }
        });
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không tạo được nội dung văn bản.");
        }
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
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không tạo được nội dung văn bản từ mẫu.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo văn bản từ mẫu');
    }
};

export const generateParagraph = async (userRequest: string, options: ParagraphGenerationOptions): Promise<string> => {
  try {
    const systemInstruction = `Bạn là trợ lý luật sư AI chuyên soạn thảo đoạn văn pháp lý theo yêu cầu và các tùy chọn về văn phong.`;
    const prompt = `YÊU CẦU: "${userRequest}"\n\nHÃY SOẠN THẢO MỘT ĐOẠN VĂN THEO CÁC TIÊU CHÍ:\n- Giọng văn: ${options.tone}\n- Mức độ thuật ngữ: ${options.terminology}\n- Mức độ chi tiết: ${options.detail}\n- Định dạng: ${options.outputFormat}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { systemInstruction, temperature: 0.5 }
    });

    if (!response || typeof response.text !== 'string') {
        throw new Error("AI không tạo được nội dung đoạn văn.");
    }
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, 'soạn thảo đoạn văn');
  }
};

export const refineText = async (text: string, mode: 'concise' | 'detailed'): Promise<string> => {
  try {
    const systemInstruction = `Bạn là một biên tập viên AI chuyên nghiệp. Nhiệm vụ của bạn là chỉnh sửa lại văn bản được cung cấp theo một yêu cầu cụ thể (làm cho nó súc tích hơn hoặc chi tiết hơn).`;
    const action = mode === 'concise' ? 'làm cho nó súc tích và cô đọng hơn' : 'mở rộng và làm cho nó chi tiết, rõ ràng hơn';
    const prompt = `VĂN BẢN GỐC:\n---\n${text}\n---\n\nYÊU CẦU: Hãy chỉnh sửa lại văn bản trên để ${action}. Chỉ trả về văn bản đã được chỉnh sửa.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction, temperature: 0.5 }
    });
    
    if (!response || typeof response.text !== 'string') {
        throw new Error("AI không thể hoàn thiện văn bản.");
    }
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, `hoàn thiện văn bản (chế độ: ${mode})`);
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
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể tạo nội dung cho trường này.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'tạo nội dung cho trường này');
    }
};

export const extractInfoFromFile = async (file: UploadedFile, docType: DocType): Promise<Partial<FormData>> => {
    const fieldsToExtract = DOC_TYPE_FIELDS[docType];
    if (!fieldsToExtract || fieldsToExtract.length === 0) return {};
    let contentPart: Part;
    if (isMimeTypeSupportedForDirectAnalysis(file.file.type)) {
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

        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
            throw new Error("AI không thể trích xuất thông tin từ tệp.");
        }
        return JSON.parse(response.text.trim().replace(/^```json\s*|```$/g, ''));
    } catch (error) {
        throw handleGeminiError(error, `trích xuất thông tin từ tệp`);
    }
};

export const generateReportSummary = async (report: AnalysisReport): Promise<string> => {
    try {
        const { quickSummary, ...reportData } = report;
        const systemInstruction = `Bạn là một trợ lý luật sư AI chuyên sâu, có nhiệm vụ tổng hợp một báo cáo phân tích pháp lý chi tiết (dưới dạng JSON) thành một bản tóm tắt vụ việc có cấu trúc rõ ràng theo mẫu được cung cấp. Nhiệm vụ của bạn là trích xuất và suy luận thông tin từ báo cáo JSON để điền vào các mục của mẫu một cách chính xác, đầy đủ và mạch lạc.`;
        
        const prompt = `DỰA TRÊN BÁO CÁO PHÂN TÍCH VỤ VIỆC (JSON) SAU ĐÂY:
\`\`\`json
${JSON.stringify(reportData, null, 2)}
\`\`\`

HÃY SOẠN THẢO MỘT BẢN TÓM TẮT HOÀN CHỈNH THEO CẤU TRÚC MẪU DƯỚI ĐÂY. 
LƯU Ý: Suy luận thông tin từ toàn bộ báo cáo (bao gồm các mô tả văn bản) để điền vào các mục.

---

### BỐI CẢNH VỤ VIỆC ###
*   **Bản chất tranh chấp:** [Điền nội dung từ trường 'legalRelationship']
*   **Các bên liên quan (suy luận):**
    *   Nguyên đơn / Bên A / Bị hại: [Suy luận từ nội dung báo cáo]
    *   Bị đơn / Bên B / Bị cáo: [Suy luận từ nội dung báo cáo]
*   **Tóm tắt diễn biến chính:** [Tóm tắt ngắn gọn các sự kiện chính từ toàn bộ báo cáo]
*   **Tình trạng tố tụng hiện tại:** [Điền nội dung từ trường 'litigationStage']

### LẬP TRƯỜNG & YÊU CẦU CỦA CÁC BÊN (TÓM TẮT) ###
*   **Phía Nguyên đơn/Bên khởi kiện:** [Dựa vào báo cáo, tóm tắt lập trường và yêu cầu của họ]
*   **Phía Bị đơn/Bên bị kiện:** [Dựa vào báo cáo, tóm tắt lập trường và luận điểm phản biện của họ]

### ĐÁNH GIÁ SƠ BỘ & CHIẾN LƯỢC ĐỀ XUẤT CỦA AI ###
*   **Triển vọng vụ việc:**
    *   **Điểm mạnh:** [Liệt kê ngắn gọn 1-2 điểm mạnh chính từ 'caseProspects.strengths']
    *   **Điểm yếu:** [Liệt kê ngắn gọn 1-2 điểm yếu chính từ 'caseProspects.weaknesses']
    *   **Rủi ro:** [Liệt kê ngắn gọn 1-2 rủi ro chính từ 'caseProspects.risks']
*   **Chiến lược đề xuất:** [Tóm tắt chiến lược cốt lõi từ 'proposedStrategy']
*   **Lỗ hổng pháp lý nổi bật:** [Chọn 1-2 lỗ hổng quan trọng nhất từ 'gapAnalysis.legalLoopholes' và tóm tắt lại]

---
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction, temperature: 0.3 }
        });
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể tạo tóm tắt báo cáo.");
        }
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
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể giải thích điều luật.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, `giải thích điều luật "${lawText}"`);
    }
};

export const continueContextualChat = async (
  report: AnalysisReport,
  chatHistory: ChatMessage[],
  newMessage: string,
  contextTitle: string
): Promise<string> => {
  try {
    // Exclude chat histories from the context to prevent redundancy and save tokens
    const { prospectsChat, gapAnalysisChat, strategyChat, resolutionPlanChat, intelligentSearchChat, applicableLawsChat, contingencyPlanChat, ...reportContext } = report;

    const conversationHistoryPrompt = chatHistory
      .map(msg => `${msg.role === 'user' ? 'Luật sư' : 'Trợ lý AI'}: ${msg.content}`)
      .join('\n');

    const prompt = `
BÁO CÁO PHÂN TÍCH VỤ VIỆC (JSON):
\`\`\`json
${JSON.stringify(reportContext, null, 2)}
\`\`\`

BỐI CẢNH THẢO LUẬN HIỆN TẠI:
Bạn đang trao đổi trong mục: "${contextTitle}"

LỊCH SỬ TRAO ĐỔI:
---
${conversationHistoryPrompt}
---

LUẬT SƯ (YÊU CẦU MỚI):
${newMessage}

TRỢ LÝ AI:
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION,
            temperature: 0.7,
        }
    });
    
    if (!response || typeof response.text !== 'string') {
        throw new Error("AI không thể tiếp tục cuộc trò chuyện.");
    }
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, `trao đổi về "${contextTitle}"`);
  }
};

export const intelligentSearchQuery = async (
  report: AnalysisReport,
  files: UploadedFile[],
  chatHistory: ChatMessage[],
  newUserQuery: string
): Promise<string> => {
    try {
        const { fileContentParts, multimodalParts } = await getFileContentParts(files);
        const filesContent = fileContentParts.length > 0 ? fileContentParts.join('\n\n') : 'Không có tệp nào được tải lên.';

        // Exclude chat histories from the context to prevent redundancy
        const { prospectsChat, gapAnalysisChat, strategyChat, resolutionPlanChat, intelligentSearchChat, ...reportContext } = report;

        const conversationHistoryPrompt = chatHistory
          .map(msg => `${msg.role === 'user' ? 'Luật sư' : 'Trợ lý AI'}: ${msg.content}`)
          .join('\n');

        const prompt = `**BỐI CẢNH VỤ VIỆC**

1.  **BÁO CÁO PHÂN TÍCH (JSON):**
    \`\`\`json
    ${JSON.stringify(reportContext, null, 2)}
    \`\`\`

2.  **TÓM TẮT NỘI DUNG TÀI LIỆU:**
    ${filesContent}

**LỊCH SỬ TRAO ĐỔI:**
---
${conversationHistoryPrompt}
---

**CÂU HỎI MỚI CỦA LUẬT SƯ:**
${newUserQuery}
`;

        const allParts: Part[] = [...multimodalParts, { text: prompt }];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: allParts },
            config: {
                systemInstruction: INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION,
                temperature: 0.3,
            }
        });

        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể trả lời câu hỏi của bạn.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'hỏi đáp về hồ sơ');
    }
};

export const generateArgumentText = async (
  selectedNodes: ArgumentNode[]
): Promise<string> => {
    try {
        const context = selectedNodes.map(node => ({
            type: node.type,
            label: node.label,
            content: node.content
        }));

        const prompt = `DỰA TRÊN CÁC YẾU TỐ SAU ĐÂY:\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`\n\nHãy soạn thảo một đoạn văn luận cứ pháp lý hoàn chỉnh.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: ARGUMENT_GENERATION_SYSTEM_INSTRUCTION,
                temperature: 0.6
            }
        });
        
        if (!response || typeof response.text !== 'string') {
            throw new Error("AI không thể tạo luận cứ.");
        }
        return response.text.trim();
    } catch (error) {
        throw handleGeminiError(error, 'soạn thảo luận cứ');
    }
};

export const chatAboutArgumentNode = async (
  node: ArgumentNode,
  chatHistory: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const conversationHistoryPrompt = chatHistory
      .map(msg => `${msg.role === 'user' ? 'Luật sư' : 'Trợ lý AI'}: ${msg.content}`)
      .join('\n');

    const prompt = `
BỐI CẢNH (KHỐI THÔNG TIN TỪ BẢN ĐỒ LẬP LUẬN):
- Loại: ${nodeTypeMeta[node.type]?.label || 'Tùy chỉnh'}
- Nhãn: ${node.label}
- Nội dung: "${node.content}"

LỊCH SỬ TRAO ĐỔI VỀ KHỐI NÀY:
---
${conversationHistoryPrompt}
---

LUẬT SƯ (YÊU CẦU MỚI):
${newMessage}

TRỢ LÝ AI:
`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION,
            temperature: 0.7,
        }
    });

    if (!response || typeof response.text !== 'string') {
        throw new Error("AI không thể tiếp tục cuộc trò chuyện.");
    }
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error, `trao đổi về luận cứ "${node.label}"`);
  }
};

export const analyzeOpponentArguments = async (
    report: AnalysisReport,
    files: UploadedFile[],
    opponentArgumentsText: string
): Promise<OpponentArgument[]> => {
    try {
        const { fileContentParts, multimodalParts } = await getFileContentParts(files);
        const filesContent = fileContentParts.join('\n\n');
        // Exclude potentially large/recursive fields from the main report context to save tokens
        const { argumentGraph, opponentAnalysis, ...reportContext } = report;

        const promptText = `
**BỐI CẢNH VỤ VIỆC (HỒ SƠ CỦA KHÁCH HÀNG):**
1.  **Báo cáo Phân tích (JSON):**
    \`\`\`json
    ${JSON.stringify(reportContext, null, 2)}
    \`\`\`
2.  **Tóm tắt Tài liệu Gốc:**
    ${filesContent}

**LẬP LUẬN CỦA ĐỐI PHƯƠNG CẦN PHÂN TÍCH:**
---
${opponentArgumentsText}
---

**YÊU CẦU:**
Dựa vào toàn bộ bối cảnh vụ việc của khách hàng, hãy phân tích các lập luận của đối phương và trả về kết quả dưới dạng một mảng JSON.
`;
        const allParts: Part[] = [...multimodalParts, { text: promptText }];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: allParts },
            config: {
                systemInstruction: OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: OPPONENT_ANALYSIS_SCHEMA,
                temperature: 0.4,
            }
        });
        
        if (!response || typeof response.text !== 'string' || !response.text.trim()) {
            throw new Error("AI không trả về kết quả phân tích lập luận đối phương.");
        }
        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        return JSON.parse(jsonText);
    } catch (error) {
        throw handleGeminiError(error, 'phân tích lập luận của đối phương');
    }
};
