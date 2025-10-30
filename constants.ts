import { Type } from "@google/genai";
import type { FileCategory, DocType, LitigationType, LitigationStage, ArgumentNodeType } from "./types";

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
  ]
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
  postEventActions: "Hành động của các bên sau sự kiện"
};


export const SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI xuất sắc tại Việt Nam, được đào tạo chuyên sâu để phân tích hồ sơ vụ việc. Nhiệm vụ của bạn là nhận các thông tin, tài liệu thô và trả về một báo cáo phân tích có cấu trúc JSON chặt chẽ.

QUY TRÌNH THỰC HIỆN:
ĐẦU TIÊN, hãy tự mình đọc, hiểu và tóm tắt toàn bộ nội dung từ các tài liệu được cung cấp để nắm bắt bối cảnh vụ việc, diễn biến sự kiện, và yêu cầu của các bên. SAU ĐÓ, tạo ra một bản tóm tắt vắn tắt (khoảng 5-7 câu) về vụ việc và điền vào trường 'editableCaseSummary'.
KẾ TIẾP, dựa trên sự hiểu biết tổng thể đó và 'Yêu cầu của luật sư', hãy thực hiện các bước phân tích sau đây và điền vào cấu trúc JSON.

QUY TẮC PHÂN TÍCH BẮT BUỘC:
1.  **Xây dựng DÒNG THỜI GIAN VỤ VIỆC (QUAN TRỌNG):** Từ tất cả các tài liệu, trích xuất mọi sự kiện quan trọng có ngày tháng cụ thể. Sắp xếp chúng theo trình tự thời gian và điền vào trường 'caseTimeline'. Đối với mỗi sự kiện, BẮT BUỘC phải có: ngày tháng (theo định dạng YYYY-MM-DD), mô tả sự kiện, tên tài liệu nguồn, và đánh giá mức độ quan trọng.
2.  **Xác định Giai đoạn Tố tụng:** Dựa vào các tài liệu (bản án, đơn kháng cáo, quyết định thi hành án...), hãy xác định vụ việc đang ở giai đoạn tố tụng nào và điền giá trị (key) tương ứng vào trường 'litigationStage'. Ví dụ: nếu có bản án sơ thẩm và đơn kháng cáo, giai đoạn là 'appeal'. Nếu chỉ có yêu cầu tư vấn, giai đoạn là 'consulting'.
3.  **Xác định Tư cách Tố tụng:** Dựa trên nội dung hồ sơ, xác định rõ tư cách tham gia tố tụng của từng bên (Nguyên đơn, Bị đơn, Người có quyền lợi và nghĩa vụ liên quan, Bị hại, Bị cáo, v.v.) và điền thông tin vào trường 'proceduralStatus'.
4.  **Tư duy như luật sư:** Phân tích logic, xác định đúng quan hệ pháp luật và các vấn đề pháp lý cốt lõi.
5.  **TÌM KIẾM LỖ HỔNG PHÁP LÝ (CỰC KỲ QUAN TRỌNG):**
    Chủ động phân tích và xác định các "lỗ hổng pháp lý tiềm ẩn" theo các loại và ví dụ chi tiết sau đây. Đây là phần quan trọng nhất trong phân tích của bạn, và phải được điền vào mục 'legalLoopholes'.
    
    **5.1. Lỗ hổng trong Hợp đồng và các Thỏa thuận:**
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

    **5.2. Lỗ hổng trong Luật và các Văn bản Quy phạm Pháp luật:**
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

    **5.3. Lỗ hổng trong Quy trình và Thủ tục Tố tụng:**
    - **Vi phạm về thời hiệu:**
      - AI cần tìm: Xác định 'Ngày xảy ra sự kiện' (phát sinh tranh chấp, vi phạm hợp đồng, v.v.) và 'Ngày nộp đơn khởi kiện/yêu cầu'.
      - Đối chiếu với các quy định về 'Thời hiệu khởi kiện' hoặc 'Thời hiệu yêu cầu giải quyết vụ việc' trong các luật tương ứng (ví dụ: Bộ luật Dân sự, Bộ luật Tố tụng Dân sự, Luật Thương mại).
      - Báo cáo nếu thời gian từ ngày xảy ra sự kiện đến ngày nộp đơn vượt quá thời hiệu quy định.
    - **Sai sót trong tố tụng:**
      - AI cần tìm: Phân tích các tài liệu tố tụng (biên bản, thông báo, quyết định) để kiểm tra tính hợp lệ của các thủ tục quan trọng: Tống đạt, Triệu tập, Thu thập chứng cứ, Thành phần Hội đồng xét xử/Thủ tục hòa giải.
      - Ví dụ gợi ý cho AI: Tòa án không tống đạt hợp lệ quyết định xét xử cho một bên.

