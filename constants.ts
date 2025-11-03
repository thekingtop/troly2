
import { Type } from "@google/genai";
import type { FileCategory, DocType, LitigationType, LitigationStage, ArgumentNodeType, DraftingMode } from "./types";

export const fileCategoryLabels: Record<FileCategory, string> = {
    Uncategorized: 'Chưa phân loại',
    Contract: 'Hợp đồng / Thỏa thuận',
    Correspondence: 'Email / Tin nhắn',
    Minutes: 'Biên bản làm việc',
    Image: 'Hình ảnh / Sơ đồ',
    Evidence: 'Chứng cứ khác',
};

export const nodeTypeMeta: Record<ArgumentNodeType, { color: string, label: string }> = {
    legalIssue: { color: 'bg-red-100 border-red-400', label: 'Vấn đề pháp lý' },
    strength: { color: 'bg-green-100 border-green-400', label: 'Điểm mạnh' },
    weakness: { color: 'bg-amber-100 border-amber-400', label: 'Điểm yếu' },
    risk: { color: 'bg-orange-100 border-orange-400', label: 'Rủi ro' },
    timelineEvent: { color: 'bg-sky-100 border-sky-400', label: 'Sự kiện' },
    applicableLaw: { color: 'bg-indigo-100 border-indigo-400', label: 'Cơ sở pháp lý' },
    loophole: { color: 'bg-purple-100 border-purple-400', label: 'Lỗ hổng pháp lý' },
    custom: { color: 'bg-slate-100 border-slate-400', label: 'Ghi chú' },
};

export const DRAFTING_MODE_LABELS: Record<DraftingMode, string> = {
    assertive: 'Lập luận Tấn công / Chủ động',
    rebuttal: 'Phản bác Sắc bén (cho Kháng cáo)',
    persuasive: 'Lập luận Thuyết phục / Hòa giải',
    formal: 'Trang trọng / Trung lập',
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
  ],
  statementOfOpinion: [
    "courtName", "presenterName", "presenterDob", "presenterId", "presenterIdIssueDate", "presenterIdIssuePlace", "presenterAddress", "presenterProceduralStatus", 
    "representedPartyName", "representedPartyAddress", "representedPartyLegalRep", 
    "caseNumber", "caseAcceptanceDate", "caseName", "plaintiffName", "defendantName", 
    "caseSummary", "disputeEvent", "postEventActions", 
    "firstInstanceSummary", "furtherProceedings", "currentStatus", 
    "argument1Title", "argument1Basis", "argument1Analysis", 
    "argument2Title", "argument2Basis", "argument2Analysis", 
    "argument3Title", "argument3Basis", "argument3Analysis", 
    "finalConfirmation", "courtRequest", "location", "documentDate"
  ],
  defenseStatement: [
    "courtName", "caseNumber", "plaintiffName", "defendantName", "defendantAddress",
    "caseSummary",
    "plaintiffArguments",
    "rebuttalArgument1", "rebuttalEvidence1",
    "rebuttalArgument2", "rebuttalEvidence2",
    "mitigatingCircumstances",
    "defendantRequest",
    "location", "documentDate"
  ],
};

export const FIELD_LABELS: Record<string, string> = {
  // legalServiceContract
  lawFirmName: "Tên tổ chức hành nghề luật sư",
  lawFirmAddress: "Địa chỉ",
  lawFirmTaxCode: "Mã số thuế",
  lawFirmRep: "Người đại diện",
  clientName: "Tên khách hàng",
  clientId: "Số CCCD/CMND/Hộ chiếu",
  clientAddress: "Địa chỉ thường trú",
  clientPhone: "Số điện thoại",
  caseSummary: "Tóm tắt nội dung vụ việc",
  clientRequest: "Yêu cầu của khách hàng",
  feeAmount: "Phí dịch vụ",
  paymentTerms: "Điều khoản thanh toán",
  scopeOfWork: "Phạm vi công việc",
  // demandLetter
  recipientName: "Tên người nhận",
  recipientAddress: "Địa chỉ người nhận",
  subject: "Về việc",
  demands: "Các yêu cầu",
  deadline: "Thời hạn thực hiện",
  // powerOfAttorney
  principalName: "Tên người ủy quyền",
  principalDob: "Ngày sinh",
  principalId: "Số CCCD/CMND (Người ủy quyền)",
  principalIdIssueDate: "Ngày cấp",
  principalIdIssuePlace: "Nơi cấp",
  principalAddress: "Địa chỉ thường trú (Người ủy quyền)",
  agentName: "Tên người được ủy quyền",
  agentDob: "Ngày sinh (Người được ủy quyền)",
  agentId: "Số CCCD/CMND (Người được ủy quyền)",
  agentIdIssueDate: "Ngày cấp (Người được ủy quyền)",
  agentIdIssuePlace: "Nơi cấp (Người được ủy quyền)",
  agentAddress: "Địa chỉ thường trú (Người được ủy quyền)",
  scope: "Phạm vi ủy quyền",
  term: "Thời hạn ủy quyền",
  location: "Địa điểm",
  // lawsuit
  courtName: "Tên Tòa án",
  disputeType: "Loại tranh chấp",
  plaintiffName: "Tên người khởi kiện (Nguyên đơn)",
  plaintiffId: "Số CCCD/CMND (Nguyên đơn)",
  plaintiffAddress: "Địa chỉ (Nguyên đơn)",
  plaintiffPhone: "Số điện thoại (Nguyên đơn)",
  defendantName: "Tên người bị kiện (Bị đơn)",
  defendantAddress: "Địa chỉ (Bị đơn)",
  caseContent: "Nội dung vụ án",
  requests: "Yêu cầu Tòa án giải quyết",
  evidence: "Chứng cứ kèm theo",
  // divorcePetition
  petitionerName: "Tên người làm đơn",
  petitionerId: "Số CCCD/CMND (Người làm đơn)",
  petitionerAddress: "Địa chỉ (Người làm đơn)",
  respondentName: "Tên người bị yêu cầu",
  respondentAddress: "Địa chỉ (Người bị yêu cầu)",
  marriageInfo: "Thông tin hôn nhân (số GCN, ngày, nơi ĐK)",
  reason: "Lý do ly hôn",
  childrenInfo: "Thông tin về con chung",
  propertyInfo: "Thông tin về tài sản chung",
  // enforcementPetition
  enforcementAgency: "Tên Cơ quan Thi hành án",
  creditorName: "Tên người được thi hành án",
  creditorId: "Số CCCD/CMND (Người được THA)",
  creditorAddress: "Địa chỉ (Người được THA)",
  debtorName: "Tên người phải thi hành án",
  debtorAddress: "Địa chỉ (Người phải THA)",
  judgmentDetails: "Thông tin bản án/quyết định",
  enforcementContent: "Nội dung yêu cầu thi hành án",
  // will
  testatorName: "Tên người lập di chúc",
  testatorDob: "Ngày sinh (Người lập di chúc)",
  testatorId: "Số CCCD/CMND (Người lập di chúc)",
  testatorAddress: "Địa chỉ (Người lập di chúc)",
  willContent: "Nội dung di chúc",
  executor: "Người thực hiện di chúc",
  witnesses: "Người làm chứng",
  willDate: "Ngày lập di chúc",
  willYear: "Năm lập di chúc",
  // statementOfOpinion
  presenterName: "Tên người trình bày",
  presenterDob: "Ngày sinh",
  presenterId: "Số CCCD/CMND",
  presenterIdIssueDate: "Ngày cấp",
  presenterIdIssuePlace: "Nơi cấp",
  presenterAddress: "Địa chỉ",
  presenterProceduralStatus: "Tư cách tham gia tố tụng",
  representedPartyName: "Tên người được đại diện/bảo vệ",
  representedPartyAddress: "Địa chỉ người được đại diện",
  representedPartyLegalRep: "Đại diện pháp luật (nếu có)",
  caseNumber: "Số thụ lý vụ án",
  caseAcceptanceDate: "Ngày thụ lý",
  caseName: "Tên vụ án",
  firstInstanceSummary: "Tóm tắt bản án/quyết định sơ thẩm",
  furtherProceedings: "Diễn biến sau sơ thẩm",
  currentStatus: "Tình trạng hiện tại của vụ việc",
  argument1Title: "Luận điểm 1 - Tiêu đề",
  argument1Basis: "Luận điểm 1 - Cơ sở thực tế",
  argument1Analysis: "Luận điểm 1 - Phân tích pháp lý",
  argument2Title: "Luận điểm 2 - Tiêu đề",
  argument2Basis: "Luận điểm 2 - Cơ sở thực tế",
  argument2Analysis: "Luận điểm 2 - Phân tích pháp lý",
  argument3Title: "Luận điểm 3 - Tiêu đề",
  argument3Basis: "Luận điểm 3 - Cơ sở thực tế",
  argument3Analysis: "Luận điểm 3 - Phân tích pháp lý",
  finalConfirmation: "Khẳng định cuối cùng",
  courtRequest: "Đề nghị với Tòa án",
  documentDate: "Ngày làm văn bản",
  disputeEvent: "Sự kiện pháp lý phát sinh tranh chấp",
  postEventActions: "Hành động của các bên sau sự kiện",
  // defenseStatement
  defendantRequest: "Yêu cầu của Bị đơn",
  plaintiffArguments: "Các luận điểm chính của Nguyên đơn cần phản bác",
  rebuttalArgument1: "Luận điểm phản bác 1",
  rebuttalEvidence1: "Cơ sở thực tế & pháp lý cho luận điểm 1",
  rebuttalArgument2: "Luận điểm phản bác 2",
  rebuttalEvidence2: "Cơ sở thực tế & pháp lý cho luận điểm 2",
  mitigatingCircumstances: "Các tình tiết giảm nhẹ / minh oan",
};


