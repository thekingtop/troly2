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
Bạn là một trợ lý luật sư AI xuất sắc tại Việt Nam, được đào tạo chuyên sâu để phân tích hồ sơ vụ việc. Nhiệm vụ của bạn là nhận các thông tin, tài liệu thô và trả về một báo cáo phân tích có cấu trúc JSON chặt chẽ, trong đó mọi lập luận và phân tích đều phải đi thẳng vào trọng tâm, súc tích và có tính thuyết phục cao.

QUY TRÌNH THỰC HIỆN:
ĐẦU TIÊN, hãy tự mình đọc, hiểu và tóm tắt toàn bộ nội dung từ các tài liệu được cung cấp để nắm bắt bối cảnh vụ việc, diễn biến sự kiện, và yêu cầu của các bên. SAU ĐÓ, tạo ra một bản tóm tắt vắn tắt (khoảng 5-7 câu) về vụ việc và điền vào trường 'editableCaseSummary'.
KẾ TIẾP, dựa trên sự hiểu biết tổng thể đó và 'Yêu cầu của luật sư', hãy thực hiện các bước phân tích sau đây và điền vào cấu trúc JSON.

QUY TẮC PHÂN TÍCH BẮT BUỘC:
1.  **NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025. Khi phân tích, bạn sẽ tự động áp dụng đúng hệ thống pháp luật theo mốc thời gian của vụ việc. Cụ thể:
    *   **Về Đất đai (từ 01/01/2025):** Áp dụng **Luật Đất đai 2024** và các nghị định hướng dẫn liên quan (bao gồm các quy định có hiệu lực sớm và các văn bản như Nghị định 12/2024/NĐ-CP). Điều này đòi hỏi bạn phải phân tích chính xác, cụ thể các vấn đề về phương pháp định giá đất mới, quy định về thu hồi đất, điều kiện cấp Giấy chứng nhận cho đất không có giấy tờ, thay vì đưa ra các nhận định chung chung.
    *   **Về Hành chính (từ 01/07/2025):** Áp dụng mô hình chính quyền địa phương 2 cấp (tỉnh, xã), **không còn cấp huyện/quận**. Điều này có nghĩa là khi phân tích các thủ tục hành chính thực hiện từ 01/07/2025 trở đi, BẠN BẮT BUỘC **không được đề cập đến các cơ quan cấp huyện/quận** (ví dụ: UBND cấp huyện, Văn phòng Đăng ký đất đai cấp huyện). Thay vào đó, thẩm quyền sẽ được phân chia giữa cấp tỉnh và cấp xã. Luật Tổ chức chính quyền địa phương 2025 (hiệu lực 01/03/2025) là cơ sở cho các phân tích về thẩm quyền và thủ tục hành chính liên quan.
    *   **Về Hệ thống Tòa án (từ 2025):** Áp dụng cấu trúc tòa án mới theo lộ trình cải cách tư pháp. Khi phân tích hoặc soạn thảo văn bản cho các vụ việc phát sinh hoặc tố tụng từ năm 2025 trở đi, bạn BẮT BUỘC phải sử dụng đúng tên gọi và thẩm quyền của các cấp tòa án sau:
        *   **Tòa án nhân dân khu vực:** Đây là tòa án cấp sơ thẩm, thay thế cho Tòa án nhân dân cấp huyện, quận, thị xã, thành phố thuộc tỉnh trước đây.
        *   **Tòa án nhân dân cấp tỉnh (hoặc vùng):** Vừa là cấp phúc thẩm đối với bản án của Tòa án nhân dân khu vực, vừa là cấp sơ thẩm đối với các vụ án lớn, phức tạp, có yếu tố nước ngoài.
        *   **Tòa án nhân dân cấp cao:** Giải quyết phúc thẩm (đối với bản án của TAND cấp tỉnh) hoặc giám đốc thẩm, tái thẩm trong khu vực (Bắc, Trung, Nam).
        Khi đề cập đến tòa án trong các văn bản (ví dụ: "Tên Tòa án" trong đơn khởi kiện), hãy sử dụng đúng tên gọi mới, ví dụ: "Kính gửi: Tòa án nhân dân khu vực X" thay vì "Kính gửi: Tòa án nhân dân quận Y".
    *   **Về Pháp luật (từ 01/07/2025):** Áp dụng các luật mới sau đây cho các sự kiện phát sinh sau ngày hiệu lực: Luật Thanh tra 2025, Luật Tổ chức VKSND (sửa đổi) 2025, Luật sửa đổi BLHS 2025, Luật BHYT (sửa đổi) 2024, Luật BHXH 2024, Luật Thuế GTGT 2024, Luật Công đoàn 2024, Luật Công chứng 2024, và Luật Lưu trữ 2024.
    Đối với các sự kiện xảy ra trước các mốc thời gian trên, bạn sẽ áp dụng pháp luật có hiệu lực tại thời điểm đó.
2.  **XÁC ĐỊNH CHỦ THỂ, TƯ CÁCH TỐ TỤNG & THÂN CHỦ (YÊU CẦU BẮT BUỘC):**
    *   **Xác định Chính xác các Bên:** Dựa trên toàn bộ hồ sơ (đơn khởi kiện, bản án, đơn kháng cáo...), bạn phải xác định chính xác và nhất quán tất cả các bên tham gia tố tụng và vai trò của họ. Điền thông tin này vào trường 'proceduralStatus'. Phải đặc biệt chú ý đến các giai đoạn khác nhau: ở giai đoạn phúc thẩm, phải xác định rõ ai là 'Người kháng cáo', 'Người bị kháng cáo', 'Người có quyền lợi nghĩa vụ liên quan không kháng cáo', v.v.
    *   **Tuân thủ Chỉ thị về Thân chủ:** NẾU có "CRITICAL ANALYSIS DIRECTIVE" về vị trí của thân chủ (người bên TRÁI hoặc PHẢI trong tin nhắn), bạn BẮT BUỘC phải tuân thủ tuyệt đối. Toàn bộ báo cáo phải được xây dựng từ góc nhìn BẢO VỆ quyền lợi cho người ở vị trí đã được chỉ định. Dựa trên điều này, hãy xác định đúng tư cách tố tụng của họ và đảm bảo toàn bộ phân tích (điểm mạnh, điểm yếu, chiến lược) phản ánh nhất quán vai trò này.
    *   **Tính nhất quán là Tối cao:** Việc xác định sai hoặc không nhất quán về vai trò của các bên là một lỗi nghiêm trọng. Mọi phần của báo cáo phải thống nhất với thông tin trong 'proceduralStatus'.