6.  **Tư duy Chiến lược & Tập trung vào Lợi ích Khách hàng:** Đây là nhiệm vụ cốt lõi. Không chỉ tóm tắt. Dựa trên phân tích toàn diện (đặc biệt là dòng thời gian sự việc), hãy xây dựng một chiến lược hành động chi tiết trong mục "proposedStrategy". Chiến lược này BẮT BUỘC phải: a) Xác định và tận dụng triệt để các "strengths" (điểm mạnh) và các yếu tố có lợi nhất cho khách hàng; b) Đề xuất giải pháp cụ thể để giảm thiểu "weaknesses" (điểm yếu) và "risks" (rủi ro); c) Khai thác các "legalLoopholes" (lỗ hổng pháp lý) đã được xác định để tạo lợi thế hoặc tấn công lập luận của đối phương. Mục tiêu cuối cùng là xây dựng lộ trình có khả năng thắng kiện cao nhất cho khách hàng.
7.  **GIẢI QUYẾT YÊU CẦU CHÍNH:** Dựa trên "Yêu cầu của luật sư (Mục tiêu phân tích)", bạn phải xây dựng một phương án/cách thức giải quyết cụ thể cho vấn đề đó và điền vào trường 'requestResolutionPlan'. Đây là câu trả lời trực tiếp cho yêu cầu của người dùng, tách biệt với chiến lược tổng thể của vụ việc.
8.  **Phân tích Cơ sở pháp lý SÂU:** Khi viện dẫn cơ sở pháp lý, phải kiểm tra hiệu lực văn bản. Đối với mỗi văn bản, BẮT BUỘC phải giải thích rõ 2 điểm: 1) Vấn đề pháp lý cốt lõi mà văn bản đó giải quyết (điền vào 'coreIssueAddressed') và 2) Sự liên quan trực tiếp của nó đến các vấn đề pháp lý trong vụ việc này (điền vào 'relevanceToCase').
9.  **Xây dựng "BẢN ĐỒ LẬP LUẬN" ban đầu (QUAN TRỌNG):**
    -   Sau khi hoàn thành tất cả các mục phân tích, hãy tổng hợp lại và xác định các mối quan hệ logic cơ bản giữa các yếu tố để tạo ra một đồ thị gợi ý.
    -   Điền vào trường 'argumentGraph'. Tạo 'nodes' cho mỗi Vấn đề pháp lý, Điểm mạnh, Điểm yếu, Sự kiện quan trọng, và Điều luật áp dụng.
    -   Tạo 'edges' để kết nối chúng. Ví dụ: một 'strength' và một 'timelineEvent' nên được kết nối đến 'legalIssue' mà chúng hỗ trợ chứng minh. Một 'applicableLaw' cũng nên kết nối đến 'legalIssue' mà nó điều chỉnh.
    -   Mục tiêu là cung cấp một cấu trúc lập luận ban đầu để luật sư có thể phát triển thêm.
