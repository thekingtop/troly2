import { Type } from "@google/genai";
import type { FileCategory, DocType } from "./types";

export const fileCategoryLabels: Record<FileCategory, string> = {
    Uncategorized: 'Chưa phân loại',
    Contract: 'Hợp đồng / Thỏa thuận',
    Correspondence: 'Email / Tin nhắn',
    Minutes: 'Biên bản làm việc',
    Image: 'Hình ảnh / Sơ đồ',
    Evidence: 'Chứng cứ khác',
};

export const DOC_TYPE_FIELDS: Partial<Record<DocType, string[]>> = {
  legalServiceContract: [
    "lawFirmName", "lawFirmAddress", "lawFirmTaxCode", "lawFirmRep",
    "clientName", "clientId", "clientAddress", "clientPhone",
    "caseSummary", "clientRequest", "feeAmount", "paymentTerms", "scopeOfWork"
  ],
  demandLetter: [
    "lawFirmName", "clientName", "recipientName", "recipientAddress", "subject", "caseSummary", "demands", "deadline"
  ],
  powerOfAttorney: [
    "principalName", "principalDob", "principalId", "principalIdIssueDate", "principalIdIssuePlace", "principalAddress",
    "agentName", "agentDob", "agentId", "agentIdIssueDate", "agentIdIssuePlace", "agentAddress", "scope", "term", "location"
  ],
  lawsuit: [
    "courtName", "disputeType", "plaintiffName", "plaintiffId", "plaintiffAddress", "plaintiffPhone",
    "defendantName", "defendantAddress", "caseContent", "requests", "evidence"
  ],
  divorcePetition: [
      "courtName", "petitionerName", "petitionerId", "petitionerAddress", "respondentName", "respondentAddress", "marriageInfo", "reason", "childrenInfo", "propertyInfo"
  ],
  enforcementPetition: [
      "enforcementAgency", "creditorName", "creditorId", "creditorAddress", "debtorName", "debtorAddress", "judgmentDetails", "enforcementContent"
  ],
  will: [
      "testatorName", "testatorDob", "testatorId", "testatorAddress", "willContent", "executor", "witnesses", "location", "willDate", "willYear"
  ]
};


export const SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI xuất sắc tại Việt Nam, được đào tạo chuyên sâu để phân tích hồ sơ vụ việc. Nhiệm vụ của bạn là nhận các thông tin, tài liệu thô và trả về một báo cáo phân tích có cấu trúc JSON chặt chẽ.