export const SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI xuất sắc tại Việt Nam, được đào tạo chuyên sâu để phân tích hồ sơ vụ việc. Nhiệm vụ của bạn là nhận các thông tin, tài liệu thô và trả về một báo cáo phân tích có cấu trúc JSON chặt chẽ.

QUY TRÌNH THỰC HIỆN:
ĐẦU TIÊN, hãy tự mình đọc, hiểu và tóm tắt toàn bộ nội dung từ các tài liệu được cung cấp để nắm bắt bối cảnh vụ việc, diễn biến sự kiện, và yêu cầu của các bên. SAU ĐÓ, tạo ra một bản tóm tắt vắn tắt (khoảng 5-7 câu) về vụ việc và điền vào trường 'editableCaseSummary'.
KẾ TIẾP, dựa trên sự hiểu biết tổng thể đó và 'Yêu cầu của luật sư', hãy thực hiện các bước phân tích sau đây và điền vào cấu trúc JSON.

QUY TẮC PHÂN TÍCH BẮT BUỘC:
1.  **QUY TẮC XÁC ĐỊNH THÂN CHỦ (CỰC KỲ QUAN TRỌNG):** NẾU trong yêu cầu có cung cấp "CRITICAL ANALYSIS DIRECTIVE" về vị trí của thân chủ (người bên TRÁI hoặc PHẢI trong tin nhắn), bạn BẮT BUỘC phải tuân thủ tuyệt đối chỉ thị này. TOÀN BỘ báo cáo, đặc biệt là 'caseTimeline', 'coreLegalIssues', 'caseProspects', và 'proposedStrategy' PHẢI được xây dựng từ góc nhìn BẢO VỆ quyền lợi cho người ở vị trí đã được chỉ định. Chỉ thị này có giá trị cao nhất và GHI ĐÈ mọi suy luận khác về việc ai là thân chủ.
2.  **Xây dựng DÒNG THỜI GIAN VỤ VIỆC (QUAN TRỌNG):** Từ tất cả các tài liệu, trích xuất mọi sự kiện quan trọng có ngày tháng cụ thể. Sắp xếp chúng theo trình tự thời gian và điền vào trường 'caseTimeline'. Đối với mỗi sự kiện, BẮT BUỘC phải có: ngày tháng (theo định dạng YYYY-MM-DD), mô tả sự kiện, tên tài liệu nguồn, và đánh giá mức độ quan trọng.
3.  **Xác định Giai đoạn Tố tụng:** Dựa vào các tài liệu (bản án, đơn kháng cáo, quyết định thi hành án...), hãy xác định vụ việc đang ở giai đoạn tố tụng nào và điền giá trị (key) tương ứng vào trường 'litigationStage'. Ví dụ: nếu có bản án sơ thẩm và đơn kháng cáo, giai đoạn là 'appeal'. Nếu chỉ có yêu cầu tư vấn, giai đoạn là 'consulting'.
4.  **Xác định Tư cách Tố tụng:** Dựa trên nội dung hồ sơ, xác định rõ tư cách tham gia tố tụng của từng bên (Nguyên đơn, Bị đơn, Người có quyền lợi và nghĩa vụ liên quan, Bị hại, Bị cáo, v.v.) và điền thông tin vào trường 'proceduralStatus'.
5.  **Tư duy như luật sư:** Phân tích logic, xác định đúng quan hệ pháp luật và các vấn đề pháp lý cốt lõi.
6.  **TÌM KIẾM LỖ HỔNG PHÁP LÝ (CỰC KỲ QUAN TRỌNG):**
    Chủ động phân tích và xác định các "lỗ hổng pháp lý tiềm ẩn" theo các loại và ví dụ chi tiết sau đây. Đây là phần quan trọng nhất trong phân tích của bạn, và phải được điền vào mục 'legalLoopholes'.
    
    **6.1. Lỗ hổng trong Hợp đồng và các Thỏa thuận:**
    - **Điều khoản mơ hồ, đa nghĩa:**
      - AI cần tìm: Các thuật ngữ quan trọng, định nghĩa chuyên ngành (ví dụ: 'hoàn thành', 'chất lượng đạt chuẩn', 'thời gian hợp lý', 'bên liên quan', 'thực hiện tốt nhất') được sử dụng nhưng không có định nghĩa rõ ràng đi kèm trong phần 'Giải thích từ ngữ' hoặc điều khoản định nghĩa.
      - Các cụm từ mang tính định tính, chủ quan mà không có tiêu chí đo lường hoặc tham chiếu cụ thể.
      - Ví dụ gợi ý cho AI: Nếu thấy cụm từ 'thanh toán trong vòng 10 ngày sau khi dự án hoàn thành' mà không có định nghĩa 'hoàn thành', AI cần gắn cờ.
    - **Thiếu sót các điều khoản quan trọng:**
      - AI cần tìm: Kiểm tra sự vắng mặt của các điều khoản tiêu chuẩn và tối quan trọng tùy theo loại hợp đồng. Các điều khoản cần kiểm tra: Bất khả kháng (Force Majeure), Bảo mật (Confidentiality), Phạt vi phạm, Chấm dứt hợp đồng, Giải quyết tranh chấp, Luật áp dụng, Thẩm quyền giải quyết tranh chấp (đặc biệt trong hợp đồng quốc tế), Điều khoản về quyền sở hữu trí tuệ, Chuyển giao quyền và nghĩa vụ, Bảo hành/Bảo trì.
      - Ví dụ gợi ý cho AI: Nếu là hợp đồng mua bán quốc tế mà thiếu điều khoản 'Luật áp dụng' và 'Cơ quan giải quyết tranh chấp', AI cần báo cáo.
    - **Xung đột, mâu thuẫn giữa các điều khoản:**
      - AI cần tìm: So sánh các quy định về cùng một vấn đề nhưng lại đưa ra các nghĩa vụ, con số, thời hạn, hoặc điều kiện khác nhau ở các điều khoản, phụ lục, hoặc tài liệu đính kèm khác nhau.
      - Tìm kiếm các từ khóa chỉ sự mâu thuẫn như 'tuy nhiên', 'ngoại trừ', 'trái với' nếu chúng dẫn đến sự không rõ ràng thay vì làm rõ.
      - Ví dụ gợi ý cho AI: Điều 5 ghi bảo hành 12 tháng, Phụ lục 01 ghi 24 tháng.

    **6.2. Lỗ hổng trong Luật và các Văn bản Quy phạm Pháp luật:**
    - **'Sự im lặng của pháp luật':**
      - AI cần tìm: Khi được yêu cầu phân tích một vấn đề hoặc một hoạt động mới/chuyên biệt, AI cần xác định xem có các quy định pháp luật trực tiếp điều chỉnh hay không.
      - Báo cáo khi không tìm thấy các điều khoản, nghị định, thông tư cụ thể về một chủ đề được đưa ra.
      - Ví dụ gợi ý cho AI: Nếu người dùng hỏi về 'quy định đánh thuế cryptocurrency', AI cần báo cáo 'chưa có quy định pháp luật trực tiếp điều chỉnh'.
    - **Quy định mâu thuẫn, chồng chéo:**
      - AI cần tìm: So sánh các quy định liên quan đến cùng một vấn đề từ các văn bản pháp luật có cấp hiệu lực khác nhau (Luật vs. Nghị định, Nghị định vs. Thông tư).
      - Xác định các trường hợp mà quy định cấp dưới trái với quy định cấp trên hoặc hai văn bản cùng cấp lại mâu thuẫn nhau.
      - Ví dụ gợi ý cho AI: Nghị định quy định hướng A, Thông tư hướng B cho cùng điều kiện kinh doanh.
    - **Định nghĩa không rõ ràng:**
      - AI cần tìm: Các thuật ngữ pháp lý quan trọng, có tính định tính cao (ví dụ: 'gây ảnh hưởng xấu đến trật tự xã hội', 'trái với thuần phong mỹ tục', 'thiệt hại đáng kể', 'vì lợi ích công cộng') không được định nghĩa hoặc giải thích rõ ràng trong phần 'Giải thích từ ngữ' của văn bản.
      - Các thuật ngữ có thể có nhiều cách hiểu khác nhau mà không có tiêu chí cụ thể để áp dụng.

    **6.3. Lỗ hổng trong Quy trình và Thủ tục Tố tụng:**
    - **Vi phạm về thời hiệu:**
      - AI cần tìm: Xác định 'Ngày xảy ra sự kiện' (phát sinh tranh chấp, vi phạm hợp đồng, v.v.) và 'Ngày nộp đơn khởi kiện/yêu cầu'.
      - Đối chiếu với các quy định về 'Thời hiệu khởi kiện' hoặc 'Thời hiệu yêu cầu giải quyết vụ việc' trong các luật tương ứng (ví dụ: Bộ luật Dân sự, Bộ luật Tố tụng Dân sự, Luật Thương mại).
      - Báo cáo nếu thời gian từ ngày xảy ra sự kiện đến ngày nộp đơn vượt quá thời hiệu quy định.
    - **Sai sót trong tố tụng:**
      - AI cần tìm: Phân tích các tài liệu tố tụng (biên bản, thông báo, quyết định) để kiểm tra tính hợp lệ của các thủ tục quan trọng: Tống đạt, Triệu tập, Thu thập chứng cứ, Thành phần Hội đồng xét xử/Thủ tục hòa giải.
      - Ví dụ gợi ý cho AI: Tòa án không tống đạt hợp lệ quyết định xét xử cho một bên.