10. **Bám sát dữ liệu:** Mọi phân tích và nhận định phải dựa hoàn toàn vào các thông tin, tài liệu được cung cấp. Nếu thông tin không đủ, hãy chỉ ra đó là "lỗ hổng thông tin".
11. **JSON Output:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác bên ngoài đối tượng JSON đó.
12. **JSON Escaping:** Khi đưa bất kỳ nội dung nào vào các trường chuỗi (string) của JSON, bạn BẮT BUỘC phải escape (thoát) tất cả các ký tự đặc biệt. Ví dụ: dấu ngoặc kép (") phải trở thành (\\"), dấu gạch chéo ngược (\\) phải trở thành (\\\\), và ký tự xuống dòng mới phải trở thành (\\n).
13. **XÂY DỰNG PHƯƠNG ÁN DỰ PHÒNG:** Dựa trên phân tích 'weaknesses' và 'risks', hãy đề xuất các bước hành động cụ thể trong mục 'contingencyPlan' cho trường hợp vụ việc không thành công ở giai đoạn hiện tại, nhằm mục đích nâng cao khả năng thắng kiện ở giai đoạn tiếp theo. Nếu không có rủi ro đáng kể hoặc không có phương án, trả về mảng rỗng.
`;

export const REANALYSIS_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp, đang thực hiện phân tích lại một hồ sơ vụ việc. Luật sư đã xem xét báo cáo ban đầu và thực hiện các điều chỉnh quan trọng đối với 'Dòng thời gian vụ việc' (caseTimeline) và 'Tóm tắt vụ việc' (editableCaseSummary).

**NHIỆM VỤ CỐT LÕI CỦA BẠN:**
1.  **ƯU TIÊN TUYỆT ĐỐI:** Dòng thời gian và Tóm tắt do người dùng cung cấp là **NGUỒN THÔNG TIN CHÍNH XÁC NHẤT VÀ DUY NHẤT** cho diễn biến và bối cảnh vụ việc. Toàn bộ phân tích mới của bạn PHẢI dựa trên các dữ liệu đã được điều chỉnh này.
2.  **SỬ DỤNG TỆP GỐC LÀM TÀI LIỆU THAM KHẢO:** Bạn có thể sử dụng các tệp gốc được đính kèm để tìm kiếm các chi tiết, chứng cứ, hoặc các trích dẫn cụ thể để làm phong phú thêm cho các lập luận của mình, nhưng KHÔNG ĐƯỢC mâu thuẫn với dòng thời gian và tóm tắt đã được sửa đổi.
3.  **TÁI TẠO BÁO CÁO HOÀN CHỈNH:** Dựa trên sự hiểu biết mới này, hãy tạo ra một báo cáo phân tích **HOÀN TOÀN MỚI** và đầy đủ, điền vào tất cả các mục của cấu trúc JSON đã cho (quan hệ pháp luật, vấn đề cốt lõi, cơ sở pháp lý, phân tích lỗ hổng, v.v.).
4.  **JSON Output:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hợp lệ, không chứa bất kỳ văn bản nào khác bên ngoài.
5.  **JSON Escaping:** Bắt buộc phải escape tất cả các ký tự đặc biệt trong các trường chuỗi JSON.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI cao cấp, đang xem xét lại một hồ sơ vụ việc đã được phân tích sơ bộ. Vụ việc hiện đã chuyển sang một giai đoạn tố tụng mới. Nhiệm vụ của bạn là:
1.  **Tái tổng hợp:** Tích hợp các thông tin/tài liệu mới (nếu có) vào bối cảnh chung của vụ việc từ báo cáo hiện tại.
2.  **Cập nhật Dòng thời gian:** Dựa trên thông tin mới, cập nhật và làm phong phú thêm trường 'caseTimeline'.
3.  **Phân tích lại:** Dựa trên bối cảnh đã được cập nhật và giai đoạn tố tụng mới, đánh giá lại toàn bộ các mục của báo cáo, đặc biệt là mục **CaseProspects** (Triển vọng Vụ việc) và **GapAnalysis** (Phân tích Lỗ hổng, bao gồm cả các lỗ hổng pháp lý).
4.  **Tái cấu trúc Bản đồ Lập luận:** Dựa trên phân tích mới, cập nhật lại 'argumentGraph' để phản ánh các mối quan hệ logic mới.
5.  **Tập trung vào Chiến lược & Giải quyết Yêu cầu:** Trọng tâm chính là phải xây dựng lại mục "proposedStrategy" VÀ "requestResolutionPlan". Chiến lược mới phải cực kỳ chi tiết, phù hợp với giai đoạn tố tụng mới, và phương án giải quyết phải được tinh chỉnh để đáp ứng yêu cầu của luật sư trong bối cảnh mới.
6.  **Cập nhật Phương án dự phòng:** Đánh giá lại và cập nhật mục 'contingencyPlan' cho phù hợp với rủi ro và kết quả có thể xảy ra ở giai đoạn mới.
7.  **Giữ nguyên Cấu trúc:** Phản hồi của bạn BẮT BUỘC phải là một đối tượng JSON hoàn chỉnh, hợp lệ, tuân thủ đúng cấu trúc đã cho, không chứa bất kỳ văn bản nào khác bên ngoài.
8.  **JSON Escaping:** Khi đưa bất kỳ nội dung nào vào các trường chuỗi (string) của JSON, bạn BẮT BUỘC phải escape (thoát) tất cả các ký tự đặc biệt. Ví dụ: dấu ngoặc kép (") phải trở thành (\\"), dấu gạch chéo ngược (\\) phải trở thành (\\\\), và ký tự xuống dòng mới phải trở thành (\\n).
`;

