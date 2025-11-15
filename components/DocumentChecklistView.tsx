import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisReport, UploadedFile, DocumentChecklistItem, ChatMessage } from '../types.ts';
import { generateDocumentChecklist, chatAboutDocumentChecklist } from '../services/geminiService.ts';
import { LEGAL_PROCEDURES } from '../constants.ts';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { RefreshIcon } from './icons/RefreshIcon.tsx';
import { UploadIcon } from './icons/UploadIcon.tsx';


// Icons
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.06 0l4.25-4.25a.75.75 0 00-.22-1.214z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);
const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
  </svg>
);
const MinusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
  </svg>
);

const getStatusMeta = (status: DocumentChecklistItem['status']) => {
    switch(status) {
        case 'provided': return { icon: <CheckCircleIcon className="w-5 h-5 text-green-600"/>, label: 'Đã có', color: 'bg-green-50 text-green-800' };
        case 'missing': return { icon: <XCircleIcon className="w-5 h-5 text-red-600"/>, label: 'Còn thiếu', color: 'bg-red-50 text-red-800' };
        case 'provisional': return { icon: <ExclamationCircleIcon className="w-5 h-5 text-amber-600"/>, label: 'Cần xem lại', color: 'bg-amber-50 text-amber-800' };
        case 'not_applicable': return { icon: <MinusCircleIcon className="w-5 h-5 text-slate-500"/>, label: 'Không áp dụng', color: 'bg-slate-100 text-slate-600' };
        default: return { icon: null, label: 'Không xác định', color: 'bg-slate-100 text-slate-600' };
    }
}

interface DocumentChecklistViewProps {
    report: AnalysisReport;
    files: UploadedFile[];
    setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
    onUpdateReport: (report: AnalysisReport) => void;
    onReanalyze: (report: AnalysisReport) => void;
    isReanalyzing: boolean;
    onUpdateReportFromChat: (history: ChatMessage[], context: string) => void;
    isUpdatingFromChat: boolean;
}

type AugmentedChecklistItem = {
    item: DocumentChecklistItem;
    associatedFiles: UploadedFile[];
};