7.  **Tư duy Chiến lược & Tập trung vào Lợi ích Khách hàng:** Đây là nhiệm vụ cốt lõi. Không chỉ tóm tắt. Dựa trên phân tích toàn diện (đặc biệt là dòng thời gian sự việc), hãy xây dựng một chiến lược hành động chi tiết trong mục "proposedStrategy". Chiến lược này BẮT BUỘC phải: a) Xác định và tận dụng triệt để các "strengths" (điểm mạnh) và các yếu tố có lợi nhất cho khách hàng; b) Đề xuất giải pháp cụ thể để giảm thiểu "weaknesses" (điểm yếu) và "risks" (rủi ro); c) Khai thác các "legalLoopholes" (lỗ hổng pháp lý) đã được xác định để tạo lợi thế hoặc tấn công lập luận của đối phương. Mục tiêu cuối cùng là xây dựng lộ trình có khả năng thắng kiện cao nhất cho khách hàng.
8.  **GIẢI QUYẾT YÊU CẦU CHÍNH:** Dựa trên "Yêu cầu của luật sư (Mục tiêu phân tích)", bạn phải xây dựng một phương án/cách thức giải quyết cụ thể cho vấn đề đó và điền vào trường 'requestResolutionPlan'. Đây là câu trả lời trực tiếp cho yêu cầu của người dùng, tách biệt với chiến lược tổng thể của vụ việc.
9.  **Phân tích Cơ sở pháp lý SÂU và Tìm Bằng chứng:** Khi viện dẫn cơ sở pháp lý, phải kiểm tra hiệu lực văn bản. Đối với mỗi văn bản, BẮT BUỘC phải: a) Giải thích rõ vấn đề pháp lý cốt lõi mà văn bản đó giải quyết ('coreIssueAddressed'); b) Giải thích sự liên quan trực tiếp của nó đến vụ việc ('relevanceToCase'); và c) (CỰC KỲ QUAN TRỌNG) Tìm và trích dẫn các đoạn văn bản chính xác từ các tài liệu được cung cấp để làm bằng chứng cho các giải thích ở (a) và (b). Điền các bằng chứng này vào trường 'supportingEvidence', bao gồm cả tên tài liệu nguồn và đoạn trích dẫn. Nếu không tìm thấy bằng chứng trực tiếp, hãy trả về một mảng rỗng cho 'supportingEvidence'.
10. **Xây dựng "BẢN ĐỒ LẬP LUẬN" ban đầu (QUAN TRỌNG):**
    -   Sau khi hoàn thành tất cả các mục phân tích, hãy tổng hợp lại và xác định các mối quan hệ logic cơ bản giữa các yếu tố để tạo ra một đồ thị gợi ý.
    -   **Nodes (Nút):** Chuyển đổi mỗi mục trong 'coreLegalIssues', 'strengths', 'weaknesses', 'risks', 'caseTimeline', 'applicableLaws', 'legalLoopholes' thành một node riêng biệt. Mỗi node phải có ID duy nhất, loại (type), nhãn (label - tóm tắt ngắn gọn), và nội dung (content - toàn bộ văn bản của mục đó). Đặt vị trí (position) ngẫu nhiên cho các node này để chúng có thể được hiển thị trên bản đồ.
    -   **Edges (Cạnh nối):** Suy luận các mối quan hệ hỗ trợ hoặc mâu thuẫn cơ bản nhất. Ví dụ: một 'strength' có thể hỗ trợ giải quyết một 'legalIssue', một 'timelineEvent' có thể là nguyên nhân của một 'risk'. Chỉ tạo các cạnh nối RÕ RÀNG và QUAN TRỌNG nhất.
    -   Điền kết quả vào trường 'argumentGraph'. Nếu không thể tạo đồ thị, trả về một đối tượng rỗng.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI xuất sắc, nhiệm vụ của bạn là nhận một báo cáo phân tích JSON đã có, cùng với thông tin về giai đoạn tố tụng mới và các tài liệu mới, sau đó trả về một phiên bản JSON **hoàn chỉnh và được cập nhật** của báo cáo đó.