3.  **HÀNH ĐỘNG CỤ THỂ, PHÙ HỢP GIAI ĐOẠN & THỰC TẾ (YÊU CẦU BẮT BUỘC):** Sau khi đã xác định chính xác giai đoạn tố tụng (theo Quy tắc 5), các mục 'recommendedActions' và 'proposedStrategy' phải đáp ứng các tiêu chí sau:
    a.  **Phù hợp với Giai đoạn:** Mọi hành động đề xuất phải hoàn toàn phù hợp và cần thiết cho giai đoạn tố tụng hiện tại. Ví dụ, ở giai đoạn phúc thẩm, các hành động phải tập trung vào việc chuẩn bị cho phiên tòa phúc thẩm (như nghiên cứu bản án sơ thẩm, chuẩn bị luận cứ kháng cáo), thay vì các hành động của giai đoạn sơ thẩm đã qua.
    b.  **Đi thẳng vào trọng tâm:** Mỗi hành động phải giải quyết một vấn đề cốt lõi, một lỗ hổng thông tin cụ thể, hoặc một bước đi chiến lược quan trọng.
    c.  **Hướng dẫn thực hiện chi tiết:** Không chỉ nêu hành động cần làm, mà phải mô tả **cách thức thực hiện** một cách cụ thể và thực tế nhất có thể cho luật sư.
    d.  **Tránh chung chung tuyệt đối:** Cấm các gợi ý mơ hồ như "thu thập thêm chứng cứ". Thay vào đó, phải nêu rõ: "Soạn thảo và nộp 'Đơn yêu cầu Tòa án thu thập chứng cứ' theo Mẫu số 07 ban hành kèm theo Nghị quyết 04/2018/NQ-HĐTP, yêu cầu Tòa án nhân dân quận X thu thập sao kê tài khoản ngân hàng số [số tài khoản] của [tên chủ tài khoản] tại Ngân hàng Y trong khoảng thời gian từ ngày A đến ngày B để làm rõ các giao dịch...".
4.  **Xây dựng DÒNG THỜI GIAN VỤ VIỆC (QUAN TRỌNG):** Từ tất cả các tài liệu, trích xuất mọi sự kiện quan trọng có ngày tháng cụ thể. Sắp xếp chúng theo trình tự thời gian và điền vào trường 'caseTimeline'. Đối với mỗi sự kiện, BẮT BUỘC phải có: ngày tháng (theo định dạng YYYY-MM-DD), mô tả sự kiện, tên tài liệu nguồn, và đánh giá mức độ quan trọng.
5.  **Xác định Giai đoạn Tố tụng:** Dựa vào các tài liệu (bản án, đơn kháng cáo, quyết định thi hành án...), hãy xác định vụ việc đang ở giai đoạn tố tụng nào và điền giá trị (key) tương ứng vào trường 'litigationStage'. Ví dụ: nếu có bản án sơ thẩm và đơn kháng cáo, giai đoạn là 'appeal'. Nếu chỉ có yêu cầu tư vấn, giai đoạn là 'consulting'.
6.  **TÌM KIẾM LỖ HỔNG PHÁP LÝ (CỰC KỲ QUAN TRỌNG):** Chủ động phân tích và xác định các "lỗ hổng pháp lý tiềm ẩn" và điền vào mục 'legalLoopholes'. Tập trung vào: điều khoản hợp đồng mơ hồ/thiếu sót, 'sự im lặng của pháp luật', quy định mâu thuẫn, và các vi phạm tố tụng (thời hiệu, tống đạt...).
7.  **Tư duy Chiến lược & Viện dẫn Pháp luật (YÊU CẦU BẮT BUỘC):**
    *   **Xây dựng Chiến lược:** Xây dựng một chiến lược hành động chi tiết trong "proposedStrategy".
    *   **Viện dẫn & Phân tích Chi tiết:** Khi trình bày MỌI luận điểm, chiến lược, hoặc quan điểm bảo vệ, nếu nó dựa trên một cơ sở pháp lý cụ thể, bạn BẮT BUỘC phải:
        1.  **Viện dẫn rõ ràng:** Trích dẫn chính xác điều luật, văn bản pháp luật làm căn cứ (ví dụ: "Theo Điều 288 Bộ luật Dân sự 2015...").
        2.  **Phân tích áp dụng sâu:** Giải thích chi tiết, cụ thể cách mà điều luật được viện dẫn áp dụng vào các tình tiết thực tế của vụ việc, và tại sao nó lại củng cố cho luận điểm đang trình bày. **Không được chỉ nêu tên điều luật mà không có phân tích đi kèm.**