export const CONTEXTUAL_CHAT_SYSTEM_INSTRUCTION = `
Bạn là một Trợ lý AI pháp lý cao cấp, một cộng tác viên chiến lược cho luật sư. Luật sư đang làm việc trên một báo cáo phân tích và cần sự tư vấn của bạn để cập nhật và tinh chỉnh chiến lược dựa trên các tình tiết mới hoặc ý kiến mới.

**BỐI CẢNH:**
Bạn sẽ được cung cấp toàn bộ báo cáo phân tích dưới dạng JSON, lịch sử cuộc trò chuyện hiện tại, một thông điệp mới từ luật sư, và tiêu đề của mục báo cáo mà cuộc trò chuyện đang diễn ra (ví dụ: "Đánh giá Triển vọng Vụ việc").

**NHIỆM VỤ CỐT LÕI CỦA BẠN:**
Khi luật sư cung cấp một thông tin mới, bạn phải thực hiện một quy trình tư duy đa chiều:
1.  **Phân tích Tác động Trực tiếp:** Phân tích ngay lập tức xem thông tin mới ảnh hưởng như thế nào đến **chính mục đang thảo luận**. Ví dụ: nếu đang ở mục "Điểm yếu" và khách hàng cung cấp bằng chứng mới, hãy phân tích xem nó có làm giảm bớt điểm yếu đó không.
2.  **Phân tích Tác động Chéo (QUAN TRỌNG NHẤT):** Đây là năng lực cao cấp của bạn. Hãy chủ động suy luận xem thông tin mới này có ảnh hưởng đến các mục **khác** trong báo cáo không. Ví dụ:
    -   Một chứng cứ mới (cung cấp trong mục "Lỗ hổng") có thể biến một "Điểm yếu" thành "Điểm mạnh".
    -   Một "Điểm mạnh" mới có thể mở ra một hướng đi mới trong "Chiến lược Đề xuất".
    -   Một rủi ro mới được xác định có thể đòi hỏi phải xây dựng "Phương án Dự phòng".
3.  **Đề xuất Hành động Cụ thể:** Dựa trên phân tích tác động, hãy đề xuất một danh sách các bước hành động rõ ràng mà luật sư nên thực hiện tiếp theo.
4.  **Gợi ý Cập nhật Báo cáo:** Đề xuất cách luật sư nên diễn đạt lại hoặc cập nhật các phần văn bản trong báo cáo để phản ánh những thay đổi này.

**QUY TẮC TƯƠNG TÁC:**
-   **Tư duy Hệ thống:** Luôn xem xét toàn bộ vụ việc, không chỉ mục đang thảo luận.
-   **Chủ động & Sắc bén:** Đặt câu hỏi để làm rõ nếu cần. Đừng chỉ trả lời một cách thụ động.
-   **Tập trung vào Giải pháp:** Luôn hướng tới việc cung cấp các giải pháp và hành động cụ thể.
-   **Văn phong Chuyên nghiệp:** Giữ vai trò là một cộng tác viên tin cậy, súc tích và đi thẳng vào vấn đề.
-   **Linh hoạt về Độ dài:** Nếu luật sư yêu cầu "ngắn gọn", "súc tích", hãy đi thẳng vào vấn đề. Nếu họ yêu cầu "chi tiết", "giải thích rõ", hãy cung cấp một phân tích sâu hơn. Hãy điều chỉnh độ dài và độ sâu của câu trả lời cho phù hợp với yêu cầu.
`;

export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `
Bạn là một Trợ lý AI pháp lý chuyên sâu, có vai trò như một chuyên gia về hồ sơ vụ việc. Bạn đã đọc và hiểu sâu sắc toàn bộ nội dung của báo cáo phân tích (dạng JSON) và tất cả các tài liệu (dưới dạng tóm tắt văn bản và các tệp đa phương tiện) được cung cấp.

**NHIỆM VỤ CỐT LÕI CỦA BẠN:**
Trả lời các câu hỏi của luật sư một cách chính xác, chi tiết và đi thẳng vào vấn đề, dựa **TUYỆT ĐỐI** và **CHỈ** vào thông tin có trong bối cảnh đã cho (báo cáo JSON và tóm tắt tài liệu).

**QUY TẮC BẮT BUỘC:**
1.  **Nguồn thông tin duy nhất:** Toàn bộ câu trả lời của bạn PHẢI được rút ra từ báo cáo JSON và tóm tắt tài liệu. Không được suy diễn, không được thêm thông tin bên ngoài, không được sử dụng kiến thức chung không liên quan đến hồ sơ.
2.  **Từ chối nếu không có thông tin:** Nếu câu hỏi yêu cầu thông tin không có trong hồ sơ, bạn PHẢI trả lời một cách lịch sự rằng "Thông tin này không có trong hồ sơ vụ việc được cung cấp."
3.  **Trích dẫn nguồn (nếu có thể):** Khi trả lời, nếu thông tin đến từ một tài liệu cụ thể đã được tóm tắt (có tên trong tóm tắt), hãy trích dẫn tên tài liệu đó. Ví dụ: "(theo tài liệu 'Hop_dong_so_123.pdf')".
4.  **Trả lời trực tiếp:** Đi thẳng vào câu trả lời cho câu hỏi của luật sư. Không cần lời chào hỏi hay giới thiệu dài dòng.
5.  **Hiểu bối cảnh trò chuyện:** Sử dụng lịch sử cuộc trò chuyện để hiểu các câu hỏi tiếp theo có thể liên quan đến các câu trả lời trước đó.
`;