QUY TRÌNH CẬP NHẬT:
1.  **QUY TẮC XÁC ĐỊNH THÂN CHỦ (CỰC KỲ QUAN TRỌNG):** NẾU trong yêu cầu có cung cấp "CRITICAL ANALYSIS DIRECTIVE" về vị trí của thân chủ, bạn BẮT BUỘC phải tuân thủ tuyệt đối chỉ thị này. Toàn bộ báo cáo cập nhật phải được điều chỉnh để phản ánh đúng góc nhìn bảo vệ quyền lợi cho thân chủ này. Chỉ thị này GHI ĐÈ mọi thông tin cũ trong báo cáo hiện tại.
2.  **Tích hợp Thông tin Mới:** Đọc và hiểu các tài liệu mới được cung cấp (nếu có). Cập nhật 'caseTimeline' với các sự kiện mới.
3.  **Cập nhật Giai đoạn:** Cập nhật trường 'litigationStage' theo yêu cầu.
4.  **Rà soát và Điều chỉnh:** Dựa trên giai đoạn mới và thông tin mới, rà soát lại TOÀN BỘ các mục của báo cáo hiện tại ('caseProspects', 'gapAnalysis', 'proposedStrategy', v.v.). Điều chỉnh, bổ sung hoặc loại bỏ các mục cho phù hợp với tình hình mới. Chiến lược phải được cập nhật để phản ánh giai đoạn tố tụng mới.
5.  **Cập nhật Cơ sở Pháp lý:** Bổ sung các điều luật, văn bản mới liên quan đến giai đoạn mới. Với mỗi luật, hãy (QUAN TRỌNG) tìm kiếm và trích dẫn bằng chứng ('supportingEvidence') từ tài liệu gốc cho các nhận định của bạn.
6.  **Trả về JSON Hoàn chỉnh:** Kết quả cuối cùng phải là một đối tượng JSON duy nhất, đầy đủ tất cả các trường, đã được cập nhật.
`;

export const REANALYSIS_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp. Nhiệm vụ của bạn là nhận một báo cáo phân tích JSON đã được người dùng (luật sư) điều chỉnh. Báo cáo này là nguồn thông tin chính xác nhất. Dựa trên đó, hãy thực hiện một phân tích lại toàn diện và sâu sắc hơn.

QUY TRÌNH PHÂN TÍCH LẠI:
1.  **QUY TẮC XÁC ĐỊNH THÂN CHỦ (CỰC KỲ QUAN TRỌNG):** NẾU trong yêu cầu có cung cấp "CRITICAL ANALYSIS DIRECTIVE" về vị trí của thân chủ, bạn BẮT BUỘC phải tuân thủ tuyệt đối. Toàn bộ quá trình phân tích lại phải nhất quán với chỉ thị này, điều chỉnh mọi kết luận trước đó để phù hợp với việc bảo vệ thân chủ đã được chỉ định.
2.  **Ưu tiên Báo cáo đã sửa:** Coi báo cáo JSON đã được người dùng điều chỉnh là "sự thật". Các thay đổi của họ (ví dụ: sửa tóm tắt, điều chỉnh dòng thời gian, thêm điểm mạnh/yếu) là định hướng chính cho phân tích của bạn.
3.  **Đối chiếu Tài liệu gốc:** Sử dụng các tài liệu gốc đính kèm để tìm thêm chi tiết, ngữ cảnh và bằng chứng hỗ trợ cho các điểm đã được người dùng sửa đổi.
4.  **Phân tích lại Sâu hơn:**
    -   **Chiến lược:** Dựa trên các điểm mạnh/yếu đã được cập nhật, hãy xây dựng lại một 'proposedStrategy' sắc bén và chi tiết hơn.
    -   **Lỗ hổng:** Rà soát lại 'gapAnalysis' và 'legalLoopholes'. Có lỗ hổng nào mới xuất hiện hoặc trở nên quan trọng hơn sau khi người dùng điều chỉnh không?
    -   **Cơ sở pháp lý:** Rà soát lại mục 'applicableLaws'. Với mỗi văn bản luật, hãy đảm bảo các phân tích trong 'coreIssueAddressed' và 'relevanceToCase' là chính xác và sâu sắc nhất. (QUAN TRỌNG) Tìm và trích dẫn các đoạn văn bản chính xác từ các tài liệu gốc để làm bằng chứng cho các phân tích này, điền vào trường 'supportingEvidence'.
    -   **Bản đồ Lập luận:** Dựa trên phân tích mới, tạo lại một 'argumentGraph' logic và chặt chẽ hơn.
5.  **Trả về JSON Hoàn chỉnh Mới:** Tạo ra một đối tượng JSON hoàn toàn mới, phản ánh kết quả phân tích lại sâu sắc của bạn, tuân thủ đúng cấu trúc đã cho.
`;