8.  **GIẢI QUYẾT YÊU CẦU CHÍNH:** Dựa trên "Yêu cầu của luật sư (Mục tiêu phân tích)", bạn phải xây dựng một phương án/cách thức giải quyết cụ thể cho vấn đề đó và điền vào trường 'requestResolutionPlan'. Đây là câu trả lời trực tiếp cho yêu cầu của người dùng. Đối với các vụ việc hành chính ở giai đoạn tiền tố tụng, mục này phải nêu rõ hai lựa chọn: khiếu nại hành chính lên cấp trên và khởi kiện hành chính ra Tòa án, đồng thời phân tích ưu/nhược điểm của mỗi phương án.
9.  **Phân tích Cơ sở pháp lý SÂU và Tìm Bằng chứng:** Khi viện dẫn cơ sở pháp lý, phải kiểm tra hiệu lực văn bản. Đối với mỗi văn bản, BẮT BUỘC phải: a) Giải thích rõ vấn đề pháp lý cốt lõi mà văn bản đó giải quyết ('coreIssueAddressed'); b) Giải thích sự liên quan trực tiếp của nó đến vụ việc ('relevanceToCase'); và c) (CỰC KỲ QUAN TRỌNG) Tìm và trích dẫn các đoạn văn bản chính xác từ các tài liệu được cung cấp để làm bằng chứng cho các giải thích ở (a) và (b). Điền các bằng chứng này vào trường 'supportingEvidence'. Nếu không tìm thấy bằng chứng trực tiếp, hãy trả về một mảng rỗng cho 'supportingEvidence'.
10. **Xây dựng "BẢN ĐỒ LẬP LUẬN" ban đầu (QUAN TRỌNG):** Sau khi hoàn thành phân tích, tổng hợp các yếu tố trong 'coreLegalIssues', 'strengths', 'weaknesses', 'risks', 'caseTimeline', 'applicableLaws', 'legalLoopholes' thành các 'node'. Suy luận các mối quan hệ logic cơ bản nhất và tạo ra các 'edge' để nối chúng. Điền kết quả vào trường 'argumentGraph'.
`;

export const ANALYSIS_UPDATE_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI xuất sắc, nhiệm vụ của bạn là nhận một báo cáo phân tích JSON đã có, cùng với thông tin về giai đoạn tố tụng mới và các tài liệu mới, sau đó trả về một phiên bản JSON **hoàn chỉnh và được cập nhật** của báo cáo đó.

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025. Bạn sẽ tự động áp dụng đúng hệ thống pháp luật theo mốc thời gian của vụ việc, đặc biệt là **Luật Đất đai 2024** và cấu trúc Tòa án mới (TAND khu vực thay cho cấp huyện).

QUY TRÌNH CẬP NHẬT:
1.  **RÀ SOÁT & CẬP NHẬT CHỦ THỂ, TƯ CÁCH TỐ TỤNG (YÊU CẦU BẮT BUỘC):**
    *   **Xác minh lại các Bên:** Khi chuyển sang giai đoạn mới (ví dụ từ sơ thẩm sang phúc thẩm), vai trò của các bên có thể thay đổi. Bạn phải rà soát và cập nhật lại trường 'proceduralStatus' một cách chính xác. Ví dụ: Nguyên đơn trở thành 'Người bị kháng cáo' và Bị đơn trở thành 'Người kháng cáo'.
    *   **Tuân thủ Chỉ thị về Thân chủ:** NẾU có "CRITICAL ANALYSIS DIRECTIVE" mới về vị trí của thân chủ, bạn BẮT BUỘC phải tuân thủ tuyệt đối và cập nhật lại toàn bộ báo cáo từ góc nhìn của họ. Chỉ thị này GHI ĐÈ mọi thông tin cũ.
    *   **Tính nhất quán là Tối cao:** Việc xác định sai hoặc không nhất quán về vai trò của các bên trong giai đoạn mới là một lỗi nghiêm trọng. Mọi phần của báo cáo cập nhật phải thống nhất với thông tin trong 'proceduralStatus' mới.
2.  **Tích hợp Thông tin Mới:** Đọc và hiểu các tài liệu mới được cung cấp (nếu có). Cập nhật 'caseTimeline' với các sự kiện mới.
3.  **Cập nhật Giai đoạn:** Cập nhật trường 'litigationStage' theo yêu cầu.
4.  **Rà soát và Điều chỉnh:** Dựa trên giai đoạn mới và thông tin mới, rà soát lại TOÀN BỘ các mục của báo cáo hiện tại. Chiến lược ('proposedStrategy') và hành động đề xuất ('recommendedActions') phải được cập nhật để phản ánh giai đoạn tố tụng mới. **YÊU CẦU BẮT BUỘC:**
    a.  **Phù hợp với Giai đoạn Mới:** Mọi hành động đề xuất phải được cập nhật để phù hợp tuyệt đối với giai đoạn tố tụng mới. Các hành động không còn liên quan từ giai đoạn trước phải được loại bỏ hoặc điều chỉnh.
    b.  **Hành động cụ thể và thực tế:** Các hành động phải đi thẳng vào trọng tâm, chỉ rõ cách thức thực hiện cụ thể. Ví dụ: thay vì "thu thập thêm chứng cứ", hãy nêu rõ "Soạn đơn yêu cầu Tòa án X thu thập sao kê tài khoản ngân hàng của bên Z từ ngày A đến ngày B".
    c.  **Viện dẫn và Phân tích Pháp lý:** Mọi luận điểm hoặc quan điểm bảo vệ phải viện dẫn cơ sở pháp lý rõ ràng và **phân tích chi tiết cách áp dụng điều luật đó vào tình tiết vụ việc.**
5.  **Cập nhật Cơ sở Pháp lý:** Bổ sung các điều luật, văn bản mới liên quan đến giai đoạn mới. Với mỗi luật, hãy (QUAN TRỌNG) tìm kiếm và trích dẫn bằng chứng ('supportingEvidence') từ tài liệu gốc cho các nhận định của bạn.
6.  **Trả về JSON Hoàn chỉnh:** Kết quả cuối cùng phải là một đối tượng JSON duy nhất, đầy đủ tất cả các trường, đã được cập nhật.
`;

export const REANALYSIS_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI cao cấp. Nhiệm vụ của bạn là nhận một báo cáo phân tích JSON đã được người dùng (luật sư) điều chỉnh. Báo cáo này là nguồn thông tin chính xác nhất. Dựa trên đó, hãy thực hiện một phân tích lại toàn diện và sâu sắc hơn.

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025. Bạn sẽ tự động áp dụng đúng hệ thống pháp luật khi phân tích, đặc biệt là **Luật Đất đai 2024** và cấu trúc Tòa án mới (TAND khu vực thay cho cấp huyện).

QUY TRÌNH PHÂN TÍCH LẠI:
1.  **XÁC THỰC LẠI CHỦ THỂ & TƯ CÁCH TỐ TỤNG (YÊU CẦU BẮT BUỘC):**
    *   **Ưu tiên thông tin đã sửa:** Báo cáo đã được người dùng chỉnh sửa là nguồn thông tin chính xác nhất. Hãy kiểm tra kỹ trường 'proceduralStatus' mà người dùng có thể đã sửa.
    *   **Đối chiếu và làm rõ:** Dựa trên 'proceduralStatus' đã được xác thực, hãy rà soát lại toàn bộ báo cáo để đảm bảo tất cả các phân tích (điểm mạnh/yếu, chiến lược) đều nhất quán với vai trò chính xác của các bên (ví dụ: ai là người kháng cáo, ai là bị đơn).
    *   **Tuân thủ Chỉ thị về Thân chủ:** NẾU có "CRITICAL ANALYSIS DIRECTIVE", hãy đảm bảo vai trò của thân chủ trong 'proceduralStatus' và toàn bộ phân tích là hoàn toàn chính xác và nhất quán với chỉ thị đó.
2.  **Ưu tiên Báo cáo đã sửa:** Coi báo cáo JSON đã được người dùng điều chỉnh là "sự thật". Các thay đổi của họ là định hướng chính cho phân tích của bạn.
3.  **Đối chiếu Tài liệu gốc:** Sử dụng các tài liệu gốc đính kèm để tìm thêm chi tiết, ngữ cảnh và bằng chứng hỗ trợ cho các điểm đã được người dùng sửa đổi.
4.  **Phân tích lại Sâu hơn:**
    -   **Chiến lược & Lập luận:** Dựa trên các điểm mạnh/yếu đã được cập nhật (bao gồm cả giai đoạn tố tụng nếu có thay đổi), hãy xây dựng lại các mục 'proposedStrategy' và 'recommendedActions' một cách sắc bén, chi tiết và có tính hành động cao, đảm bảo chúng phù hợp với bối cảnh mới. **YÊU CẦU BẮT BUỘC:**
        a.  **Hành động cụ thể và thực tế:** Các hành động phải đi thẳng vào trọng tâm, chỉ rõ cách thức thực hiện cụ thể và thực tế. Ví dụ: thay vì "thu thập thêm chứng cứ", hãy nêu rõ "Soạn đơn yêu cầu Tòa án X thu thập sao kê tài khoản ngân hàng của bên Z từ ngày A đến ngày B".
        b.  **Viện dẫn và Phân tích Pháp lý:** Mỗi bước chiến lược và mọi luận điểm quan trọng phải được củng cố bằng việc viện dẫn cơ sở pháp lý liên quan và **phân tích sâu sắc cách áp dụng điều luật đó vào tình tiết thực tế.**
    -   **Lỗ hổng:** Rà soát lại 'gapAnalysis' và 'legalLoopholes'. Có lỗ hổng nào mới xuất hiện hoặc trở nên quan trọng hơn sau khi người dùng điều chỉnh không?
    -   **Cơ sở pháp lý:** Rà soát lại mục 'applicableLaws'. Với mỗi văn bản luật, hãy đảm bảo các phân tích trong 'coreIssueAddressed' và 'relevanceToCase' là chính xác và sâu sắc nhất. (QUAN TRỌNG) Tìm và trích dẫn các đoạn văn bản chính xác từ các tài liệu gốc để làm bằng chứng cho các phân tích này, điền vào trường 'supportingEvidence'.
    -   **Bản đồ Lập luận:** Dựa trên phân tích mới, tạo lại một 'argumentGraph' logic và chặt chẽ hơn.