QUY TẮC BẮT BUỘC:
1.  **Tư duy như luật sư:** Phân tích logic, xác định đúng quan hệ pháp luật và các vấn đề pháp lý cốt lõi.
2.  **Tổng hợp thông tin:** Nhiệm vụ quan trọng nhất của bạn là xâu chuỗi các sự kiện, dữ liệu từ nhiều tài liệu khác nhau (hợp đồng, email, biên bản) để tạo ra một dòng thời gian và bối cảnh vụ việc hoàn chỉnh. Hãy đặc biệt chú ý đến các mâu thuẫn hoặc điểm không nhất quán giữa các tài liệu.
3.  **Hiệu lực văn bản:** Khi viện dẫn cơ sở pháp lý, phải kiểm tra và đảm bảo văn bản đó có hiệu lực tại thời điểm xảy ra vụ việc. Luôn ưu tiên áp dụng văn bản pháp luật chuyên ngành trước, sau đó mới đến các văn bản chung.
4.  **Bám sát dữ liệu:** Mọi phân tích và nhận định phải dựa hoàn toàn vào các thông tin, tài liệu được cung cấp. Nếu thông tin không đủ, hãy chỉ ra đó là "lỗ hổng thông tin".
5.  **Chú ý đến loại tài liệu:** Phân tích nội dung của mỗi tài liệu trong bối cảnh loại tài liệu đó (ví dụ: 'Hợp đồng' có giá trị pháp lý cao hơn 'Email trao đổi').
6.  **JSON Output:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác bên ngoài đối tượng JSON đó.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI cao cấp, đang xem xét lại một hồ sơ vụ việc đã được phân tích sơ bộ. Vụ việc hiện đã chuyển sang một giai đoạn tố tụng mới. Nhiệm vụ của bạn là:
1.  **Tái tổng hợp:** Tích hợp các thông tin/tài liệu mới (nếu có) vào bối cảnh chung của vụ việc từ báo cáo hiện tại.
2.  **Phân tích lại:** Dựa trên bối cảnh đã được cập nhật và giai đoạn tố tụng mới, đánh giá lại toàn bộ các mục của báo cáo.
3.  **Tập trung vào Chiến lược:** Trọng tâm chính là phải xây dựng lại mục "proposedStrategy" (Chiến lược Đề xuất) để nó trở nên cực kỳ chi tiết, cụ thể và phù hợp với giai đoạn tố tụng mới này.
4.  **Giữ nguyên Cấu trúc:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hoàn chỉnh, hợp lệ, tuân thủ đúng cấu trúc đã cho, không chứa bất kỳ văn bản nào khác bên ngoài.
`;

export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    legalRelationship: {
      type: Type.STRING,
      description: "Xác định quan hệ pháp luật chính (ví dụ: Tranh chấp hợp đồng mua bán, Tranh chấp thừa kế...)"
    },
    coreLegalIssues: {
      type: Type.ARRAY,
      description: "Một mảng chứa các chuỗi mô tả các vấn đề pháp lý cốt lõi.",
      items: { type: Type.STRING }
    },
    applicableLaws: {
      type: Type.ARRAY,
      description: "Một mảng các đối tượng, mỗi đối tượng chứa tên văn bản và danh sách các điều luật liên quan.",
      items: {
        type: Type.OBJECT,
        properties: {
          documentName: { type: Type.STRING, description: "Tên văn bản pháp luật (ví dụ: Bộ luật Dân sự 2015)" },
          articles: {
            type: Type.ARRAY,
            description: "Danh sách các điều luật áp dụng từ văn bản trên.",
            items: {
              type: Type.OBJECT,
              properties: {
                articleNumber: { type: Type.STRING, description: "Số hiệu điều luật (ví dụ: 'Điều 328')" },
                summary: { type: Type.STRING, description: "Tóm tắt ngắn gọn nội dung cốt lõi của điều luật." }
              },
              required: ['articleNumber', 'summary']
            }
          }
        },
        required: ['documentName', 'articles']
      }
    },
    gapAnalysis: {
      type: Type.OBJECT,
      description: "Phân tích các lỗ hổng thông tin và đề xuất hành động.",
      properties: {
        missingInformation: {
          type: Type.ARRAY,
          description: "Một mảng các chuỗi mô tả thông tin hoặc chứng cứ còn thiếu.",
          items: { type: Type.STRING }
        },
        recommendedActions: {
          type: Type.ARRAY,
          description: "Một mảng các chuỗi đề xuất hành động cụ thể để thu thập thông tin còn thiếu.",
          items: { type: Type.STRING }
        }
      },
      required: ['missingInformation', 'recommendedActions']
    },
    caseProspects: {
      type: Type.OBJECT,
      description: "Đánh giá triển vọng của vụ việc.",
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm mạnh của vụ việc." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm yếu của vụ việc." },
        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các rủi ro tiềm ẩn." }
      },
      required: ['strengths', 'weaknesses', 'risks']
    },
    proposedStrategy: {
      type: Type.OBJECT,
      description: "Chiến lược đề xuất để giải quyết vụ việc.",
      properties: {
        preLitigation: {
          type: Type.ARRAY,
          description: "Các bước chiến lược trong giai đoạn tiền tố tụng.",
          items: { type: Type.STRING }
        },
        litigation: {
          type: Type.ARRAY,
          description: "Các bước chiến lược trong giai đoạn tố tụng.",
          items: { type: Type.STRING }
        }
      },
      required: ['preLitigation', 'litigation']
    }
  },
  required: [
    "legalRelationship",
    "coreLegalIssues",
    "applicableLaws",
    "gapAnalysis",
    "caseProspects",
    "proposedStrategy"
  ],
};

export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một Trợ lý Pháp lý AI chuyên sâu. Nhiệm vụ của bạn là:
1.  Tiếp nhận một đối tượng JSON chứa toàn bộ báo cáo phân tích vụ việc.
2.  Tiếp nhận một yêu cầu cụ thể từ luật sư về loại văn bản cần soạn thảo.
3.  Dựa vào toàn bộ bối cảnh từ báo cáo phân tích, hãy soạn thảo văn bản được yêu cầu một cách chuyên nghiệp, đầy đủ và chính xác theo văn phong pháp lý Việt Nam.
`;