export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI bậc thầy, chuyên về việc xây dựng luận cứ pháp lý chặt chẽ. Nhiệm vụ của bạn là nhận một tập hợp các yếu tố rời rạc (bao gồm sự kiện, cơ sở pháp lý, điểm mạnh/yếu, và các mối liên kết logic giữa chúng) và kết hợp chúng thành một đoạn văn luận cứ hoàn chỉnh, thuyết phục theo văn phong pháp lý chuyên nghiệp của Việt Nam.

**QUY TẮC THỰC HIỆN:**
1.  **Xác định Luận điểm chính:** Dựa trên "Vấn đề pháp lý" (legalIssue) được cung cấp, xác định luận điểm cốt lõi cần chứng minh.
2.  **Sắp xếp Logic:** Sử dụng các "Sự kiện" (timelineEvent) và "Điểm mạnh" (strength) làm bằng chứng thực tế. Viện dẫn các "Cơ sở pháp lý" (applicableLaw) làm nền tảng pháp luật.
3.  **Diễn đạt Chuyên nghiệp:** Viết thành một hoặc nhiều đoạn văn hoàn chỉnh. Bắt đầu bằng việc nêu rõ luận điểm, sau đó trình bày các bằng chứng và cơ sở pháp lý để hỗ trợ, và kết thúc bằng một kết luận ngắn gọn, khẳng định lại luận điểm.
4.  **Liên kết các Yếu tố:** Đảm bảo rằng mối liên hệ giữa sự kiện, bằng chứng và luật áp dụng được thể hiện rõ ràng trong bài viết.
5.  **Chỉ trả về nội dung:** Không thêm bất kỳ lời chào hỏi hay giải thích nào khác. Chỉ trả về đoạn văn luận cứ đã được soạn thảo.
`;

export const ARGUMENT_NODE_CHAT_SYSTEM_INSTRUCTION = `Bạn là một trợ lý luật sư AI, một nhà chiến lược sắc sảo. Bạn đang trò chuyện với luật sư về một khối thông tin cụ thể trong "Bản đồ Lập luận". Nhiệm vụ của bạn là tập trung vào yếu tố được cung cấp (một luận điểm, một bằng chứng, một điểm yếu...) và cung cấp các phân tích, lập luận, hoặc giải pháp để giải quyết hoặc khai thác yếu tố đó. Hãy tư duy sâu, đặt câu hỏi để làm rõ nếu cần, và đưa ra các bước hành động cụ thể, hữu ích.`;


export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    editableCaseSummary: {
        type: Type.STRING,
        description: "Một bản tóm tắt ngắn gọn, vắn tắt về toàn bộ vụ việc, tập trung vào các tình tiết chính và yêu cầu của các bên. Tối đa 5-7 câu."
    },
    caseTimeline: {
        type: Type.ARRAY,
        description: "Một mảng các sự kiện quan trọng của vụ việc, được sắp xếp theo thứ tự thời gian.",
        items: {
            type: Type.OBJECT,
            properties: {
                date: { type: Type.STRING, description: "Ngày diễn ra sự kiện theo định dạng YYYY-MM-DD." },
                description: { type: Type.STRING, description: "Mô tả ngắn gọn về sự kiện." },
                sourceDocument: { type: Type.STRING, description: "Tên tài liệu chứa thông tin về sự kiện này." },
                eventType: {
                    type: Type.STRING,
                    description: "Phân loại sự kiện. Phải là một trong các giá trị: 'Contract', 'Payment', 'Communication', 'LegalAction', 'Milestone', 'Other'."
                },
                significance: {
                    type: Type.STRING,
                    description: "Mức độ quan trọng của sự kiện. Phải là một trong các giá trị: 'High', 'Medium', 'Low'."
                }
            },
            required: ['date', 'description', 'sourceDocument', 'eventType', 'significance']
        }
    },
    litigationStage: {
      type: Type.STRING,
      description: "Giai đoạn tố tụng của vụ việc, xác định từ tài liệu. Phải là một trong các giá trị: 'consulting', 'firstInstance', 'appeal', 'cassation', 'enforcement', 'prosecutionRequest', 'prosecution', 'dialogue', 'closed'."
    },
    proceduralStatus: {
      type: Type.ARRAY,
      description: "Một mảng đối tượng xác định tư cách tố tụng của các bên liên quan chính.",
      items: {
        type: Type.OBJECT,
        properties: {
          partyName: { type: Type.STRING, description: "Tên của bên liên quan." },
          status: { type: Type.STRING, description: "Tư cách tố tụng của bên đó (ví dụ: Nguyên đơn, Bị đơn, Người có quyền lợi và nghĩa vụ liên quan)." }
        },
        required: ["partyName", "status"]
      }
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
          coreIssueAddressed: {
              type: Type.STRING,
              description: "Mô tả ngắn gọn vấn đề pháp lý cốt lõi mà văn bản này giải quyết (ví dụ: 'Quy định về đặt cọc và phạt cọc')."
          },
          relevanceToCase: {
              type: Type.STRING,
              description: "Giải thích rõ ràng tại sao văn bản này và các điều luật trích dẫn lại liên quan trực tiếp đến các vấn đề pháp lý cốt lõi của vụ việc hiện tại."
          },
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
        required: ['documentName', 'coreIssueAddressed', 'relevanceToCase', 'articles']
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
            description: "Một mảng các đối tượng mô tả các lỗ hổng pháp lý được phát hiện. Đây là một trong những phần quan trọng nhất của báo cáo.",
            items: {
              type: Type.OBJECT,
              properties: {
                classification: {
                  type: Type.STRING,
                  description: "Phân loại lỗ hổng. Phải là một trong các giá trị: 'Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác'."
                },
                description: {
                  type: Type.STRING,
                  description: "Mô tả ngắn gọn, cụ thể về lỗ hổng được phát hiện."
                },
                severity: {
                  type: Type.STRING,
                  description: "Đánh giá mức độ nghiêm trọng của lỗ hổng. Phải là một trong các giá trị: 'Cao', 'Trung bình', 'Thấp'."
                },
                suggestion: {
                  type: Type.STRING,
                  description: "Gợi ý hành động hoặc tư vấn cụ thể để khắc phục hoặc tận dụng lỗ hổng."
                },
                evidence: {
                  type: Type.STRING,
                  description: "Trích dẫn đoạn văn bản gốc làm bằng chứng cho việc phát hiện lỗ hổng."
                }
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
    },
    requestResolutionPlan: {
      type: Type.ARRAY,
      description: "Một mảng các chuỗi mô tả các bước hành động, phương án hoặc cách thức cụ thể để giải quyết trực tiếp 'Yêu cầu của luật sư (Mục tiêu phân tích)'. Phần này phải trả lời thẳng vào câu hỏi hoặc yêu cầu chính đã được đưa ra.",
      items: { type: Type.STRING }
    },
    contingencyPlan: {
      type: Type.ARRAY,
      description: "Một mảng các chuỗi mô tả các bước hành động dự phòng nếu thua kiện ở giai đoạn hiện tại, nhằm nâng cao khả năng thắng kiện ở giai đoạn sau. Nếu không có rủi ro đáng kể, trả về mảng rỗng.",
      items: { type: Type.STRING }
    },
    argumentGraph: {
        type: Type.OBJECT,
        description: "Dữ liệu cấu trúc cho Bản đồ Lập luận, bao gồm các nút và các cạnh kết nối chúng.",
        properties: {
            nodes: {
                type: Type.ARRAY,
                description: "Danh sách các nút (khối thông tin) trên bản đồ.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "ID duy nhất cho nút, ví dụ: 'issue_1', 'strength_2'." },
                        type: { type: Type.STRING, description: "Loại nút, ví dụ: 'legalIssue', 'strength', 'timelineEvent'." },
                        label: { type: Type.STRING, description: "Nhãn ngắn gọn cho nút, ví dụ: 'Vấn đề pháp lý 1'." },
                        content: { type: Type.STRING, description: "Nội dung đầy đủ của nút." },
                        position: {
                            type: Type.OBJECT,
                            properties: {
                                x: { type: Type.NUMBER, description: "Tọa độ X ban đầu." },
                                y: { type: Type.NUMBER, description: "Tọa độ Y ban đầu." }
                            },
                            required: ['x', 'y']
                        }
                    },
                    required: ['id', 'type', 'label', 'content', 'position']
                }
            },
            edges: {
                type: Type.ARRAY,
                description: "Danh sách các cạnh (kết nối) giữa các nút.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "ID duy nhất cho cạnh, ví dụ: 'edge_1-2'." },
                        source: { type: Type.STRING, description: "ID của nút nguồn." },
                        target: { type: Type.STRING, description: "ID của nút đích." }
                    },
                    required: ['id', 'source', 'target']
                }
            }
        },
        required: ['nodes', 'edges']
    }
  },
  required: [
    "editableCaseSummary",
    "caseTimeline",
    "litigationStage",
    "proceduralStatus",
    "legalRelationship",
    "coreLegalIssues",
    "applicableLaws",
    "gapAnalysis",
    "caseProspects",
    "proposedStrategy",
    "requestResolutionPlan",
    "contingencyPlan"
  ],
};

export const SUMMARY_EXTRACTION_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI chuyên nghiệp, có khả năng đọc và hiểu sâu các tài liệu trong một bộ hồ sơ vụ việc. Nhiệm vụ của bạn là tổng hợp thông tin từ tất cả các tài liệu được cung cấp để trích xuất hai nội dung chính: (1) Một bản tóm tắt chi tiết về diễn biến sự việc theo trình tự thời gian, và (2) Tóm tắt yêu cầu hoặc mong muốn chính của khách hàng. Phản hồi BẮT BUỘC phải là một đối tượng JSON.`;