export const DocumentChecklistView: React.FC<DocumentChecklistViewProps> = ({ report, files, setFiles, onUpdateReport, onReanalyze, isReanalyzing, onUpdateReportFromChat, isUpdatingFromChat }) => {
    const [selectedProcedure, setSelectedProcedure] = useState('');
    const [checklist, setChecklist] = useState<DocumentChecklistItem[] | null>(null);
    const [augmentedChecklist, setAugmentedChecklist] = useState<AugmentedChecklistItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [filesJustAdded, setFilesJustAdded] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTargetIndex, setUploadTargetIndex] = useState<number | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatHistory = report.checklistChat || [];

    // Effect to initially build the augmented checklist when AI generates a new one
    useEffect(() => {
        if (!checklist) {
            setAugmentedChecklist(null);
            return;
        }

        const findAssociatedFiles = (item: DocumentChecklistItem, allFiles: UploadedFile[]): UploadedFile[] => {
            const associated: UploadedFile[] = [];
            const analysisText = item.analysis.toLowerCase();
            const filenameRegex = /'([^']+?\.(?:pdf|docx?|jpe?g|png))'/g;
            let match;
            const mentionedFilenames = new Set<string>();
            while ((match = filenameRegex.exec(analysisText)) !== null) {
                mentionedFilenames.add(match[1].toLowerCase());
            }

            allFiles.forEach(file => {
                if (mentionedFilenames.has(file.file.name.toLowerCase())) {
                    associated.push(file);
                }
            });
            return associated;
        };

        const newAugmentedChecklist = checklist.map(item => ({
            item,
            associatedFiles: findAssociatedFiles(item, files),
        }));
        setAugmentedChecklist(newAugmentedChecklist);
    }, [checklist, files]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleGenerateChecklist = async () => {
        if (!selectedProcedure) {
            setError('Vui lòng chọn một thủ tục để kiểm tra.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setChecklist(null);
        setFilesJustAdded(false);
        try {
            const fileNames = files.map(f => f.file.name);
            const result = await generateDocumentChecklist(report, fileNames, selectedProcedure);
            setChecklist(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleChatSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isChatLoading) return;
        
        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        const updatedHistory = [...chatHistory, newUserMessage];
        onUpdateReport({ ...report, checklistChat: updatedHistory });
        setUserInput('');
        setIsChatLoading(true);

        try {
            const aiResponse = await chatAboutDocumentChecklist(report, files, checklist || [], updatedHistory, userInput.trim());
            const aiMessage: ChatMessage = { role: 'model', content: aiResponse };
            onUpdateReport({ ...report, checklistChat: [...updatedHistory, aiMessage] });
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', content: `Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối tới AI.'}` };
            onUpdateReport({ ...report, checklistChat: [...updatedHistory, errorMessage] });
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleDeleteFile = (fileIdToDelete: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileIdToDelete));
    };

    const handleAttachClick = (index: number) => {
        setUploadTargetIndex(index);
        fileInputRef.current?.click();
    };
    
    const handleFileAttachChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && uploadTargetIndex !== null) {
            const newLocalFiles = Array.from(e.target.files);
            // FIX: Explicitly type `file` as `File` to resolve type inference issue.
            const newUploadedFiles: UploadedFile[] = newLocalFiles.map((file: File) => ({
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                file, preview: null, category: 'Uncategorized', status: 'pending',
            }));
            
            setFiles(prev => [...prev, ...newUploadedFiles]);
            
            setAugmentedChecklist(prev => {
                if (!prev) return null;
                const newChecklist = [...prev];
                newChecklist[uploadTargetIndex].associatedFiles.push(...newUploadedFiles);
                return newChecklist;
            });
            setFilesJustAdded(true);
        }
        if (e.target) e.target.value = '';
        setUploadTargetIndex(null);
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-full">
             <input type="file" multiple ref={fileInputRef} onChange={handleFileAttachChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"/>
            {/* Left Panel: Checklist */}
            <div className="col-span-12 lg:col-span-7 flex flex-col h-full">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Kiểm tra Hồ sơ theo Thủ tục</h2>
                <p className="text-sm text-slate-600 mb-4">Chọn một thủ tục, AI sẽ đối chiếu với các tệp đã có và tạo checklist chi tiết.</p>

                <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="procedure-select" className="block text-sm font-semibold text-slate-700 mb-1.5">Chọn thủ tục cần thực hiện:</label>
                            <select id="procedure-select" value={selectedProcedure} onChange={(e) => setSelectedProcedure(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm">
                                <option value="" disabled>--- Chọn thủ tục ---</option>
                                {Object.entries(LEGAL_PROCEDURES).map(([group, procedures]) => (
                                    <optgroup key={group} label={group === 'land' ? 'Đất đai' : 'Hôn nhân & Gia đình'}>
                                        {procedures.map(proc => <option key={proc} value={proc}>{proc}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <button onClick={handleGenerateChecklist} disabled={isLoading || !selectedProcedure} className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                            {isLoading ? <><Loader /> <span>Đang tạo...</span></> : <>Tạo Checklist</>}
                        </button>
                    </div>
                     {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                     {filesJustAdded && (
                        <div className="p-2 bg-blue-50 text-blue-800 text-sm rounded-md flex items-center justify-between">
                            <span>Đã bổ sung tệp mới, bạn nên phân tích lại để có kết quả chính xác nhất.</span>
                            <button onClick={() => onReanalyze(report)} disabled={isReanalyzing} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                                {isReanalyzing ? <Loader /> : 'Phân tích lại'}
                            </button>
                        </div>
                     )}
                </div>
                
                <div className="flex-grow bg-white border border-slate-200 rounded-lg overflow-y-auto min-h-0">
                    {!augmentedChecklist && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                            <p>Kết quả kiểm tra hồ sơ sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                    {isLoading && (
                         <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
                            <Loader />
                            <p className="mt-4">AI đang đối chiếu hồ sơ...</p>
                        </div>
                    )}
                    {augmentedChecklist && (
                        <ul className="divide-y divide-slate-200">
                           {augmentedChecklist.map((entry, index) => {
                               const { item, associatedFiles } = entry;
                               const meta = getStatusMeta(item.status);
                               return (
                                   <li key={index} className="p-4 hover:bg-slate-50/50">
                                       <div className="flex justify-between items-start gap-4">
                                           <h4 className="font-semibold text-slate-800 flex-grow">{item.documentName}</h4>
                                           <div className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded-full ${meta.color}`}>
                                               {meta.icon}
                                               <span>{meta.label}</span>
                                           </div>
                                       </div>
                                       <table className="mt-3 w-full text-left text-xs text-slate-600">
                                            <tbody>
                                                <tr className="border-t">
                                                    <td className="font-semibold p-2 align-top w-1/4 bg-slate-50">Lý do</td>
                                                    <td className="p-2">{item.reason}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-semibold p-2 align-top bg-slate-50">Phân tích</td>
                                                    <td className="p-2">{item.analysis}</td>
                                                </tr>
                                                {(item.status === 'missing' || item.status === 'provisional') && (
                                                    <tr>
                                                        <td className="font-semibold p-2 align-top bg-slate-50">Hướng dẫn Bổ sung</td>
                                                        <td className="p-2">{item.howToSupplement}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                         <div className="mt-3 pt-3 border-t border-slate-200/70">
                                            <h5 className="text-xs font-semibold text-slate-600 mb-2">Tệp đính kèm cho mục này:</h5>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {associatedFiles.map(file => (
                                                    <div key={file.id} className="bg-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                                        <span>{file.file.name}</span>
                                                        <button 
                                                            onClick={() => handleDeleteFile(file.id)} 
                                                            className="text-slate-500 hover:text-red-600 font-bold leading-none text-base"
                                                            title={`Xóa tệp ${file.file.name}`}
                                                        >&times;</button>
                                                    </div>
                                                ))}
                                                <button onClick={() => handleAttachClick(index)} className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 border border-blue-200">
                                                    <UploadIcon className="w-3 h-3" />
                                                    Đính kèm tệp mới...
                                                </button>
                                            </div>
                                        </div>
                                   </li>
                               )
                           })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Right Panel: Chat */}
            <div className="col-span-12 lg:col-span-5 flex flex-col h-full">
                 <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                    <ChatIcon className="w-6 h-6 text-blue-600" />
                    <span>Trao đổi về Hồ sơ</span>
                </h2>
                <p className="text-sm text-slate-600 mb-4">Hỏi AI để làm rõ các yêu cầu, phân tích nội dung tệp, hoặc hướng dẫn bổ sung.</p>
                <div className="flex-grow bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-y-auto min-h-0">
                    {chatHistory.length === 0 && !isChatLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                            <p>Bắt đầu cuộc trò chuyện bằng cách đặt một câu hỏi bên dưới.</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                             <div key={index} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && (<div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-5 h-5 text-white"/></div>)}
                                <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-5 h-5 text-white"/></div><div className="p-3 rounded-lg bg-slate-100 flex items-center shadow-sm"><Loader /></div></div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>
                <form onSubmit={handleChatSendMessage} className="flex-shrink-0 flex items-start gap-2">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="VD: Kiểm tra nội dung trong tệp 'so_do.pdf' có khớp với báo cáo không?" className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none" rows={2} disabled={isChatLoading || isUpdatingFromChat} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSendMessage(e); } }} />
                    <button type="submit" disabled={isChatLoading || isUpdatingFromChat || !userInput.trim()} className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-300"><SendIcon className="w-5 h-5"/></button>
                </form>
                 <button onClick={() => onUpdateReportFromChat(chatHistory, 'Kiểm tra Hồ sơ')} disabled={isUpdatingFromChat || isChatLoading || !chatHistory || chatHistory.length === 0} className="w-full mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md py-1.5 disabled:opacity-50">
                    {isUpdatingFromChat ? <><Loader /> <span>Đang cập nhật...</span></> : <><RefreshIcon className="w-4 h-4" /> <span>Cập nhật Phân tích Vụ việc</span></>}
                </button>
            </div>
        </div>
    );
};