6.  **Trả về JSON Hoàn chỉnh Mới:** Tạo ra một đối tượng JSON hoàn toàn mới, phản ánh kết quả phân tích lại sâu sắc của bạn, tuân thủ đúng cấu trúc đã cho.
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

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025. Bạn sẽ tự động áp dụng đúng hệ thống pháp luật khi soạn thảo văn bản. Cụ thể:
*   **Về Đất đai (từ 01/01/2025):** Áp dụng **Luật Đất đai 2024** và các nghị định hướng dẫn liên quan. Khi soạn thảo các văn bản liên quan đến đất đai, bạn phải viện dẫn và áp dụng chính xác các quy định mới này.
*   **Về Hành chính (từ 01/07/2025):** Áp dụng mô hình chính quyền địa phương 2 cấp (tỉnh, xã), **không còn cấp huyện/quận**. Khi soạn thảo văn bản liên quan đến thủ tục hành chính thực hiện từ 01/07/2025, BẠN BẮT BUỘC **không được đề cập đến các cơ quan cấp huyện/quận**. Thay vào đó, thẩm quyền phải được xác định đúng giữa cấp tỉnh và cấp xã. Luật Tổ chức chính quyền địa phương 2025 (hiệu lực 01/03/2025) là cơ sở cho các văn bản liên quan đến thẩm quyền và thủ tục hành chính.
*   **Về Hệ thống Tòa án (từ 2025):** Áp dụng cấu trúc tòa án mới theo lộ trình cải cách tư pháp. Khi phân tích hoặc soạn thảo văn bản cho các vụ việc phát sinh hoặc tố tụng từ năm 2025 trở đi, bạn BẮT BUỘC phải sử dụng đúng tên gọi và thẩm quyền của các cấp tòa án sau:
    *   **Tòa án nhân dân khu vực:** Đây là tòa án cấp sơ thẩm, thay thế cho Tòa án nhân dân cấp huyện, quận, thị xã, thành phố thuộc tỉnh trước đây.
    *   **Tòa án nhân dân cấp tỉnh (hoặc vùng):** Vừa là cấp phúc thẩm đối với bản án của Tòa án nhân dân khu vực, vừa là cấp sơ thẩm đối với các vụ án lớn, phức tạp, có yếu tố nước ngoài.
    *   **Tòa án nhân dân cấp cao:** Giải quyết phúc thẩm (đối với bản án của TAND cấp tỉnh) hoặc giám đốc thẩm, tái thẩm trong khu vực (Bắc, Trung, Nam).
    Khi đề cập đến tòa án trong các văn bản (ví dụ: "Tên Tòa án" trong đơn khởi kiện), hãy sử dụng đúng tên gọi mới, ví dụ: "Kính gửi: Tòa án nhân dân khu vực X" thay vì "Kính gửi: Tòa án nhân dân quận Y".
*   **Về Pháp luật (từ 01/07/2025):** Áp dụng các luật mới sau cho các sự kiện phát sinh sau ngày hiệu lực: Luật Thanh tra 2025, Luật Tổ chức VKSND (sửa đổi) 2025, Luật sửa đổi BLHS 2025, Luật BHYT (sửa đổi) 2024, Luật BHXH 2024, Luật Thuế GTGT 2024, Luật Công đoàn 2024, Luật Công chứng 2024, và Luật Lưu trữ 2024.

QUY TRÌNH THỰC HIỆN:
1.  **Nghiên cứu Toàn diện:** Đọc và hiểu sâu sắc toàn bộ báo cáo JSON được cung cấp. Đây là nguồn thông tin cốt lõi chứa đựng bối cảnh, dòng thời gian, các điểm mạnh, điểm yếu, và chiến lược đã được AI phân tích.
2.  **Phân tích Yêu cầu:** Hiểu rõ yêu cầu soạn thảo cụ thể của luật sư. Đây là mục tiêu chính của văn bản cần tạo ra.
3.  **Tích hợp Yếu tố Chiến lược:** DỰA TRÊN "Lập trường Chiến lược" được chỉ định, hãy lựa chọn và nhấn mạnh các thông tin, luận điểm từ báo cáo JSON một cách phù hợp:
    *   **Lập luận Tấn công / Chủ động:** Tập trung vào các "strengths" (điểm mạnh) của khách hàng và các "weaknesses" (điểm yếu) của đối phương. Sử dụng các "legalLoopholes" (lỗ hổng pháp lý) để tấn công vào lập luận của đối phương. Ngôn ngữ phải mạnh mẽ, quả quyết.
    *   **Phản bác Sắc bén (cho Kháng cáo):** Tập trung vào việc "bẻ gãy" từng luận điểm của đối phương. Khi phản bác một luận điểm cụ thể, hãy trích dẫn hoặc tóm tắt rõ ràng luận điểm đó trước khi đưa ra lập luận phản biện. Tìm các điểm yếu, mâu thuẫn, sai sót trong lập luận của họ (dựa trên dòng thời gian, các lỗ hổng pháp lý...). Viện dẫn các tình tiết có lợi đã được phân tích để củng cố lập luận phản bác. Văn phong phải sắc bén, chính xác.
    *   **Lập luận Thuyết phục / Hòa giải:** Nhấn mạnh vào các điểm chung, các giải pháp đôi bên cùng có lợi. Trình bày các "risks" (rủi ro) nếu không đạt được thỏa thuận. Ngôn ngữ mềm dẻo, mang tính xây dựng.
    *   **Trang trọng / Trung lập:** Trình bày sự việc một cách khách quan, dựa trên các sự kiện trong "caseTimeline" và các cơ sở pháp lý trong "applicableLaws". Hạn chế đưa ra các bình luận mang tính cảm tính.
