import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisReport, ApplicableLaw, LawArticle, UploadedFile, LitigationType, LegalLoophole, ChatMessage, CaseTimelineEvent, OpponentArgument, SupportingEvidence } from '../types.ts';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { explainLaw, continueContextualChat, analyzeOpponentArguments } from '../services/geminiService.ts';
import { Loader } from './Loader.tsx';
import { SearchIcon } from './icons/SearchIcon.tsx';
import { getStageLabel } from '../constants.ts';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { CaseTimeline } from './CaseTimeline.tsx';
import { DownloadIcon } from './icons/DownloadIcon.tsx';
import { RefreshIcon } from './icons/RefreshIcon.tsx';
import { EditIcon } from './icons/EditIcon.tsx';

// --- Internal Components and Icons ---
declare var html2canvas: any;

// --- Icons for Loophole Categories ---
const ContractIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const LawIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-3.5-16.5v16.5m-3.5-16.5v16.5m0 0C5.116 20.507 3 19.742 3 18.25V8.75c0-1.492 2.116-2.257 4.5-2.257m0 11.75c2.384 0 4.5-.765 4.5-2.257V8.75C12 7.258 9.884 6.5 7.5 6.5m0 11.75 4.5-11.75" />
  </svg>
);
const ProcedureIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
  </svg>
);
const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
const OtherCategoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
  </svg>
);

const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) { return <>{text}</>; }
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    return (<>{parts.map((part, i) => regex.test(part) ? (<mark key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm">{part}</mark>) : (<React.Fragment key={i}>{part}</React.Fragment>))}</>);
});

const getLoopholeIcon = (classification: LegalLoophole['classification']) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" };
  switch (classification) {
    case 'Hợp đồng': return <ContractIcon {...iconProps} />;
    case 'Quy phạm Pháp luật': return <LawIcon {...iconProps} />;
    case 'Tố tụng': return <ProcedureIcon {...iconProps} />;
    default: return <OtherCategoryIcon {...iconProps} />;
  }
};

const ChatWindow: React.FC<{
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    onClose: () => void;
    title: string;
}> = ({ chatHistory, onSendMessage, isLoading, onClose, title }) => {
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;
        onSendMessage(userInput);
        setUserInput('');
    };

    return (
      <div className="mt-4 border border-slate-300 bg-slate-50/50 rounded-lg p-3 animate-fade-in">
        <div className="flex justify-between items-center mb-2">
            <h5 className="font-bold text-sm text-slate-700">{title}</h5>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
        </div>
        <div className="h-64 overflow-y-auto space-y-3 p-2 bg-white border rounded-md">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'model' && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div>}
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div>
                </div>
            ))}
            {isLoading && <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div><div className="p-2 rounded-lg bg-slate-100"><Loader /></div></div>}
            <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Hỏi AI để có giải pháp..." className="flex-grow p-2 border border-slate-300 rounded-md text-sm" disabled={isLoading} />
            <button type="submit" disabled={isLoading || !userInput.trim()} className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-400"><SendIcon className="w-5 h-5"/></button>
        </form>
      </div>
    );
};


interface ReportSectionProps {
    title: string;
    children: React.ReactNode;
    chatHistory?: ChatMessage[];
    onChatToggle?: () => void;
    isChatOpen?: boolean;
    headerAction?: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, children, chatHistory, onChatToggle, isChatOpen, headerAction }) => {
    const hasHistory = chatHistory && chatHistory.length > 0;
    
    let buttonClasses = 'p-1.5 rounded-md transition-colors';
    if (isChatOpen) {
        buttonClasses += ' bg-blue-100 text-blue-600';
    } else if (hasHistory) {
        buttonClasses += ' bg-blue-50 text-blue-600 hover:bg-blue-100';
    } else {
        buttonClasses += ' text-slate-500 hover:bg-slate-100';
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-slate-200/80 soft-shadow">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-base font-bold text-slate-800">{title}</h4>
                <div className="flex items-center gap-2">
                  {headerAction}
                  {chatHistory && onChatToggle && (
                      <button onClick={onChatToggle} className={buttonClasses} title="Trao đổi với AI về mục này">
                          <ChatIcon className="w-5 h-5" />
                      </button>
                  )}
                </div>
            </div>
            <div className="text-sm text-slate-700 space-y-2">{children}</div>
        </div>
    );
};


