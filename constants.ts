import { Type } from "@google/genai";
import type { FileCategory, DocType, LitigationType, LitigationStage } from "./types";

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
1.  **Xác định Giai đoạn Tố tụng:** Dựa vào các tài liệu (bản án, đơn kháng cáo, quyết định thi hành án...), hãy xác định vụ việc đang ở giai đoạn tố tụng nào và điền giá trị (key) tương ứng vào trường 'litigationStage'. Ví dụ: nếu có bản án sơ thẩm và đơn kháng cáo, giai đoạn là 'appeal'. Nếu chỉ có yêu cầu tư vấn, giai đoạn là 'consulting'.
2.  **Tư duy như luật sư:** Phân tích logic, xác định đúng quan hệ pháp luật và các vấn đề pháp lý cốt lõi.
3.  **Tổng hợp thông tin:** Xâu chuỗi các sự kiện, dữ liệu từ nhiều tài liệu khác nhau để tạo ra một bối cảnh vụ việc hoàn chỉnh. Hãy đặc biệt chú ý đến các mâu thuẫn.
4.  **Tìm kiếm Lỗ hổng Pháp lý:** Chủ động tìm kiếm các 'lỗ hổng' pháp lý — không chỉ là thông tin thiếu, mà là các điểm yếu trong lập luận, các quy định mâu thuẫn, hoặc các kẽ hở trong hợp đồng/tài liệu mà đối phương có thể khai thác.
5.  **Tư duy Chiến lược:** Không chỉ tóm tắt. Phải xây dựng một chiến lược hành động chi tiết trong mục "proposedStrategy". Chiến lược này BẮT BUỘC phải: a) Tận dụng các "strengths" (điểm mạnh); b) Đề xuất giải pháp giảm thiểu "weaknesses" (điểm yếu) và "risks" (rủi ro); c) Khai thác các "legalLoopholes" (lỗ hổng pháp lý) đã được xác định để tạo lợi thế hoặc tấn công lập luận của đối phương.
6.  **Hiệu lực văn bản:** Khi viện dẫn cơ sở pháp lý, phải kiểm tra và đảm bảo văn bản đó có hiệu lực tại thời điểm xảy ra vụ việc. Luôn ưu tiên áp dụng văn bản pháp luật chuyên ngành trước, sau đó mới đến các văn bản chung.
7.  **Bám sát dữ liệu:** Mọi phân tích và nhận định phải dựa hoàn toàn vào các thông tin, tài liệu được cung cấp. Nếu thông tin không đủ, hãy chỉ ra đó là "lỗ hổng thông tin".
8.  **Chú ý đến loại tài liệu:** Phân tích nội dung của mỗi tài liệu trong bối cảnh loại tài liệu đó (ví dụ: 'Hợp đồng' có giá trị pháp lý cao hơn 'Email trao đổi').
9.  **JSON Output:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác bên ngoài đối tượng JSON đó.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI cao cấp, đang xem xét lại một hồ sơ vụ việc đã được phân tích sơ bộ. Vụ việc hiện đã chuyển sang một giai đoạn tố tụng mới. Nhiệm vụ của bạn là:
1.  **Tái tổng hợp:** Tích hợp các thông tin/tài liệu mới (nếu có) vào bối cảnh chung của vụ việc từ báo cáo hiện tại.
2.  **Phân tích lại:** Dựa trên bối cảnh đã được cập nhật và giai đoạn tố tụng mới, đánh giá lại toàn bộ các mục của báo cáo, đặc biệt là mục **CaseProspects** (Triển vọng Vụ việc) và **GapAnalysis** (Phân tích Lỗ hổng, bao gồm cả các lỗ hổng pháp lý).
3.  **Tập trung vào Chiến lược:** Trọng tâm chính là phải xây dựng lại mục "proposedStrategy". Chiến lược mới phải cực kỳ chi tiết, phù hợp với giai đoạn tố tụng mới, và phải dựa trên việc đánh giá lại các điểm mạnh, điểm yếu, rủi ro và lỗ hổng pháp lý trong bối cảnh mới.
4.  **Giữ nguyên Cấu trúc:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hoàn chỉnh, hợp lệ, tuân thủ đúng cấu trúc đã cho, không chứa bất kỳ văn bản nào khác bên ngoài.
`;

export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    litigationStage: {
      type: Type.STRING,
      description: "Giai đoạn tố tụng của vụ việc, xác định từ tài liệu. Phải là một trong các giá trị: 'consulting', 'firstInstance', 'appeal', 'cassation', 'enforcement', 'prosecutionRequest', 'prosecution', 'dialogue', 'closed'."
    },
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
      description: "Phân tích các lỗ hổng thông tin, lỗ hổng pháp lý và đề xuất hành động.",
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
        },
        legalLoopholes: {
          type: Type.ARRAY,
          description: "Một mảng các chuỗi mô tả các lỗ hổng pháp lý tiềm ẩn, điểm yếu trong lập luận, hoặc các quy định mâu thuẫn có thể bị đối phương khai thác.",
          items: { type: Type.STRING }
        }
      },
      required: ['missingInformation', 'recommendedActions', 'legalLoopholes']
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
    "litigationStage",
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

export const CONSULTING_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI chuyên nghiệp tại Việt Nam. Nhiệm vụ của bạn là phân tích thông tin ban đầu của một vụ việc tư vấn và trả về một báo cáo JSON có cấu trúc để hỗ trợ luật sư.

QUY TẮC:
1.  **Xác định Điểm chính:** Đọc kỹ thông tin và xác định những điểm mấu chốt, quan trọng nhất mà luật sư cần trao đổi lại với khách hàng để làm rõ hoặc thu thập thêm.
2.  **Phân loại Vụ việc:** Dựa trên bản chất của tranh chấp, phân loại vụ việc vào một trong ba loại: 'civil' (dân sự), 'criminal' (hình sự), hoặc 'administrative' (hành chính). Nếu không đủ thông tin, trả về 'unknown'.
3.  **Nhận định Giai đoạn Sơ bộ:** Mô tả ngắn gọn giai đoạn hiện tại của vụ việc (ví dụ: "Tư vấn ban đầu", "Chuẩn bị tiền tố tụng", "Yêu cầu đòi nợ lần đầu").
4.  **Đề xuất Văn bản:** Dựa trên phân tích, đề xuất 2-3 loại văn bản pháp lý mà luật sư có thể cần soạn thảo tiếp theo (ví dụ: "Thư tư vấn", "Thư yêu cầu thanh toán", "Đơn trình báo").
5.  **Output JSON:** Phản hồi BẮT BUỘC phải là một đối tượng JSON hợp lệ duy nhất.
`;