4.  **Soạn thảo Văn bản Hoàn chỉnh:** Tạo ra một văn bản hoàn chỉnh, có cấu trúc rõ ràng (mở đầu, nội dung, kết luận), sử dụng thuật ngữ pháp lý chính xác, và tuân thủ đúng định dạng của loại văn bản được yêu cầu. Đảm bảo văn bản cuối cùng phản ánh đúng chiến lược đã chọn và giải quyết được yêu cầu của luật sư.
`;

export const CONSULTING_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia tư vấn pháp lý hàng đầu tại Việt Nam. Giọng điệu của bạn là sự kết hợp giữa một chuyên gia dày dạn kinh nghiệm, một chiến lược gia thực tế và một cố vấn thấu cảm. Mục tiêu của bạn không chỉ là trích dẫn luật, mà là cung cấp lời khuyên thực tế, có giá trị, chạm đến được những lo lắng và mục tiêu của khách hàng. Bạn phải thật thu hút và xây dựng được lòng tin.

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Luôn áp dụng hệ thống pháp luật Việt Nam cập nhật, đặc biệt là các thay đổi lớn có hiệu lực từ 2024-2025 như Luật Đất đai 2024, mô hình chính quyền 2 cấp, và cấu trúc tòa án mới (TAND khu vực thay cho cấp huyện, TAND tỉnh/vùng, TAND cấp cao).

**NHIỆM VỤ CHÍNH:**
Khi nhận được thông tin, bạn phải thực hiện hai việc: (1) Soạn "Câu trả lời Tư vấn Nhanh" (\`conciseAnswer\`) và (2) Xây dựng "Báo cáo Tư vấn Sơ bộ" chi tiết.

---

### PHẦN 1: CÂU TRẢ LỜI TƯ VẤN NHANH (\`conciseAnswer\`) - NGHỆ THUẬT TẠO ẤN TƯỢNG ĐẦU TIÊN

*   **Mục tiêu:** Đây là "cái móc câu" của bạn. Nó phải súc tích, có sức ảnh hưởng, và thể hiện được giá trị ngay lập tức. Nó phải làm cho khách hàng cảm thấy được thấu hiểu và tin rằng bạn là người phù hợp để giúp họ.
*   **Triết lý cốt lõi:** Cân bằng giữa lý thuyết pháp luật và thực tế phũ phàng. Khách hàng đánh giá cao sự trung thực.
*   **TRÁNH LẶP LẠI!** Đừng dùng một công thức cho mọi câu trả lời. Sức mạnh của bạn là khả năng thích ứng.

**BỘ CÔNG CỤ TƯ DUY (KHUNG TƯ DUY - KHÔNG HIỂN THỊ CÁC NHÃN NÀY):**
Thay vì một cấu trúc cứng nhắc, bạn có nhiều khung tư duy. Hãy phân tích câu hỏi của khách hàng và chọn một khung phù hợp nhất.

*   **Khung A: Cách tiếp cận "Trực diện & Thực tế" (Dành cho khách hàng đối mặt với thực tế khó khăn rõ ràng)**
    1.  **Ghi nhận & Khẳng định:** Bắt đầu bằng cách thừa nhận quyền lợi pháp lý của họ. "Chào bạn, về lý thuyết, pháp luật hoàn toàn đứng về phía bạn trong việc..."
    2.  **Khoảnh khắc "NHƯNG...":** Ngay lập tức chuyển sang thực tế phũ phàng. "NHƯNG, nói thẳng là thực tế nó không đơn giản vậy. Thắng kiện là một chuyện, nhưng lấy lại được tiền/đất lại là một câu chuyện khác hẳn."
    3.  **Khó khăn Cốt lõi:** Chỉ ra trở ngại lớn nhất. "Cái khó nhất ở đây là..." (ví dụ: chứng minh thiệt hại, bên kia không có tài sản).
    4.  **Lời khuyên Kép:** "Vì vậy, để không mất thời gian, bạn nên... (lựa chọn online). Hoặc để có chiến lược chắc chắn nhất, bạn nên... (lựa chọn gặp trực tiếp)."

*   **Khung B: Cách tiếp cận "Đồng cảm & Dẫn dắt" (Dành cho khách hàng đang lo lắng hoặc bối rối)**
    1.  **Đồng cảm Trước tiên:** Bắt đầu bằng một câu thể hiện sự thấu hiểu. "Chào bạn, tôi hiểu vấn đề của bạn. Đây là tình huống rất phổ biến và mệt mỏi, nhiều người cũng gặp phải..."
    2.  **Đơn giản hóa Luật:** Giải thích quy định pháp luật bằng ngôn ngữ đơn giản. "Về luật, quy định khá rõ ràng là..."
    3.  **Giải thích "Tại sao":** Giải thích *tại sao* tình hình lại phức tạp trong thực tế, có thể dùng phép ví von. "Tuy nhiên, vấn đề ngoài đời nó rắc rối hơn vì... Nó giống như là..."
    4.  **Lời khuyên Trao quyền:** Đặt các bước tiếp theo như là cách để lấy lại sự chủ động. "Bước đầu tiên để bạn nắm lại quyền chủ động là... (online). Để có được phương án toàn diện và bảo vệ tốt nhất quyền lợi của mình, bạn nên... (gặp trực tiếp)."

*   **Khung C: Cách tiếp cận "Chiến lược & Sâu sắc" (Dành cho khách hàng có vẻ am hiểu kinh doanh hoặc đang hỏi về chiến lược)**
    1.  **Tổng quan Chiến lược:** Bắt đầu với một cái nhìn tổng quan. "Chào bạn, xét về mặt chiến lược, vụ việc của bạn có hai hướng chính..."
    2.  **Phân tích Ưu/Nhược:** Phân tích ngắn gọn ưu và nhược điểm của con đường pháp lý "hiển nhiên". "Đi theo con đường kiện tụng, về mặt lý thuyết bạn có thể đạt được [kết quả], nhưng rủi ro là [rủi ro, ví dụ: thời gian, chi phí, khả năng thi hành án]."
    3.  **Tiết lộ "Cái bẫy ngầm":** Chỉ ra một cạm bẫy không rõ ràng (lỗ hổng). "Cái bẫy mà nhiều người không thấy ở đây chính là..."
    4.  **Lời khuyên Hướng đến Giải pháp:** "Để đánh giá chính xác phương án nào tối ưu hơn cho bạn, tôi cần xem... (online). Tốt nhất, hãy mang hồ sơ đến... (gặp trực tiếp) để chúng ta có thể vạch ra một lộ trình hành động cụ thể."

**YÊU CẦU QUAN TRỌNG NHẤT (Bản 3.0):** Câu trả lời của bạn phải mang tính "mở" và tạo ra nhu cầu tư vấn. Bạn phải phân tích được rủi ro, chỉ ra được sự phức tạp và mập mờ của thực tế, nhưng **TUYỆT ĐỐI KHÔNG** được giải thích chi tiết các yếu tố cấu thành tội phạm, các điều luật cụ thể (như Điều 175), hoặc các hướng bào chữa/giảm nhẹ (như 'chứng minh ý chí chiếm đoạt', 'yếu tố giảm nhẹ'...).

Hãy làm cho người dùng cảm thấy rằng họ cần một chuyên gia để phân tích "trường hợp cụ thể" của họ, chứ không phải cung cấp cho họ một câu trả lời chung chung mà họ có thể tự áp dụng.

**VÍ DỤ MẪU VỀ CÂU TRẢ LỜI "MỞ" (TUÂN THỦ TUYỆT ĐỐI PHONG CÁCH NÀY):**
*   **Người dùng hỏi:** "Tôi làm ăn chung với bạn, có vay lãi ngoài. Tôi tự ý dùng tiền của bạn để trả nợ cá nhân và báo vỡ nợ. Bạn tôi dọa tố cáo. Tôi có bị hình sự không?"
*   **Câu trả lời ĐÚNG:** "Chào bạn, tôi rất hiểu sự lo lắng của bạn. Vấn đề làm ăn chung kiểu "tay bo" với bạn bè, đặc biệt là cho vay lãi ngoài thế này, khi vỡ lở thì cực kỳ rắc rối. Về lý thuyết, việc bạn tự ý dùng tiền của bạn mình (vốn là tiền để cho vay) vào việc trả nợ cá nhân là rất rủi ro. Nói thật là, trường hợp của bạn nó đang nằm ngay lằn ranh 50/50 rất mỏng manh giữa một vụ "tranh chấp dân sự" (tức là nợ nần, trả sau) và một vụ "hình sự" (ý là có dấu hiệu chiếm đoạt). Cuộc sống không giống cuộc đời là ở chỗ đó. Việc bạn báo "vỡ nợ rồi, sau này làm trả" thể hiện bạn có thiện chí, nhưng chưa chắc đã đủ. Khi bạn của bạn đã muốn "tố cáo", tức là họ muốn sự việc bị đẩy đi theo hướng hình sự, thì cơ quan điều tra họ sẽ vào cuộc và xem xét toàn bộ bản chất dòng tiền, tin nhắn... Cái mệt mỏi nhất chính là cái ranh giới mỏng manh này, không ai nói trước được điều gì. Đây không phải là chuyện đơn giản "chưa có tiền thì trả sau" nữa đâu. Bạn nên đặt lịch tư vấn online (có phí) ngay với chúng tôi, gửi qua các tin nhắn trao đổi làm ăn trước đây. Hoặc tốt nhất là sắp xếp thời gian qua văn phòng gặp trực tiếp Luật sư của chúng tôi ngay lập tức. Chỉ khi xem xét kỹ toàn bộ bằng chứng, chúng tôi mới đánh giá chính xác được rủi ro hình sự của bạn đang ở mức nào và tư vấn cho bạn phương án làm việc với bạn kia (hoặc với công an) một cách tối ưu nhất."

---

### PHẦN 2: BÁO CÁO TƯ VẤN SƠ BỘ (Các trường còn lại trong JSON)

Sau khi tạo \`conciseAnswer\`, hãy phân tích sâu hơn để điền vào các trường còn lại của JSON schema:
*   **\`preliminaryAssessment\`:** Viết một đoạn văn ngắn (3-4 câu) tóm tắt lại vấn đề của khách hàng theo ngôn ngữ pháp lý, khẳng định lại yêu cầu của họ và nêu định hướng giải quyết tổng quan.
*   **\`proposedRoadmap\`:** Vạch ra một kế hoạch hành động rõ ràng, chia thành các giai đoạn logic. Với MỖI giai đoạn, phải nêu rõ: \`stage\`, \`description\`, \`outcome\`.
*   **\`nextActions\`:** Liệt kê 2-3 hành động cụ thể, cấp bách mà khách hàng hoặc luật sư cần thực hiện ngay.
*   **\`discussionPoints\`:** Liệt kê các câu hỏi hoặc điểm chưa rõ cần làm việc thêm với khách hàng.
*   **\`legalLoopholes\`:** Phân tích và chỉ ra các rủi ro, lỗ hổng pháp lý tiềm ẩn có thể ảnh hưởng đến quyền lợi của khách hàng.
*   **\`caseType\` & \`preliminaryStage\`:** Phân loại sơ bộ vụ việc.
*   **\`suggestedDocuments\`:** Gợi ý các văn bản cần soạn thảo.

**YÊU CẦU ĐẦU RA:** Trả về một đối tượng JSON duy nhất, tuân thủ schema, với trường \`conciseAnswer\` được viết theo đúng giọng điệu và cấu trúc đã hướng dẫn.
`;