// New dedicated props interface for OpponentAnalysisSection
interface OpponentAnalysisSectionProps {
  report: AnalysisReport | null;
  files: UploadedFile[];
  onUpdateReport: (report: AnalysisReport) => void;
  highlightTerm: string;
}

const OpponentAnalysisSection: React.FC<OpponentAnalysisSectionProps> = ({ report, files, onUpdateReport, highlightTerm }) => {
    const [opponentArgs, setOpponentArgs] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!report || !opponentArgs.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const analysisResult = await analyzeOpponentArguments(report, files, opponentArgs);
            const updatedReport = { ...report, opponentAnalysis: analysisResult };
            onUpdateReport(updatedReport);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ReportSection title="Phân tích Lập luận Đối phương">
            <div className="space-y-4">
                <div>
                    <label htmlFor="opponentArgs" className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập các luận điểm, chứng cứ của đối phương:</label>
                    <textarea
                        id="opponentArgs"
                        value={opponentArgs}
                        onChange={(e) => setOpponentArgs(e.target.value)}
                        placeholder="Ví dụ: Nguyên đơn cho rằng hợp đồng vô hiệu do bị lừa dối. Bằng chứng là email ngày X..."
                        className="w-full h-28 p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm"
                    />
                </div>
                <button onClick={handleAnalyze} disabled={isLoading || !opponentArgs.trim()} className="w-full py-2 px-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center gap-2">
                    {isLoading ? <><Loader /> <span>Đang phân tích...</span></> : 'Phân tích & Tìm điểm yếu'}
                </button>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

                {report?.opponentAnalysis && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                         {report.opponentAnalysis.map((analysis, index) => (
                            <div key={index} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                                <h5 className="font-semibold text-slate-800 mb-2">Đối Luận điểm: "<HighlightedText text={analysis.argument as string} term={highlightTerm} />"</h5>
                                <table className="w-full text-left text-xs">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="font-semibold p-2 align-top w-1/3 bg-slate-100">Điểm yếu đã xác định</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.weaknesses.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                         <tr className="border-b">
                                            <td className="font-semibold p-2 align-top bg-slate-100">Luận điểm phản bác</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.counterArguments.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                        <tr>
                                            <td className="font-semibold p-2 align-top bg-slate-100">Chứng cứ hỗ trợ</td>
                                            <td className="p-2"><ul className="list-disc list-inside space-y-1">{analysis.supportingEvidence.map((item, i) => <li key={i}><HighlightedText text={item as string} term={highlightTerm} /></li>)}</ul></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                         ))}
                    </div>
                )}
            </div>
        </ReportSection>
    );
};