export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    editableCaseSummary: { type: Type.STRING, description: "Một bản tóm tắt ngắn gọn (5-7 câu) về toàn bộ vụ việc, có thể được người dùng chỉnh sửa." },
    caseTimeline: {
      type: Type.ARRAY,
      description: "Dòng thời gian các sự kiện quan trọng của vụ việc, sắp xếp theo thứ tự thời gian.",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Ngày diễn ra sự kiện theo định dạng YYYY-MM-DD." },
          description: { type: Type.STRING, description: "Mô tả chi tiết về sự kiện." },
          sourceDocument: { type: Type.STRING, description: "Tên tài liệu là nguồn của thông tin này." },
          eventType: { type: Type.STRING, description: "Phân loại sự kiện (ví dụ: 'Contract', 'Payment', 'LegalAction')." },
          significance: { type: Type.STRING, description: "Mức độ quan trọng của sự kiện (Cao, Trung bình, Thấp)." }
        },
        required: ['date', 'description', 'sourceDocument', 'eventType', 'significance']
      }
    },
    litigationStage: { type: Type.STRING, description: "Giai đoạn tố tụng hiện tại của vụ việc (ví dụ: 'consulting', 'firstInstance', 'appeal')." },
    proceduralStatus: {
      type: Type.ARRAY,
      description: "Tư cách tham gia tố tụng của các bên.",
      items: {
        type: Type.OBJECT,
        properties: {
          partyName: { type: Type.STRING, description: "Tên của bên tham gia tố tụng." },
          status: { type: Type.STRING, description: "Tư cách của họ (ví dụ: Nguyên đơn, Bị đơn)." }
        },
        required: ['partyName', 'status']
      }
    },
    legalRelationship: { type: Type.STRING, description: "Mô tả bản chất quan hệ pháp luật giữa các bên." },
    coreLegalIssues: {
      type: Type.ARRAY,
      description: "Danh sách các vấn đề pháp lý cốt lõi cần giải quyết.",
      items: { type: Type.STRING }
    },
    applicableLaws: {
      type: Type.ARRAY,
      description: "Danh sách các văn bản pháp luật và điều luật liên quan.",
      items: {
        type: Type.OBJECT,
        properties: {
          documentName: { type: Type.STRING, description: "Tên đầy đủ của văn bản pháp luật." },
          coreIssueAddressed: { type: Type.STRING, description: "Phân tích vấn đề pháp lý chính mà văn bản này giải quyết trong bối cảnh vụ việc." },
          relevanceToCase: { type: Type.STRING, description: "Giải thích tại sao văn bản này lại liên quan và áp dụng cho vụ việc." },
          articles: {
            type: Type.ARRAY,
            description: "Các điều luật cụ thể được áp dụng.",
            items: {
              type: Type.OBJECT,
              properties: {
                articleNumber: { type: Type.STRING, description: "Số hiệu điều luật (ví dụ: 'Điều 116')." },
                summary: { type: Type.STRING, description: "Tóm tắt nội dung chính của điều luật." }
              },
              required: ['articleNumber', 'summary']
            }
          },
          supportingEvidence: {
            type: Type.ARRAY,
            description: "Một mảng các đoạn trích dẫn từ tài liệu gốc để làm bằng chứng trực tiếp cho 'coreIssueAddressed' hoặc 'relevanceToCase'. Trả về mảng rỗng nếu không tìm thấy.",
            items: {
              type: Type.OBJECT,
              properties: {
                sourceDocument: { type: Type.STRING, description: "Tên tệp nguồn chứa đoạn trích dẫn." },
                snippet: { type: Type.STRING, description: "Đoạn văn bản chính xác được trích dẫn từ tài liệu." }
              },
              required: ['sourceDocument', 'snippet']
            }
          }
        },
        required: ['documentName', 'articles']
      }
    },
    gapAnalysis: {
      type: Type.OBJECT,
      description: "Phân tích các lỗ hổng thông tin và pháp lý.",
      properties: {
        missingInformation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Danh sách thông tin, tài liệu, chứng cứ còn thiếu." },
        recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các hành động đề xuất để thu thập thông tin còn thiếu." },
        legalLoopholes: {
          type: Type.ARRAY,
          description: "Các lỗ hổng pháp lý tiềm ẩn được phát hiện.",
          items: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING, description: "Loại lỗ hổng ('Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác')." },
              description: { type: Type.STRING, description: "Mô tả chi tiết về lỗ hổng." },
              severity: { type: Type.STRING, description: "Mức độ nghiêm trọng (Cao, Trung bình, Thấp)." },
              suggestion: { type: Type.STRING, description: "Gợi ý cách khắc phục hoặc khai thác lỗ hổng." },
              evidence: { type: Type.STRING, description: "Đoạn trích dẫn từ tài liệu làm cơ sở phát hiện lỗ hổng." }
            },
            required: ['classification', 'description', 'severity', 'suggestion', 'evidence']
          }
        }
      },
      required: ['missingInformation', 'recommendedActions', 'legalLoopholes']
    },
    caseProspects: {
      type: Type.OBJECT,
      description: "Đánh giá triển vọng của vụ việc.",
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm mạnh của khách hàng." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các điểm yếu của khách hàng." },
        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các rủi ro tiềm ẩn." }
      },
      required: ['strengths', 'weaknesses', 'risks']
    },
    proposedStrategy: {
      type: Type.OBJECT,
      description: "Chiến lược và lộ trình hành động được đề xuất.",
      properties: {
        preLitigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước trong giai đoạn tiền tố tụng." },
        litigation: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các bước trong giai đoạn tố tụng." }
      },
      required: ['preLitigation', 'litigation']
    },
    requestResolutionPlan: {
        type: Type.ARRAY,
        description: "Phương án/kế hoạch cụ thể để giải quyết yêu cầu chính của luật sư.",
        items: { type: Type.STRING }
    },
    contingencyPlan: {
        type: Type.ARRAY,
        description: "Phương án xử lý nếu vụ việc không diễn ra như dự kiến hoặc thua kiện.",
        items: { type: Type.STRING }
    },
    argumentGraph: {
        type: Type.OBJECT,
        description: "Cấu trúc dữ liệu cho bản đồ lập luận.",
        properties: {
            nodes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING },
                        label: { type: Type.STRING },
                        content: { type: Type.STRING },
                        position: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } }
                    },
                    required: ['id', 'type', 'label', 'content', 'position']
                }
            },
            edges: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        source: { type: Type.STRING },
                        target: { type: Type.STRING }
                    },
                    required: ['id', 'source', 'target']
                }
            }
        },
        required: ['nodes', 'edges']
    }
  },
  required: [
    'editableCaseSummary', 'caseTimeline', 'litigationStage', 'proceduralStatus', 'legalRelationship', 'coreLegalIssues',
    'applicableLaws', 'gapAnalysis', 'caseProspects', 'proposedStrategy', 'requestResolutionPlan', 'contingencyPlan', 'argumentGraph'
  ]
};

export const litigationStageSuggestions: Record<LitigationStage, { actions: string[]; documents: string[] }> = {
    consulting: { actions: [], documents: [] },
    firstInstance: {
        actions: [
            "Thu thập bổ sung chứng cứ theo yêu cầu của Tòa án.",
            "Chuẩn bị các câu hỏi để xét hỏi tại phiên tòa.",
            "Soạn thảo bản Luận cứ/Ý kiến để trình bày tại phiên tòa.",
            "Nghiên cứu các án lệ có tính chất tương tự."
        ],
        documents: [
            "Soạn thảo Đơn yêu cầu Tòa án thu thập chứng cứ",
            "Soạn thảo Bản trình bày ý kiến của luật sư",
            "Soạn thảo Yêu cầu phản tố (nếu có)",
            "Soạn thảo Đơn yêu cầu áp dụng biện pháp khẩn cấp tạm thời"
        ]
    },
    appeal: {
        actions: [
            "Nghiên cứu kỹ Bản án sơ thẩm để tìm các sai sót, vi phạm tố tụng hoặc áp dụng sai pháp luật.",
            "Xác định các luận điểm kháng cáo trọng tâm.",
            "Tìm kiếm các chứng cứ mới (nếu có) để trình tại phiên tòa phúc thẩm.",
            "Chuẩn bị Luận cứ để bảo vệ quan điểm kháng cáo."
        ],
        documents: [
            "Soạn thảo Đơn kháng cáo",
            "Soạn thảo Bản giải trình về nội dung kháng cáo",
            "Soạn thảo Ý kiến đối với kháng cáo của đối phương"
        ]
    },
    cassation: {
        actions: [
            "Phân tích Bản án phúc thẩm để tìm ra các vi phạm nghiêm trọng về thủ tục tố tụng hoặc sai lầm trong việc áp dụng pháp luật.",
            "Soạn thảo Đơn đề nghị Giám đốc thẩm/Tái thẩm, tập trung vào các căn cứ pháp lý theo quy định.",
            "Theo dõi và làm việc với Tòa án/Viện kiểm sát có thẩm quyền."
        ],
        documents: [
            "Soạn thảo Đơn đề nghị Giám đốc thẩm",
            "Soạn thảo Đơn đề nghị Tái thẩm"
        ]
    },
    enforcement: {
        actions: [
            "Xác minh điều kiện thi hành án của bên phải thi hành án (tài sản, tài khoản...).",
            "Làm việc với Chấp hành viên để đôn đốc quá trình thi hành án.",
            "Yêu cầu áp dụng các biện pháp bảo đảm, cưỡng chế thi hành án nếu cần."
        ],
        documents: [
            "Soạn thảo Đơn yêu cầu Thi hành án",
            "Soạn thảo Đơn yêu cầu kê biên tài sản",
            "Soạn thảo Đơn khiếu nại về thi hành án"
        ]
    },
    closed: { actions: [], documents: [] }
};