export const CONSULTING_REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    discussionPoints: {
      type: Type.ARRAY,
      description: "Một mảng các chuỗi, mỗi chuỗi là một điểm quan trọng luật sư cần trao đổi với khách hàng.",
      items: { type: Type.STRING }
    },
    caseType: {
      type: Type.STRING,
      description: "Phân loại vụ việc. Phải là một trong các giá trị: 'civil', 'criminal', 'administrative', 'unknown'."
    },
    preliminaryStage: {
      type: Type.STRING,
      description: "Mô tả ngắn gọn giai đoạn sơ bộ của vụ việc."
    },
    suggestedDocuments: {
      type: Type.ARRAY,
      description: "Một mảng các chuỗi, mỗi chuỗi là tên một văn bản được đề xuất soạn thảo.",
      items: { type: Type.STRING }
    }
  },
  required: ["discussionPoints", "caseType", "preliminaryStage", "suggestedDocuments"]
};


export const litigationStagesByType: Record<LitigationType, { value: LitigationStage; label: string }[]> = {
    civil: [
        { value: 'consulting', label: 'Tư vấn ban đầu' },
        { value: 'firstInstance', label: 'Sơ thẩm' },
        { value: 'appeal', label: 'Phúc thẩm' },
        { value: 'cassation', label: 'Giám đốc thẩm/Tái thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã đóng' },
    ],
    criminal: [
        { value: 'consulting', label: 'Tư vấn ban đầu' },
        { value: 'prosecutionRequest', label: 'Khởi tố, Điều tra' },
        { value: 'prosecution', label: 'Truy tố' },
        { value: 'firstInstance', label: 'Xét xử Sơ thẩm' },
        { value: 'appeal', label: 'Xét xử Phúc thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã đóng' },
    ],
    administrative: [
        { value: 'consulting', label: 'Tư vấn ban đầu' },
        { value: 'dialogue', label: 'Đối thoại' },
        { value: 'firstInstance', label: 'Sơ thẩm' },
        { value: 'appeal', label: 'Phúc thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã đóng' },
    ],
};