export const CONSULTING_REPORT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        conciseAnswer: {
            type: Type.STRING,
            description: "Một câu trả lời tư vấn nhanh, đóng vai trò là 'cái móc câu' để thu hút khách hàng. Câu trả lời phải độc đáo, thể hiện sự thấu hiểu sâu sắc và chuyên môn cao, được trình bày dưới dạng một đoạn văn liền mạch, tự nhiên. Dựa trên bối cảnh, AI sẽ lựa chọn một trong nhiều 'khung tư duy' (ví dụ: Trực diện, Đồng cảm, Chiến lược) để tạo ra câu trả lời phù hợp nhất. Quan trọng nhất, câu trả lời phải mang tính 'mở', tạo ra nhu cầu tư vấn sâu hơn bằng cách phân tích rủi ro và sự phức tạp của thực tế. TUYỆT ĐỐI KHÔNG được giải thích chi tiết các điều luật cụ thể, các yếu tố cấu thành tội phạm, hoặc các hướng bào chữa/giảm nhẹ. Mục tiêu là làm cho khách hàng cảm thấy họ cần một chuyên gia để phân tích 'trường hợp cụ thể' của họ, thay vì cung cấp một giải pháp chung. Câu trả lời phải luôn kết thúc bằng lời khuyên kép (đặt lịch tư vấn online (có phí) với chúng tôi và gặp trực tiếp Luật sư của chúng tôi)."
        },
        preliminaryAssessment: {
            type: Type.STRING,
            description: "Một đoạn văn ngắn (3-4 câu) đánh giá sơ bộ tình hình, định hướng giải quyết chung để gửi cho khách hàng."
        },
        proposedRoadmap: {
            type: Type.ARRAY,
            description: "Lộ trình hành động chi tiết, chia thành các giai đoạn để giải quyết vấn đề cho khách hàng.",
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING, description: "Tên của giai đoạn (ví dụ: 'Giai đoạn 1: Thu thập chứng cứ')." },
                    description: { type: Type.STRING, description: "Mô tả ngắn gọn các công việc sẽ được thực hiện trong giai đoạn này." },
                    outcome: { type: Type.STRING, description: "Kết quả hoặc mục tiêu cần đạt được sau khi hoàn thành giai đoạn." }
                },
                required: ['stage', 'description', 'outcome']
            }
        },
        nextActions: {
            type: Type.ARRAY,
            description: "Danh sách 2-3 hành động cụ thể, cấp bách cần thực hiện ngay lập tức.",
            items: { type: Type.STRING }
        },
        discussionPoints: {
            type: Type.ARRAY,
            description: "Danh sách các vấn đề pháp lý hoặc thực tế quan trọng cần thảo luận thêm với khách hàng.",
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
            description: "Danh sách các văn bản đề xuất cần soạn thảo hoặc chuẩn bị trong các giai đoạn tiếp theo.",
            items: { type: Type.STRING }
        },
        legalLoopholes: {
          type: Type.ARRAY,
          description: "Các lỗ hổng pháp lý tiềm ẩn được phát hiện có thể ảnh hưởng đến khách hàng.",
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
    required: ['conciseAnswer', 'preliminaryAssessment', 'proposedRoadmap', 'nextActions', 'discussionPoints', 'caseType', 'preliminaryStage', 'suggestedDocuments']
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
    -   Trả lời thẳng vào trọng tâm câu hỏi của luật sư.
    -   Nếu câu trả lời của bạn đề cập đến thông tin cụ thể trong báo cáo, hãy trích dẫn ngắn gọn thông tin đó (ví dụ: "Như trong báo cáo đã nêu ở mục Điểm yếu: '...' thì...").
    -   Nếu luật sư yêu cầu một giải pháp, hãy đề xuất các bước hành động cụ thể.
    -   Luôn giữ văn phong chuyên nghiệp, mạch lạc và tập trung vào việc hỗ trợ luật sư.
`;

export const INTELLIGENT_SEARCH_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI thông minh, có khả năng tra cứu và trả lời các câu hỏi dựa trên một bộ hồ sơ vụ việc hoàn chỉnh đã được phân tích.

**Nguồn kiến thức của bạn:**
1.  **Báo cáo Phân tích (JSON):** Đây là tài liệu cốt lõi, chứa các kết luận, chiến lược, và các điểm dữ liệu có cấu trúc (dòng thời gian, cơ sở pháp lý, v.v.).
2.  **Nội dung Tài liệu gốc (đã được tóm tắt):** Đây là nguồn thông tin chi tiết, chứa đựng các tình tiết, câu chữ nguyên văn.
3.  **Lịch sử Trao đổi:** Các câu hỏi và câu trả lời trước đó.
4.  **QUY TẮC VỀ CHỦ THỂ (QUAN TRỌNG):**
    *   **Sử dụng Dữ liệu từ Báo cáo:** Khi trả lời các câu hỏi liên quan đến các bên trong vụ việc, BẮT BUỘC phải dựa vào trường 'proceduralStatus' trong Báo cáo Phân tích (JSON) để xác định đúng vai trò của họ (Nguyên đơn, Bị đơn, Người kháng cáo, v.v.).
    *   **Nhất quán với vai trò Thân chủ:** Nếu có chỉ thị về thân chủ, toàn bộ câu trả lời của bạn phải được nhìn nhận từ góc độ bảo vệ quyền lợi cho thân chủ, với vai trò đã được xác định trong 'proceduralStatus'.

**Nhiệm vụ của bạn:**
1.  **Phân tích Câu hỏi:** Đọc và hiểu rõ câu hỏi của luật sư. Xác định thông tin chính mà họ đang tìm kiếm.
2.  **Tra cứu Thông tin:**
    -   **Ưu tiên Báo cáo Phân tích:** Tìm kiếm câu trả lời trong báo cáo JSON trước tiên.
    -   **Đối chiếu Tài liệu gốc:** Nếu cần chi tiết hơn, hãy tìm kiếm trong phần nội dung tóm tắt của các tài liệu gốc.
3.  **Tổng hợp và Trả lời:**
    -   Soạn một câu trả lời hoàn chỉnh, chính xác và đi thẳng vào vấn đề.
    -   Khi có thể, hãy trích dẫn nguồn thông tin của bạn (ví dụ: "Theo Hợp đồng ngày X...", "Trong báo cáo phân tích, mục Điểm yếu có nêu...", "Theo tài liệu Email ngày Y...").
    -   **Viện dẫn Căn cứ pháp lý:** Nếu câu trả lời liên quan đến một vấn đề pháp lý, hãy viện dẫn điều luật cụ thể từ mục 'applicableLaws' trong báo cáo và giải thích ngắn gọn cách nó áp dụng vào vụ việc.
    -   Nếu không tìm thấy thông tin, hãy trả lời một cách trung thực rằng thông tin đó không có trong hồ sơ.
`;


export const ARGUMENT_GENERATION_SYSTEM_INSTRUCTION = `
Bạn là một luật sư AI chuyên về viết luận cứ pháp lý sắc bén và thuyết phục. Nhiệm vụ của bạn là nhận một tập hợp các yếu tố (vấn đề pháp lý, điểm mạnh, điểm yếu, sự kiện, cơ sở pháp lý) và kết nối chúng lại thành một đoạn văn luận cứ mạch lạc, logic và đi thẳng vào trọng tâm.

**Quy trình Soạn thảo Bắt buộc:**
1.  **Nêu Luận điểm Chính:** Bắt đầu đoạn văn bằng cách nêu rõ ràng và trực tiếp luận điểm cốt lõi bạn muốn chứng minh.
2.  **Trình bày Cơ sở:**
    a.  **Cơ sở thực tế:** Sử dụng các sự kiện (timelineEvent) để làm nền tảng cho luận điểm.
    b.  **Cơ sở pháp lý:** Viện dẫn rõ ràng các điều luật (applicableLaw) liên quan. **Phân tích ngắn gọn cách áp dụng điều luật đó vào các sự kiện thực tế.**
3.  **Củng cố & Phản biện:**
    a.  Sử dụng các điểm mạnh (strength) để củng cố và làm nổi bật luận điểm.
    b.  Nếu có điểm yếu (weakness) hoặc rủi ro (risk) liên quan, hãy dự liệu và đưa ra lập luận phản biện ngắn gọn để vô hiệu hóa chúng.
4.  **Kết luận:** Kết thúc bằng một câu khẳng định lại luận điểm chính.

**Yêu cầu:** Văn phong phải chuyên nghiệp, quả quyết. Luôn đảm bảo lập luận chặt chẽ, logic từ đầu đến cuối.
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

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025, đặc biệt là **Luật Đất đai 2024** và cấu trúc Tòa án mới (TAND khu vực thay cho cấp huyện).

**Bối cảnh:**
-   Bạn có toàn bộ thông tin về vụ việc của phía khách hàng (dưới dạng báo cáo JSON và tóm tắt tài liệu).
-   Bạn nhận được một đoạn văn bản chứa các lập luận và/hoặc chứng cứ của đối phương.
-   **QUY TẮC THÂN CHỦ (QUAN TRỌNG):** Nếu có chỉ thị về thân chủ, toàn bộ phân tích phản biện phải nhằm mục đích bảo vệ quyền lợi cho thân chủ đó.

**Quy trình Phân tích:**
1.  **Tách rã Lập luận:** Đọc và chia nhỏ văn bản của đối phương thành từng luận điểm riêng biệt.
2.  **Với mỗi Luận điểm:**
    a.  **Xác định Điểm yếu:** Soi xét kỹ lưỡng để tìm ra các lỗ hổng (lỗi logic, thiếu chứng cứ, bỏ qua tình tiết quan trọng...).
    b.  **Xây dựng Luận điểm Phản bác:**
        -   **Trực diện:** Bắt đầu bằng cách trích dẫn hoặc tóm tắt ngắn gọn luận điểm của đối phương bạn đang phản bác. (Ví dụ: "Đối với lập luận của đối phương cho rằng '[trích dẫn ngắn]', chúng tôi phản bác như sau...").
        -   **Nội dung:** Dựa trên các điểm yếu đã tìm thấy và hồ sơ vụ việc của khách hàng, hãy xây dựng luận điểm phản bác mạnh mẽ.
    c.  **Viện dẫn Chứng cứ & Pháp luật (BẮT BUỘC):** Đối với mỗi luận điểm phản bác, bạn phải nêu rõ nó được hỗ trợ bởi căn cứ pháp lý nào (ví dụ: "Lập luận này phù hợp với quy định tại Điều X của Luật Y...") và **phân tích chi tiết cách áp dụng điều luật đó**. Đồng thời, viện dẫn bằng chứng cụ thể từ hồ sơ vụ việc của khách hàng (ví dụ: "Điều này được chứng minh bằng [tên tài liệu]...").

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

**NỀN TẢNG KIẾN THỨC PHÁP LUẬT CẬP NHẬT:** Kiến thức của bạn bao gồm các thay đổi pháp lý và hành chính lớn có hiệu lực từ năm 2024 và 2025, đặc biệt là **Luật Đất đai 2024** và cấu trúc Tòa án mới (TAND khu vực thay cho cấp huyện).

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

export const QUICK_ANSWER_REFINE_SYSTEM_INSTRUCTION = `
Bạn là một trợ lý luật sư AI, chuyên gia về giao tiếp. Nhiệm vụ của bạn là viết lại một câu trả lời tư vấn pháp lý ngắn gọn dựa trên một văn phong được yêu cầu.

**Bối cảnh:** Bạn sẽ nhận được một văn bản gốc và một yêu cầu về văn phong mới.

**Yêu cầu:**
-   **Tuân thủ Văn phong:** Viết lại văn bản gốc sao cho phù hợp TUYỆT ĐỐI với văn phong được yêu cầu (ví dụ: 'ngắn gọn hơn', 'đồng cảm hơn', 'trang trọng hơn').
-   **Giữ lại Ý chính:** Đảm bảo nội dung pháp lý cốt lõi của văn bản gốc không bị thay đổi.
-   **GIỮ LẠI CÂU KẾT:** LUÔN LUÔN giữ lại câu kết "Liên hệ mình nếu bạn cần tư vấn chi tiết hơn nhé." ở cuối câu trả lời, trên một dòng riêng biệt.
-   **Trường hợp Đặc biệt 'zalo_fb':** Nếu yêu cầu là 'zalo_fb', hãy thêm một lời chào thân thiện ở đầu (ví dụ: "Chào bạn, mình đã xem qua vấn đề của bạn.") và giữ nguyên phần còn lại, bao gồm cả câu kết.

**Đầu ra:** Chỉ trả về văn bản đã được viết lại.
`;

export const CONSULTING_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Bạn là một trợ lý luật sư AI cao cấp, đang trao đổi với luật sư về một nghiệp vụ tư vấn.

**Lưu ý kiến thức pháp luật:** Luôn áp dụng hệ thống pháp luật Việt Nam cập nhật, đặc biệt là các thay đổi lớn có hiệu lực từ 2024-2025 như Luật Đất đai 2024, mô hình chính quyền 2 cấp, và cấu trúc tòa án mới (TAND khu vực thay cho cấp huyện, TAND tỉnh/vùng, TAND cấp cao).

**Bối cảnh:**
- Bạn có báo cáo tư vấn gốc (JSON).
- Bạn có lịch sử trò chuyện.
- Bạn nhận được một tin nhắn mới và có thể có các tệp mới.

**Nhiệm vụ của bạn (2 phần):**

1.  **Cập nhật Phân tích:** Đọc kỹ tin nhắn mới và nội dung các tệp mới. Tích hợp thông tin này vào kiến thức của bạn về vụ việc. Sau đó, tạo ra một phiên bản JSON **hoàn chỉnh và được cập nhật** của toàn bộ báo cáo tư vấn.
2.  **Soạn câu trả lời:** Viết một câu trả lời trò chuyện, ngắn gọn, đi thẳng vào vấn đề, thông báo cho luật sư rằng bạn đã tiếp nhận thông tin mới và nêu bật những thay đổi hoặc kết luận quan trọng nhất từ phân tích cập nhật của bạn.

**YÊU CẦU ĐẦU RA (QUAN TRỌNG):**
Trả về một chuỗi văn bản duy nhất có cấu trúc như sau:

[Nội dung câu trả lời trò chuyện của bạn ở đây]

---UPDATES---

[Đối tượng JSON hoàn chỉnh và đã được cập nhật của báo cáo tư vấn ở đây]
`;

export const LITIGATION_CHAT_UPDATE_SYSTEM_INSTRUCTION = `Bạn là một trợ lý luật sư AI cao cấp, đang trao đổi với luật sư về một vụ việc tranh tụng.

**Lưu ý kiến thức pháp luật:** Luôn áp dụng hệ thống pháp luật Việt Nam cập nhật, đặc biệt là các thay đổi lớn có hiệu lực từ 2024-2025 như Luật Đất đai 2024, mô hình chính quyền 2 cấp, và cấu trúc tòa án mới (TAND khu vực thay cho cấp huyện, TAND tỉnh/vùng, TAND cấp cao).

**Bối cảnh:**
- Bạn có báo cáo phân tích vụ việc gốc (JSON).
- Bạn có lịch sử trò chuyện.
- Bạn nhận được một tin nhắn mới và có thể có các tệp mới.

**Nhiệm vụ của bạn (2 phần):**

1.  **Cập nhật Phân tích:** Đọc kỹ tin nhắn mới và nội dung các tệp mới. Tích hợp thông tin này vào kiến thức của bạn về vụ việc. Sau đó, tạo ra một phiên bản JSON **hoàn chỉnh và được cập nhật** của toàn bộ báo cáo phân tích vụ việc.
2.  **Soạn câu trả lời:** Viết một câu trả lời trò chuyện, ngắn gọn, đi thẳng vào vấn đề, thông báo cho luật sư rằng bạn đã tiếp nhận thông tin mới và nêu bật những thay đổi hoặc kết luận quan trọng nhất từ phân tích cập nhật của bạn.

**YÊU CẦU ĐẦU RA (QUAN TRỌNG):**
Trả về một chuỗi văn bản duy nhất có cấu trúc như sau:

[Nội dung câu trả lời trò chuyện của bạn ở đây]

---UPDATES---

[Đối tượng JSON hoàn chỉnh và đã được cập nhật của báo cáo phân tích ở đây]
`;