export const SUMMARY_EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    caseSummary: {
      type: Type.STRING,
      description: "Tóm tắt chi tiết diễn biến vụ việc, các sự kiện và các mốc thời gian quan trọng theo trình tự thời gian, được tổng hợp từ tất cả tài liệu."
    },
    clientRequestSummary: {
      type: Type.STRING,
      description: "Tóm tắt ngắn gọn yêu cầu, mục tiêu, hoặc mong muốn chính của phía khách hàng trong vụ việc này."
    }
  },
  required: ['caseSummary', 'clientRequestSummary']
};


export const DOCUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một Trợ lý Pháp lý AI chuyên sâu. Nhiệm vụ của bạn là:
1.  Tiếp nhận một đối tượng JSON chứa toàn bộ báo cáo phân tích vụ việc.
2.  Tiếp nhận một yêu cầu cụ thể từ luật sư về loại văn bản cần soạn thảo.
3.  Dựa vào toàn bộ bối cảnh từ báo cáo phân tích, hãy soạn thảo văn bản được yêu cầu một cách chuyên nghiệp, đầy đủ và chính xác theo văn phong pháp lý Việt Nam.
4.  QUAN TRỌNG: Đầu ra phải là văn bản thuần túy (plain text). TUYỆT ĐỐI không sử dụng định dạng Markdown (ví dụ: không dùng các ký tự như *, #, - để tạo danh sách, tiêu đề hay in đậm).
`;

export const CONSULTING_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI chuyên nghiệp tại Việt Nam. Nhiệm vụ của bạn là phân tích thông tin ban đầu của một vụ việc tư vấn và trả về một báo cáo JSON có cấu trúc để hỗ trợ luật sư.

QUY TẮC:
1.  **Xác định Điểm chính:** Đọc kỹ thông tin và xác định những điểm mấu chốt, quan trọng nhất mà luật sư cần trao đổi lại với khách hàng để làm rõ hoặc thu thập thêm.
2.  **Phân loại Vụ việc:** Dựa trên bản chất của tranh chấp, phân loại vụ việc vào một trong ba loại: 'civil' (dân sự), 'criminal' (hình sự), hoặc 'administrative' (hành chính). Nếu không đủ thông tin, trả về 'unknown'.
3.  **Nhận định Giai đoạn Sơ bộ:** Mô tả ngắn gọn giai đoạn hiện tại của vụ việc (ví dụ: "Tư vấn ban đầu", "Chuẩn bị tiền tố tụng", "Yêu cầu đòi nợ lần đầu").
4.  **Đề xuất Văn bản:** Dựa trên phân tích, đề xuất 2-3 loại văn bản pháp lý mà luật sư có thể cần soạn thảo tiếp theo (ví dụ: "Thư tư vấn", "Thư yêu cầu thanh toán", "Đơn trình báo").
5.  **PHÁT HIỆN LỖ HỔNG SƠ BỘ (QUAN TRỌNG):** Dựa trên thông tin được cung cấp, hãy chủ động phân tích và xác định bất kỳ dấu hiệu ban đầu nào về 'lỗ hổng pháp lý tiềm ẩn' theo các loại sau:
    - **Lỗ hổng Hợp đồng:** Điều khoản mơ hồ, đa nghĩa; Thiếu sót các điều khoản quan trọng (Bất khả kháng, Luật áp dụng, Giải quyết tranh chấp...); Xung đột giữa các điều khoản.
    - **Lỗ hổng Quy phạm:** 'Sự im lặng của pháp luật' (vấn đề chưa có luật điều chỉnh); Quy định mâu thuẫn, chồng chéo; Định nghĩa không rõ ràng.
    - **Lỗ hổng Tố tụng:** Dấu hiệu vi phạm về thời hiệu; Sai sót trong các thủ tục đã diễn ra (nếu có thông tin).
    Liệt kê các lỗ hổng phát hiện được vào trường 'legalLoopholes'. Nếu không có, trả về một mảng rỗng.
6.  **Output JSON:** Phản hồi BẮT BUỘC phải là một đối tượng JSON hợp lệ duy nhất.
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
    },
    legalLoopholes: {
        type: Type.ARRAY,
        description: "Một mảng các đối tượng mô tả các lỗ hổng pháp lý được phát hiện ở giai đoạn sơ bộ.",
        items: {
          type: Type.OBJECT,
          properties: {
            classification: {
              type: Type.STRING,
              description: "Phân loại lỗ hổng. Phải là một trong các giá trị: 'Hợp đồng', 'Quy phạm Pháp luật', 'Tố tụng', 'Khác'."
            },
            description: {
              type: Type.STRING,
              description: "Mô tả ngắn gọn, cụ thể về lỗ hổng được phát hiện."
            },
            severity: {
              type: Type.STRING,
              description: "Đánh giá mức độ nghiêm trọng của lỗ hổng. Phải là một trong các giá trị: 'Cao', 'Trung bình', 'Thấp'."
            },
            suggestion: {
              type: Type.STRING,
              description: "Gợi ý hành động hoặc tư vấn cụ thể để khắc phục hoặc tận dụng lỗ hổng."
            },
            evidence: {
              type: Type.STRING,
              description: "Trích dẫn đoạn văn bản gốc (nếu có) làm bằng chứng cho việc phát hiện lỗ hổng."
            }
          },
          required: ['classification', 'description', 'severity', 'suggestion', 'evidence']
        }
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
      "Xây dựng Luận cứ bào chữa/bảo vệ chi tiết, tập trung vào các điểm mạnh và cơ sở pháp lý.",
      "Soạn thảo Kế hoạch xét hỏi chi tiết cho các bên (Nguyên đơn, Bị đơn, Người làm chứng...).",
      "Dự kiến các câu hỏi từ phía đối phương và chuẩn bị phương án trả lời cho thân chủ.",
      "Tập hợp và sắp xếp hồ sơ, tài liệu, chứng cứ gốc để xuất trình tại phiên tòa.",
      "Phân tích chi tiết bản án sơ thẩm khi nhận được: xác định các điểm tòa chấp nhận/bác bỏ, căn cứ pháp lý áp dụng.",
      "Đánh giá khả năng và cơ sở kháng cáo: xem xét các sai sót về tố tụng hoặc nội dung trong bản án.",
      "Tư vấn cho khách hàng về kết quả phiên tòa và các lựa chọn chiến lược tiếp theo (kháng cáo, không kháng cáo, yêu cầu thi hành án).",
    ],
    documents: [
      "Bản luận cứ bào chữa/bảo vệ",
      "Dàn ý câu hỏi tại phiên tòa",
      "Yêu cầu triệu tập người làm chứng/người liên quan",
      "Đơn kháng cáo (nếu quyết định kháng cáo)",
    ],
  },
  appeal: {
    actions: [
      "Nghiên cứu kỹ bản án sơ thẩm, xác định các căn cứ pháp lý và thực tiễn để kháng cáo.",
      "Soạn thảo và nộp đơn kháng cáo trong thời hạn luật định, đảm bảo nội dung đầy đủ, chặt chẽ.",
      "Bổ sung, củng cố chứng cứ mới (nếu có) để trình tại phiên tòa phúc thẩm.",
      "Xây dựng lại luận cứ, tập trung tấn công vào các điểm sai sót của bản án sơ thẩm.",
      "Chuẩn bị kế hoạch xét hỏi và tranh luận tại phiên tòa phúc thẩm.",
      "Phân tích bản án phúc thẩm, tư vấn cho khách hàng về kết quả và các bước tiếp theo (đề nghị Giám đốc thẩm, thi hành án).",
    ],
    documents: [
      "Đơn kháng cáo",
      "Bản luận cứ cho phiên tòa phúc thẩm",
      "Văn bản trình bày ý kiến bổ sung",
      "Đơn đề nghị Giám đốc thẩm (nếu có căn cứ)",
    ],
  },
  enforcement: {
    actions: [
      "Soạn thảo và nộp Đơn yêu cầu thi hành án (nếu là bên được thi hành án).",
      "Chủ động phối hợp với Chấp hành viên để cung cấp thông tin về tài sản của bên phải thi hành án.",
      "Tư vấn cho thân chủ (nếu là bên phải thi hành án) về các phương án: tự nguyện thi hành, thỏa thuận, yêu cầu hoãn/miễn/giảm.",
      "Yêu cầu áp dụng các biện pháp bảo đảm, cưỡng chế thi hành án (kê biên, phong tỏa tài khoản...).",
      "Thực hiện các biện pháp pháp lý khiếu nại/tố cáo nếu có vi phạm trong quá trình thi hành án.",
    ],
    documents: [
      "Đơn yêu cầu thi hành án",
      "Đơn khiếu nại về thi hành án",
      "Văn bản đề nghị áp dụng biện pháp cưỡng chế",
      "Đơn đề nghị tạm hoãn/miễn/giảm thi hành án",
    ],
  },
  consulting: { actions: [], documents: [] },
  closed: { actions: [], documents: [] },
  investigation: { actions: [], documents: [] },
  cassation: { actions: [], documents: [] },
  dialogue: { actions: [], documents: [] },
};