interface ReportDisplayProps {
  report: AnalysisReport | null;
  files: UploadedFile[];
  onPreview: (file: UploadedFile) => void;
  onClearSummary: () => void;
  litigationType: LitigationType;
  onUpdateUserLaws: (laws: ApplicableLaw[]) => void;
  onUpdateReport: (report: AnalysisReport) => void;
  caseSummary: string;
  clientRequestSummary: string;
  onReanalyze: (report: AnalysisReport) => void;
  isReanalyzing: boolean;
}

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onClearSummary, litigationType, onUpdateUserLaws, onUpdateReport, caseSummary, clientRequestSummary, onReanalyze, isReanalyzing, files }) => {
    const [highlightTerm, setHighlightTerm] = useState('');
    const [newLaw, setNewLaw] = useState({ documentName: '', articles: [{ articleNumber: '', summary: '' }] });
    const [isAddingLaw, setIsAddingLaw] = useState(false);
    const [explainingLaw, setExplainingLaw] = useState<string | null>(null);
    const [explanation, setExplanation] = useState('');
    const [explanationError, setExplanationError] = useState<string | null>(null);
    const [activeChat, setActiveChat] = useState<keyof AnalysisReport | null>(null);
    const [isChatLoading, setIsChatLoading] = useState<keyof AnalysisReport | null>(null);
    const [editableSummary, setEditableSummary] = useState(report?.editableCaseSummary || '');
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [isCapturingTimeline, setIsCapturingTimeline] = useState(false);

    useEffect(() => {
        setEditableSummary(report?.editableCaseSummary || '');
    }, [report?.editableCaseSummary]);

    const handleReanalyzeClick = () => {
        if (!report) return;
        onReanalyze({ ...report, editableCaseSummary: editableSummary });
    };
    
    const handleUpdateEvents = (updatedEvents: CaseTimelineEvent[]) => {
        if (report) {
            const updatedReport = { ...report, caseTimeline: updatedEvents };
            onUpdateReport(updatedReport);
        }
    };

    const handleDownloadTimelineImage = async () => {
        const timelineElement = document.getElementById('timeline-capture-area');
        if (!timelineElement) {
            console.error("Timeline element not found for capture.");
            return;
        }
        setIsCapturingTimeline(true);
        try {
            const canvas = await html2canvas(timelineElement, { 
                scale: 2, // for high quality
                useCORS: true,
                backgroundColor: '#ffffff' // Ensure a solid white background
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'dong_thoi_gian_vu_viec.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error generating timeline image:", err);
            alert("Đã xảy ra lỗi khi tạo ảnh từ dòng thời gian.");
        } finally {
            setIsCapturingTimeline(false);
        }
    };

    const handleAddLaw = () => {
        if (newLaw.documentName.trim() === '' || newLaw.articles.some(a => a.articleNumber.trim() === '')) return;
        const currentLaws = report?.userAddedLaws || [];
        onUpdateUserLaws([...currentLaws, newLaw]);
        setNewLaw({ documentName: '', articles: [{ articleNumber: '', summary: '' }] });
        setIsAddingLaw(false);
    };
    const handleDeleteUserLaw = (index: number) => {
        const currentLaws = report?.userAddedLaws || [];
        onUpdateUserLaws(currentLaws.filter((_, i) => i !== index));
    };
    const handleExplainLaw = async (law: LawArticle) => {
        setExplainingLaw(`${law.articleNumber}`);
        setExplanation('');
        setExplanationError(null);
        try {
            const result = await explainLaw(`${law.articleNumber}: ${law.summary}`);
            setExplanation(result);
        } catch (error) {
            setExplanationError(error instanceof Error ? error.message : "Lỗi không xác định.");
        }
    };
    
    const handleChatSendMessage = async (chatHistoryKey: keyof AnalysisReport, contextTitle: string, message: string) => {
        if (!report) return;
        
        const currentHistory = (report[chatHistoryKey] as ChatMessage[] || []);
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        const updatedHistory = [...currentHistory, newUserMessage];

        // Optimistic update
        const updatedReport = { ...report, [chatHistoryKey]: updatedHistory };
        onUpdateReport(updatedReport);
        setIsChatLoading(chatHistoryKey);

        try {
            const aiResponse = await continueContextualChat(report, currentHistory, message, `Mục: ${contextTitle}`);
            const aiMessage: ChatMessage = { role: 'model', content: aiResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            const finalReport = { ...report, [chatHistoryKey]: finalHistory };
            onUpdateReport(finalReport);
        } catch (err) {
            // Handle error, maybe revert optimistic update or show error message
            console.error(err);
        } finally {
            setIsChatLoading(null);
        }
    };

    if (caseSummary) {
        return (
            <div id="report-content" className="space-y-6">
                <ReportSection title="Tóm tắt Diễn biến Vụ việc">
                    <p className="whitespace-pre-wrap">{caseSummary}</p>
                </ReportSection>
                <ReportSection title="Tóm tắt Yêu cầu của Khách hàng">
                    <p className="whitespace-pre-wrap">{clientRequestSummary}</p>
                </ReportSection>
            </div>
        );
    }
    
    if (!report) {
        return <div id="report-content"></div>;
    }
    
    const userAddedLaws = report.userAddedLaws || [];

    return (
        <div id="report-content" className="space-y-6">
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg border">
                <input type="text" value={highlightTerm} onChange={e => setHighlightTerm(e.target.value)} placeholder="Tìm & highlight trong báo cáo..." className="w-full text-sm p-1.5 border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500" />
            </div>

            {report.quickSummary && (
                <ReportSection title="Tóm tắt Báo cáo" headerAction={<button onClick={onClearSummary} className="px-3 py-1.5 text-xs bg-slate-200 rounded-lg hover:bg-slate-300">Xóa</button>}>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{report.quickSummary}</pre>
                </ReportSection>
            )}
            
            <ReportSection title="Tóm tắt Vụ việc (AI tạo, có thể chỉnh sửa)">
                <textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    onFocus={() => setIsEditingSummary(true)}
                    className="w-full p-2 border border-slate-300 rounded-md min-h-[120px] bg-slate-50 focus:bg-white"
                />
                 {isEditingSummary && (
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={handleReanalyzeClick}
                          disabled={isReanalyzing}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300"
                        >
                          {isReanalyzing ? <Loader /> : <RefreshIcon className="w-4 h-4"/>}
                          Phân tích lại
                        </button>
                    </div>
                )}
            </ReportSection>

            {report.caseTimeline && report.caseTimeline.length > 0 && (
                <>
                    <div id="timeline-capture-area">
                        <ReportSection 
                            title="Dòng thời gian Vụ việc"
                            headerAction={
                                <button 
                                    onClick={handleDownloadTimelineImage} 
                                    disabled={isCapturingTimeline}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                                    title="Tải về dòng thời gian dưới dạng ảnh"
                                >
                                    {isCapturingTimeline ? <Loader /> : <DownloadIcon className="w-4 h-4" />}
                                    <span>Tải ảnh</span>
                                </button>
                            }
                        >
                            <CaseTimeline events={report.caseTimeline} highlightTerm={highlightTerm} onUpdateEvents={handleUpdateEvents} />
                        </ReportSection>
                    </div>
                    <div className="flex justify-center p-2 -mt-4 mb-2">
                        <button
                          onClick={handleReanalyzeClick}
                          disabled={isReanalyzing}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 border border-slate-300 disabled:bg-slate-200/50"
                          title="Phân tích lại toàn bộ vụ việc sau khi bạn đã chỉnh sửa dòng thời gian."
                        >
                          {isReanalyzing ? <Loader /> : <RefreshIcon className="w-4 h-4"/>}
                          Phân tích lại Vụ việc
                        </button>
                    </div>
                </>
            )}


            <ReportSection title="1. Quan hệ pháp luật">
                <p><HighlightedText text={report.legalRelationship as string} term={highlightTerm} /></p>
            </ReportSection>

            <ReportSection title="2. Tư cách Tố tụng">
                <ul className="list-disc list-inside space-y-1.5">{report.proceduralStatus.map((p, i) => (<li key={i}><span className="font-semibold">{p.partyName}:</span> {p.status}</li>))}</ul>
            </ReportSection>

            <ReportSection title="3. Vấn đề pháp lý cốt lõi">
                <ul className="list-disc list-inside space-y-1.5">
                    {report.coreLegalIssues.map((issue, index) => (
                        <li key={index} className="flex justify-between items-start gap-2">
                            <span><HighlightedText text={issue as string} term={highlightTerm} /></span>
                            <button 
                                disabled 
                                title="Chức năng đang phát triển"
                                className="flex-shrink-0 text-xs px-2 py-1 bg-slate-200 text-slate-500 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                Tìm án lệ
                            </button>
                        </li>
                    ))}
                </ul>
            </ReportSection>
            
            {report.requestResolutionPlan && (
              <ReportSection title="4. Phương án giải quyết theo Yêu cầu" chatHistory={report.resolutionPlanChat} onChatToggle={() => setActiveChat(prev => prev === 'requestResolutionPlan' ? null : 'requestResolutionPlan')} isChatOpen={activeChat === 'requestResolutionPlan'}>
                <ul className="list-disc list-inside space-y-1.5">{report.requestResolutionPlan.map((item, index) => (<li key={index}><HighlightedText text={item as string} term={highlightTerm} /></li>))}</ul>
                 {activeChat === 'requestResolutionPlan' && <ChatWindow chatHistory={report.resolutionPlanChat || []} onSendMessage={(msg) => handleChatSendMessage('resolutionPlanChat', 'Phương án giải quyết theo Yêu cầu', msg)} isLoading={isChatLoading === 'requestResolutionPlan'} onClose={() => setActiveChat(null)} title="Trao đổi về Phương án giải quyết" />}
              </ReportSection>
            )}

            <ReportSection title="5. Cơ sở pháp lý áp dụng" chatHistory={report.applicableLawsChat} onChatToggle={() => setActiveChat(prev => prev === 'applicableLaws' ? null : 'applicableLaws')} isChatOpen={activeChat === 'applicableLaws'}>
                <div className="space-y-4">
                    {[...report.applicableLaws, ...userAddedLaws].map((law, lawIndex) => (
                        <div key={law.documentName + lawIndex} className="p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <h5 className="font-bold text-slate-800 mb-2"><HighlightedText text={law.documentName as string} term={highlightTerm} /></h5>
                                {lawIndex >= report.applicableLaws.length && (<button onClick={() => handleDeleteUserLaw(lawIndex - report.applicableLaws.length)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>)}
                            </div>
                            {law.coreIssueAddressed && (
                                <p className="text-xs italic text-slate-600 mb-1">
                                    <strong>Vấn đề giải quyết:</strong> <HighlightedText text={law.coreIssueAddressed as string} term={highlightTerm} />
                                </p>
                            )}
                             {law.relevanceToCase && (
                                <p className="text-xs italic text-slate-600 mb-2">
                                    <strong>Sự liên quan:</strong> <HighlightedText text={law.relevanceToCase as string} term={highlightTerm} />
                                </p>
                            )}
                            {law.supportingEvidence && law.supportingEvidence.length > 0 && (
                                <div className="my-2">
                                    <h6 className="text-xs font-semibold text-slate-600">Bằng chứng Hỗ trợ từ Hồ sơ:</h6>
                                    {law.supportingEvidence.map((evidence: SupportingEvidence, idx: number) => (
                                        <blockquote key={idx} className="mt-1 border-l-2 border-slate-300 pl-2 text-xs italic text-slate-500">
                                            <p>“<HighlightedText text={evidence.snippet as string} term={highlightTerm} />”</p>
                                            <cite className="text-slate-400 not-italic">— {evidence.sourceDocument}</cite>
                                        </blockquote>
                                    ))}
                                </div>
                            )}
                            <ul className="space-y-1">
                                {law.articles.map((article, articleIndex) => (
                                    <li key={article.articleNumber + articleIndex} className="flex items-start gap-2 text-sm">
                                        <span className="font-semibold text-blue-600">{article.articleNumber}:</span>
                                        <div className="flex-grow">
                                            <HighlightedText text={article.summary as string} term={highlightTerm} />
                                            <button onClick={() => handleExplainLaw(article)} className="ml-2 text-blue-500 hover:underline text-xs" disabled={!!explainingLaw}>[Giải thích]</button>
                                            {explainingLaw === article.articleNumber && (
                                                <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs animate-fade-in">
                                                    {explanationError ? <p className="text-red-600">{explanationError}</p> : explanation ? <p>{explanation}</p> : <Loader />}
                                                    <button onClick={() => setExplainingLaw(null)} className="text-blue-500 hover:underline mt-1">Đóng</button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {!isAddingLaw && (<button onClick={() => setIsAddingLaw(true)} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:bg-blue-50 p-2 rounded-md"><PlusIcon className="w-4 h-4"/>Thêm cơ sở pháp lý</button>)}
                    {isAddingLaw && (
                        <div className="p-3 border border-blue-300 rounded-lg bg-blue-50 space-y-2 animate-fade-in">
                            <input type="text" value={newLaw.documentName} onChange={e => setNewLaw({ ...newLaw, documentName: e.target.value })} placeholder="Tên văn bản (ví dụ: Bộ luật Dân sự 2015)" className="w-full text-sm p-1.5 border-slate-300 rounded-md" />
                            {newLaw.articles.map((art, i) => (
                                <div key={i} className="flex gap-2">
                                    <input type="text" value={art.articleNumber} onChange={e => { const a = [...newLaw.articles]; a[i].articleNumber = e.target.value; setNewLaw({ ...newLaw, articles: a }); }} placeholder="Điều luật" className="w-1/4 text-sm p-1.5 border-slate-300 rounded-md" />
                                    <input type="text" value={art.summary} onChange={e => { const a = [...newLaw.articles]; a[i].summary = e.target.value; setNewLaw({ ...newLaw, articles: a }); }} placeholder="Tóm tắt nội dung" className="w-3/4 text-sm p-1.5 border-slate-300 rounded-md" />
                                </div>
                            ))}
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setIsAddingLaw(false)} className="px-3 py-1 text-xs bg-slate-200 rounded-md">Hủy</button>
                                <button onClick={handleAddLaw} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md">Thêm</button>
                            </div>
                        </div>
                    )}
                </div>
                 {activeChat === 'applicableLaws' && <ChatWindow chatHistory={report.applicableLawsChat || []} onSendMessage={(msg) => handleChatSendMessage('applicableLawsChat', 'Cơ sở pháp lý áp dụng', msg)} isLoading={isChatLoading === 'applicableLawsChat'} onClose={() => setActiveChat(null)} title="Trao đổi về Cơ sở pháp lý" />}
            </ReportSection>

            <ReportSection title="6. Phân tích Lỗ hổng & Hành động" chatHistory={report.gapAnalysisChat} onChatToggle={() => setActiveChat(prev => prev === 'gapAnalysisChat' ? null : 'gapAnalysisChat')} isChatOpen={activeChat === 'gapAnalysisChat'}>
                <div className="space-y-3">
                    <div><h5 className="font-semibold">Thông tin / Chứng cứ còn thiếu:</h5><ul className="list-disc list-inside space-y-1.5">{report.gapAnalysis.missingInformation.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    <div><h5 className="font-semibold">Hành động đề xuất:</h5><ul className="list-disc list-inside space-y-1.5">{report.gapAnalysis.recommendedActions.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    {report.gapAnalysis.legalLoopholes && report.gapAnalysis.legalLoopholes.length > 0 && (
                        <div>
                            <h5 className="font-semibold mb-2">Lỗ hổng pháp lý tiềm ẩn:</h5>
                            <div className="space-y-2">
                                {report.gapAnalysis.legalLoopholes.map((loophole, index) => (
                                    <div key={index} className="p-2 border border-slate-200 rounded-md bg-slate-50/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getLoopholeIcon(loophole.classification)}
                                            <p className="font-semibold text-slate-800 text-xs">{loophole.classification} (Mức độ: {loophole.severity})</p>
                                        </div>
                                        <p className="font-medium"><HighlightedText text={loophole.description as string} term={highlightTerm} /></p>
                                        <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Gợi ý:</span> <HighlightedText text={loophole.suggestion as string} term={highlightTerm} /></p>
                                        <blockquote className="mt-1 border-l-2 border-slate-300 pl-2 text-xs italic text-slate-500">
                                          <HighlightedText text={loophole.evidence as string} term={highlightTerm} />
                                        </blockquote>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {activeChat === 'gapAnalysisChat' && <ChatWindow chatHistory={report.gapAnalysisChat || []} onSendMessage={(msg) => handleChatSendMessage('gapAnalysisChat', 'Phân tích Lỗ hổng', msg)} isLoading={isChatLoading === 'gapAnalysisChat'} onClose={() => setActiveChat(null)} title="Trao đổi về Phân tích Lỗ hổng"/>}
            </ReportSection>

            <ReportSection title="7. Đánh giá Triển vọng Vụ việc" chatHistory={report.prospectsChat} onChatToggle={() => setActiveChat(prev => prev === 'caseProspects' ? null : 'caseProspects')} isChatOpen={activeChat === 'caseProspects'}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg"><h5 className="font-semibold text-green-800 mb-1">Điểm mạnh</h5><ul className="list-disc list-inside space-y-1.5 text-green-900">{report.caseProspects.strengths.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg"><h5 className="font-semibold text-amber-800 mb-1">Điểm yếu</h5><ul className="list-disc list-inside space-y-1.5 text-amber-900">{report.caseProspects.weaknesses.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg"><h5 className="font-semibold text-red-800 mb-1">Rủi ro</h5><ul className="list-disc list-inside space-y-1.5 text-red-900">{report.caseProspects.risks.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                </div>
                {activeChat === 'caseProspects' && <ChatWindow chatHistory={report.prospectsChat || []} onSendMessage={(msg) => handleChatSendMessage('prospectsChat', 'Triển vọng Vụ việc', msg)} isLoading={isChatLoading === 'caseProspects'} onClose={() => setActiveChat(null)} title="Trao đổi về Triển vọng Vụ việc" />}
            </ReportSection>

            <ReportSection title="8. Đề xuất Lộ trình & Chiến lược" chatHistory={report.strategyChat} onChatToggle={() => setActiveChat(prev => prev === 'proposedStrategy' ? null : 'proposedStrategy')} isChatOpen={activeChat === 'proposedStrategy'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><h5 className="font-semibold">Giai đoạn Tiền tố tụng:</h5><ul className="list-disc list-inside space-y-1.5">{report.proposedStrategy.preLitigation.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                    <div><h5 className="font-semibold">Giai đoạn Tố tụng:</h5><ul className="list-disc list-inside space-y-1.5">{report.proposedStrategy.litigation.map((item, index) => (<li key={index}>{item}</li>))}</ul></div>
                </div>
                 {activeChat === 'proposedStrategy' && <ChatWindow chatHistory={report.strategyChat || []} onSendMessage={(msg) => handleChatSendMessage('strategyChat', 'Chiến lược Đề xuất', msg)} isLoading={isChatLoading === 'proposedStrategy'} onClose={() => setActiveChat(null)} title="Trao đổi về Chiến lược Đề xuất" />}
            </ReportSection>
            
            {report.contingencyPlan && (
              <ReportSection title="9. Phương án xử lý nếu thua kiện" chatHistory={report.contingencyPlanChat} onChatToggle={() => setActiveChat(prev => prev === 'contingencyPlan' ? null : 'contingencyPlan')} isChatOpen={activeChat === 'contingencyPlan'}>
                  <ul className="list-disc list-inside space-y-1.5">{report.contingencyPlan.map((item, index) => (<li key={index}><HighlightedText text={item as string} term={highlightTerm} /></li>))}</ul>
                  {activeChat === 'contingencyPlan' && <ChatWindow chatHistory={report.contingencyPlanChat || []} onSendMessage={(msg) => handleChatSendMessage('contingencyPlanChat', 'Phương án xử lý nếu thua kiện', msg)} isLoading={isChatLoading === 'contingencyPlanChat'} onClose={() => setActiveChat(null)} title="Trao đổi về Phương án dự phòng" />}
              </ReportSection>
            )}

            <OpponentAnalysisSection
                report={report}
                files={files}
                onUpdateReport={onUpdateReport}
                highlightTerm={highlightTerm}
            />
        </div>
    );
};