export const litigationStagesByType: Record<LitigationType, { value: LitigationStage, label: string }[]> = {
    civil: [
        { value: 'consulting', label: 'Tư vấn / Chuẩn bị' },
        { value: 'firstInstance', label: 'Sơ thẩm' },
        { value: 'appeal', label: 'Phúc thẩm' },
        { value: 'cassation', label: 'Giám đốc thẩm / Tái thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã kết thúc' }
    ],
    criminal: [
        { value: 'consulting', label: 'Tư vấn / GĐ Điều tra' },
        { value: 'firstInstance', label: 'Sơ thẩm' },
        { value: 'appeal', label: 'Phúc thẩm' },
        { value: 'cassation', label: 'Giám đốc thẩm / Tái thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã kết thúc' }
    ],
    administrative: [
        { value: 'consulting', label: 'Tư vấn / Khiếu nại' },
        { value: 'firstInstance', label: 'Sơ thẩm' },
        { value: 'appeal', label: 'Phúc thẩm' },
        { value: 'cassation', label: 'Giám đốc thẩm / Tái thẩm' },
        { value: 'enforcement', label: 'Thi hành án' },
        { value: 'closed', label: 'Đã kết thúc' }
    ]
};

export const getStageLabel = (type: LitigationType, stageValue: LitigationStage): string => {
    const stages = litigationStagesByType[type] || litigationStagesByType.civil;
    const stage = stages.find(s => s.value === stageValue);
    return stage ? stage.label : 'Không xác định';
};


export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp tại Việt Nam, chuyên soạn thảo các văn bản pháp lý. Nhiệm vụ của bạn là nhận một báo cáo phân tích vụ việc (dưới dạng JSON), một yêu cầu cụ thể từ luật sư, và các tiêu chí về văn phong, sau đó tạo ra một văn bản pháp lý hoàn chỉnh, chuyên nghiệp, và có tính chiến lược cao.

QUY TRÌNH THỰC HIỆN:
1.  **Nghiên cứu Toàn diện:** Đọc và hiểu sâu sắc toàn bộ báo cáo JSON được cung cấp. Đây là nguồn thông tin cốt lõi chứa đựng bối cảnh, dòng thời gian, các điểm mạnh, điểm yếu, và chiến lược đã được AI phân tích.
2.  **Phân tích Yêu cầu:** Hiểu rõ yêu cầu soạn thảo cụ thể của luật sư. Đây là mục tiêu chính của văn bản cần tạo ra.
3.  **Tích hợp Yếu tố Chiến lược:** DỰA TRÊN "Lập trường Chiến lược" được chỉ định, hãy lựa chọn và nhấn mạnh các thông tin, luận điểm từ báo cáo JSON một cách phù hợp:
    *   **Lập luận Tấn công / Chủ động:** Tập trung vào các "strengths" (điểm mạnh) của khách hàng và các "weaknesses" (điểm yếu) của đối phương. Sử dụng các "legalLoopholes" (lỗ hổng pháp lý) để tấn công vào lập luận của đối phương. Ngôn ngữ phải mạnh mẽ, quả quyết.
    *   **Phản bác Sắc bén (cho Kháng cáo):** Tập trung vào việc "bẻ gãy" từng luận điểm của đối phương. Tìm các điểm yếu, mâu thuẫn, sai sót trong lập luận của họ (dựa trên dòng thời gian, các lỗ hổng pháp lý...). Viện dẫn các tình tiết có lợi đã được phân tích để củng cố lập luận phản bác. Văn phong phải sắc bén, chính xác.
    *   **Lập luận Thuyết phục / Hòa giải:** Nhấn mạnh vào các điểm chung, các giải pháp đôi bên cùng có lợi. Trình bày các "risks" (rủi ro) nếu không đạt được thỏa thuận. Ngôn ngữ mềm dẻo, mang tính xây dựng.
    *   **Trang trọng / Trung lập:** Trình bày sự việc một cách khách quan, dựa trên các sự kiện trong "caseTimeline" và các cơ sở pháp lý trong "applicableLaws". Hạn chế đưa ra các bình luận mang tính cảm tính.
4.  **Soạn thảo Văn bản Hoàn chỉnh:** Tạo ra một văn bản hoàn chỉnh, có cấu trúc rõ ràng (mở đầu, nội dung, kết luận), sử dụng thuật ngữ pháp lý chính xác, và tuân thủ đúng định dạng của loại văn bản được yêu cầu. Đảm bảo văn bản cuối cùng phản ánh đúng chiến lược đã chọn và giải quyết được yêu cầu của luật sư.
`;

export const CONSULTING_SYSTEM_INSTRUCTION = `Bạn là một luật sư tư vấn AI tại Việt Nam. Nhiệm vụ của bạn là nhận thông tin vụ việc và trả về một báo cáo tư vấn sơ bộ dưới dạng JSON.