export const getStageLabel = (type: LitigationType | null, stage: LitigationStage): string => {
    if (!type) return 'Chưa xác định';
    const stageOptions = litigationStagesByType[type] || [];
    return stageOptions.find(opt => opt.value === stage)?.label || 'Chưa xác định';
};


export const litigationStageSuggestions: Record<LitigationStage, { actions: string[]; documents: string[] }> = {
  prosecutionRequest: {
    actions: [
      "Hỗ trợ thân chủ làm việc với cơ quan điều tra.",
      "Thu thập và củng cố chứng cứ.",
      "Yêu cầu giám định pháp y hoặc các giám định chuyên môn khác.",
    ],
    documents: [
      "Đơn đề nghị mời luật sư tham gia tố tụng",
      "Đơn yêu cầu sao chụp hồ sơ, tài liệu vụ án",
      "Văn bản trình bày ý kiến của luật sư",
      "Đơn khiếu nại quyết định của Điều tra viên",
    ],
  },
  prosecution: {
    actions: [
      "Nghiên cứu kỹ Kết luận điều tra và Cáo trạng.",
      "Phân tích, tìm các mâu thuẫn, vi phạm tố tụng.",
      "Trao đổi với thân chủ về nội dung Cáo trạng.",
    ],
    documents: [
      "Bản kiến nghị gửi Viện kiểm sát",
      "Đơn đề nghị đình chỉ vụ án/bị can",
      "Đơn yêu cầu trả hồ sơ để điều tra bổ sung",
    ],
  },
  firstInstance: {
    actions: [
      "Xây dựng Luận cứ bào chữa/bảo vệ chi tiết.",
      "Chuẩn bị hệ thống câu hỏi cho phiên tòa.",
      "Dự kiến các tình huống pháp lý có thể phát sinh tại tòa.",
    ],
    documents: [
      "Bản luận cứ bào chữa",
      "Bản luận cứ bảo vệ quyền và lợi ích hợp pháp",
      "Dàn ý câu hỏi tại phiên tòa",
      "Yêu cầu triệu tập người làm chứng/người liên quan",
    ],
  },
  appeal: {
    actions: [
        "Nghiên cứu bản án sơ thẩm, xác định căn cứ kháng cáo.",
        "Soạn thảo đơn kháng cáo trong thời hạn luật định.",
        "Bổ sung, củng cố chứng cứ cho phiên tòa phúc thẩm."
    ],
    documents: [
        "Đơn kháng cáo",
        "Bản luận cứ bào chữa/bảo vệ cho phiên tòa phúc thẩm",
        "Bản trình bày quan điểm bổ sung",
    ],
  },
  enforcement: {
    actions: [
        "Theo dõi và đôn đốc quá trình thi hành án.",
        "Làm việc với Chấp hành viên và Cơ quan thi hành án.",
        "Hỗ trợ thân chủ thực hiện các quyền và nghĩa vụ."
    ],
    documents: [
        "Đơn yêu cầu thi hành án",
        "Đơn khiếu nại về thi hành án",
        "Đơn đề nghị tạm hoãn/miễn/giảm thi hành án",
    ],
  },
  consulting: { actions: [], documents: [] },
  closed: { actions: [], documents: [] },
  investigation: { actions: [], documents: [] },
  cassation: { actions: [], documents: [] },
  dialogue: { actions: [], documents: [] },
};