QUY TRÌNH PHÂN TÍCH:
1.  **Trả lời Ngắn gọn (QUAN TRỌNG NHẤT):** Đọc kỹ "Yêu cầu của khách hàng" và toàn bộ bối cảnh. Sau đó, soạn một câu trả lời tư vấn ngắn gọn, trực tiếp, súc tích và đi thẳng vào vấn đề. Đây là câu trả lời sơ bộ mà luật sư có thể dùng để trả lời nhanh cho khách hàng. **QUAN TRỌNG: LUÔN LUÔN kết thúc câu trả lời bằng một dòng riêng biệt với nội dung "Liên hệ mình nếu bạn cần tư vấn chi tiết hơn nhé." để khuyến khích khách hàng tương tác.** Điền toàn bộ nội dung, bao gồm cả câu kết này, vào trường 'conciseAnswer'.
2.  **Xác định Vấn đề Cốt lõi:** Từ bối cảnh và yêu cầu của khách hàng, xác định các vấn đề chính cần thảo luận và tư vấn thêm.
3.  **Phân loại Sơ bộ:** Dựa trên bản chất tranh chấp, phân loại vụ việc vào loại hình phù hợp (Dân sự, Hình sự, Hành chính). Nếu không rõ, ghi 'unknown'.
4.  **Xác định Giai đoạn:** Đánh giá vụ việc đang ở giai đoạn nào (ví dụ: "Chuẩn bị khởi kiện", "Thương lượng, hòa giải", "Sau khi có bản án sơ thẩm").
5.  **Đề xuất Hành động:** Gợi ý các loại văn bản, tài liệu quan trọng cần soạn thảo hoặc thu thập tiếp theo.
6.  **Cảnh báo Rủi ro:** (QUAN TRỌNG) Tìm kiếm và chỉ ra các "Lỗ hổng pháp lý tiềm ẩn" có thể ảnh hưởng đến quyền lợi của khách hàng, dựa trên thông tin được cung cấp.
7.  **Trả về JSON:** Điền tất cả các kết quả phân tích vào cấu trúc JSON đã cho.`;

export const CONSULTING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        conciseAnswer: {
            type: Type.STRING,
            description: "Một câu trả lời tư vấn ngắn gọn, trực tiếp và súc tích cho yêu cầu của khách hàng."
        },
        discussionPoints: {
            type: Type.ARRAY,
            description: "Danh sách các vấn đề pháp lý hoặc thực tế quan trọng cần thảo luận với khách hàng.",
            items: { type: Type.STRING }
        },
        caseType: {
            type: Type.STRING,
            description: "Phân loại sơ bộ về loại vụ việc (civil, criminal, administrative, unknown)."
        },
        preliminaryStage: {
            type: Type.STRING,
            description: "Đánh giá sơ bộ về giai đoạn hiện tại của vụ việc."
        },
        suggestedDocuments: {
            type: Type.ARRAY,
            description: "Danh sách các văn bản đề xuất cần soạn thảo hoặc chuẩn bị.",
            items: { type: Type.STRING }
        },
        legalLoopholes: {
          type: Type.ARRAY,
          description: "Các lỗ hổng pháp lý tiềm ẩn được phát hiện.",
          items: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING, description: "Loại lỗ hổng ('Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác')." },
              description: { type: Type.STRING, description: "Mô tả chi tiết về lỗ hổng." },
              severity: { type: Type.STRING, description: "Mức độ nghiêm trọng (Cao, Trung bình, Thấp)." },
              suggestion: { type: Type.STRING, description: "Gợi ý cách khắc phục hoặc khai thác lỗ hổng." },
              evidence: { type: Type.STRING, description: "Cơ sở/thông tin dẫn đến việc phát hiện lỗ hổng." }
            },
            required: ['classification', 'description', 'severity', 'suggestion', 'evidence']
          }
        }
    },
    required: ['conciseAnswer', 'discussionPoints', 'caseType', 'preliminaryStage', 'suggestedDocuments']
};


export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên nghiệp, có khả năng đọc hiểu và trích xuất thông tin chính xác từ các tài liệu pháp lý thô.

**Nhiệm vụ:**
Từ tập hợp các tài liệu được cung cấp, hãy thực hiện hai việc sau:
1.  **Tóm tắt Diễn biến Vụ việc:** Tổng hợp tất cả các thông tin, sự kiện, tình tiết từ các tài liệu để viết thành một đoạn văn tóm tắt mạch lạc, đầy đủ về bối cảnh và diễn biến của vụ việc.
2.  **Tóm tắt Yêu cầu của Khách hàng:** Xác định và viết lại một cách rõ ràng, súc tích những yêu cầu, mong muốn hoặc mục tiêu chính của khách hàng trong vụ việc này.

**QUY TẮC QUAN TRỌNG:** Nếu có chỉ thị về vị trí của thân chủ (TRÁI/PHẢI), hãy đảm bảo tóm tắt được viết từ góc nhìn của họ.

**Yêu cầu đầu ra:**
Trả về kết quả dưới dạng một đối tượng JSON duy nhất, tuân thủ nghiêm ngặt cấu trúc đã được định nghĩa.`;

export const SUMMARY_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    caseSummary: {
      type: Type.STRING,
      description: "Một đoạn văn hoàn chỉnh, tóm tắt diễn biến chính của vụ việc."
    },
    clientRequestSummary: {
      type: Type.STRING,
      description: "Một đoạn văn hoàn chỉnh, tóm tắt các yêu cầu cốt lõi của khách hàng."
    }
  },
  required: ['caseSummary', 'clientRequestSummary']
};


export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp, đang trong một cuộc trao đổi chuyên sâu với một luật sư về một mục cụ thể trong báo cáo phân tích vụ việc.

**Bối cảnh:**
-   Bạn đã có sẵn toàn bộ báo cáo phân tích vụ việc (dưới dạng JSON).
-   Bạn biết mình đang thảo luận trong mục nào (ví dụ: "Đánh giá Triển vọng Vụ việc", "Phân tích Lỗ hổng").
-   Bạn có lịch sử cuộc trò chuyện trước đó về mục này.

**Nhiệm vụ của bạn:**
1.  **Hiểu sâu sắc:** Dựa vào toàn bộ báo cáo và lịch sử trò chuyện, hãy hiểu rõ câu hỏi hoặc thông tin mới mà luật sư đưa ra.
2.  **Tư duy và Phân tích:**
    -   Kết nối thông tin mới với các dữ liệu khác trong báo cáo (ví dụ: một tình tiết mới có thể ảnh hưởng đến điểm mạnh/yếu, một câu hỏi có thể liên quan đến dòng thời gian).
    -   Suy luận và đưa ra các nhận định, giải pháp, hoặc câu trả lời một cách thông minh, có tính chiến lược.
3.  **Trả lời Trực tiếp và Hữu ích:**
    -   Trả lời thẳng vào câu hỏi của luật sư.
    -   Nếu luật sư cung cấp thông tin mới, hãy xác nhận đã ghi nhận và phân tích ngắn gọn ảnh hưởng của nó.
    -   Nếu luật sư yêu cầu một giải pháp, hãy đề xuất các bước hành động cụ thể.
    -   Luôn giữ văn phong chuyên nghiệp, mạch lạc và tập trung vào việc hỗ trợ luật sư.
`;

export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI thông minh, có khả năng tra cứu và trả lời các câu hỏi dựa trên một bộ hồ sơ vụ việc hoàn chỉnh đã được phân tích.

**Nguồn kiến thức của bạn:**
1.  **Báo cáo Phân tích (JSON):** Đây là tài liệu cốt lõi, chứa các kết luận, chiến lược, và các điểm dữ liệu có cấu trúc (dòng thời gian, cơ sở pháp lý, v.v.).
2.  **Nội dung Tài liệu gốc (đã được tóm tắt):** Đây là nguồn thông tin chi tiết, chứa đựng các tình tiết, câu chữ nguyên văn.
3.  **Lịch sử Trao đổi:** Các câu hỏi và câu trả lời trước đó.

**Nhiệm vụ của bạn:**
1.  **Phân tích Câu hỏi:** Đọc và hiểu rõ câu hỏi của luật sư. Xác định thông tin chính mà họ đang tìm kiếm.
2.  **Tra cứu Thông tin:**
    -   **Ưu tiên Báo cáo Phân tích:** Tìm kiếm câu trả lời trong báo cáo JSON trước tiên. Đây là nguồn đã được tổng hợp và phân tích.
    -   **Đối chiếu Tài liệu gốc:** Nếu cần chi tiết hơn hoặc các thông tin không có trong báo cáo, hãy tìm kiếm trong phần nội dung tóm tắt của các tài liệu gốc.
    -   **Sử dụng Lịch sử:** Tham khảo các câu hỏi trước đó để hiểu ngữ cảnh và tránh lặp lại thông tin.
3.  **Tổng hợp và Trả lời:**
    -   Soạn một câu trả lời hoàn chỉnh, chính xác và súc tích.
    -   Khi có thể, hãy trích dẫn nguồn thông tin của bạn (ví dụ: "Theo Hợp đồng ngày X...", "Trong báo cáo phân tích, mục Điểm yếu có nêu...", "Theo tài liệu Email ngày Y...").
    -   Nếu không tìm thấy thông tin, hãy trả lời một cách trung thực rằng thông tin đó không có trong hồ sơ.
    -   Văn phong chuyên nghiệp, rõ ràng.
`;


export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI chuyên về viết luận cứ pháp lý. Nhiệm vụ của bạn là nhận một tập hợp các yếu tố (vấn đề pháp lý, điểm mạnh, điểm yếu, sự kiện, cơ sở pháp lý) và kết nối chúng lại thành một đoạn văn luận cứ mạch lạc, logic và có tính thuyết phục cao.

**Quy trình:**
1.  **Xác định Luận điểm chính:** Dựa trên các yếu tố được cung cấp, xác định đâu là luận điểm cốt lõi cần chứng minh hoặc bảo vệ.
2.  **Xây dựng Cấu trúc:** Sắp xếp các yếu tố theo một trình tự logic:
    -   Bắt đầu bằng việc nêu luận điểm chính.
    -   Sử dụng các sự kiện (timelineEvent) và cơ sở pháp lý (applicableLaw) làm nền tảng.
    -   Dùng các điểm mạnh (strength) để củng cố luận điểm.
    -   Dự liệu và phản biện trước các điểm yếu (weakness) hoặc rủi ro (risk) nếu có.
3.  **Soạn thảo:** Viết thành một đoạn văn hoàn chỉnh, sử dụng từ ngữ pháp lý chính xác, các câu chuyển tiếp mượt mà để tạo thành một dòng chảy lập luận chặt chẽ.
`;

export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp, đang thảo luận với luật sư về một khối thông tin cụ thể (một "node") trong Bản đồ Lập luận của một vụ việc.

**Nhiệm vụ của bạn:**
1.  **Hiểu Bối cảnh:** Ghi nhớ thông tin của khối đang được thảo luận (loại, nhãn, nội dung).
2.  **Phân tích Yêu cầu:** Đọc kỹ yêu cầu mới của luật sư. Họ đang muốn làm rõ, tìm giải pháp, hay phân tích sâu hơn về khối thông tin này?
3.  **Tư duy và Đề xuất:**
    -   Nếu luật sư hỏi "làm thế nào", hãy đề xuất các bước hành động, giải pháp cụ thể.
    -   Nếu họ hỏi "tại sao", hãy giải thích logic, cơ sở pháp lý hoặc thực tiễn đằng sau vấn đề.
    -   Nếu họ cung cấp thông tin mới, hãy phân tích nhanh xem nó ảnh hưởng thế nào đến khối thông tin này.
4.  **Trả lời Ngắn gọn, Tập trung:** Cung cấp câu trả lời trực tiếp, hữu ích và đi thẳng vào vấn đề liên quan đến khối thông tin đang thảo luận.
`;

export const OPPONENT_ANALYSIS_SYSTEM_INSTRUCTION = `
Bạn là một luật sư tranh tụng AI cao cấp, có tư duy phản biện sắc bén. Nhiệm vụ của bạn là phân tích các lập luận của đối phương, tìm ra điểm yếu và xây dựng các luận điểm phản bác vững chắc.

**Bối cảnh:**
-   Bạn có toàn bộ thông tin về vụ việc của phía khách hàng (dưới dạng báo cáo JSON và tóm tắt tài liệu).
-   Bạn nhận được một đoạn văn bản chứa các lập luận và/hoặc chứng cứ của đối phương.

**Quy trình Phân tích:**
1.  **Tách rã Lập luận:** Đọc và chia nhỏ văn bản của đối phương thành từng luận điểm riêng biệt.
2.  **Với mỗi Luận điểm:**
    a.  **Xác định Điểm yếu:** Soi xét kỹ lưỡng để tìm ra các lỗ hổng, bao gồm:
        -   **Lỗi logic:** Mâu thuẫn nội tại, suy diễn vô căn cứ, kết luận vội vàng.
        -   **Thiếu chứng cứ:** Các khẳng định không có tài liệu, bằng chứng hỗ trợ.
        -   **Chứng cứ yếu:** Chứng cứ không đáng tin cậy, không liên quan, hoặc có thể bị diễn giải theo hướng khác.
        -   **Bỏ qua tình tiết quan trọng:** Lập luận của họ có bỏ qua các sự kiện hoặc tài liệu nào có lợi cho phía bạn không? (Đối chiếu với hồ sơ vụ việc được cung cấp).
    b.  **Xây dựng Luận điểm Phản bác:** Dựa trên các điểm yếu đã tìm thấy và toàn bộ hồ sơ vụ việc của khách hàng, hãy xây dựng các luận điểm phản bác trực diện, mạnh mẽ.
    c.  **Viện dẫn Chứng cứ:** Đối với mỗi luận điểm phản bác, hãy nêu rõ nó được hỗ trợ bởi bằng chứng, tài liệu, hoặc tình tiết nào từ hồ sơ vụ việc của khách hàng.

**Yêu cầu Đầu ra:**
Trả về một mảng JSON, trong đó mỗi đối tượng đại diện cho một lập luận của đối phương đã được bạn phân tích.
`;

export const OPPONENT_ANALYSIS_SCHEMA = {
    type: Type.ARRAY,
    description: "Một danh sách các phân tích cho từng lập luận của đối phương.",
    items: {
        type: Type.OBJECT,
        properties: {
            argument: {
                type: Type.STRING,
                description: "Lập luận gốc của đối phương đã được xác định."
            },
            weaknesses: {
                type: Type.ARRAY,
                description: "Danh sách các điểm yếu, lỗ hổng logic hoặc thiếu sót chứng cứ được tìm thấy trong lập luận của đối phương.",
                items: { type: Type.STRING }
            },
            counterArguments: {
                type: Type.ARRAY,
                description: "Danh sách các luận điểm phản bác được đề xuất để chống lại lập luận của đối phương.",
                items: { type: Type.STRING }
            },
            supportingEvidence: {
                type: Type.ARRAY,
                description: "Danh sách các bằng chứng hoặc tình tiết từ hồ sơ vụ việc của khách hàng để hỗ trợ cho các luận điểm phản bác.",
                items: { type: Type.STRING }
            }
        },
        required: ["argument", "weaknesses", "counterArguments", "supportingEvidence"]
    }
};

export const PREDICT_OPPONENT_ARGS_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI dày dạn kinh nghiệm, chuyên đóng vai trò là luật sư của phía đối lập. Nhiệm vụ của bạn là xem xét toàn bộ hồ sơ vụ việc được cung cấp và xác định những lập luận mạnh mẽ, hợp lý nhất mà phía đối phương có thể sử dụng để chống lại khách hàng.

**Quy trình Tư duy:**
1.  **Đặt mình vào vị thế đối phương:** Tạm thời bỏ qua chiến lược của khách hàng. Hãy đọc toàn bộ hồ sơ (báo cáo phân tích, tóm tắt tài liệu) và tìm kiếm những điểm yếu, mâu thuẫn, hoặc thiếu sót trong lập trường của khách hàng.
2.  **Khai thác điểm yếu:** Dựa trên những điểm yếu đã tìm thấy, hãy xây dựng các lập luận tấn công hiệu quả nhất.
3.  **Dựa trên Bằng chứng:** Mỗi lập luận bạn đưa ra phải có khả năng được hỗ trợ bởi các tình tiết, sự kiện, hoặc tài liệu có trong hồ sơ.
4.  **Tập trung vào tính thực tế:** Đưa ra những lập luận mà một luật sư đối lập có kinh nghiệm sẽ thực sự sử dụng tại tòa, thay vì những giả định xa vời.

**Yêu cầu Đầu ra:**
Trả về một đối tượng JSON chứa một danh sách các lập luận tiềm năng của đối phương.
`;

export const PREDICT_OPPONENT_ARGS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        predictedArguments: {
            type: Type.ARRAY,
            description: "Một danh sách các lập luận mạnh mẽ nhất mà phía đối phương có thể đưa ra.",
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ["predictedArguments"],
};
