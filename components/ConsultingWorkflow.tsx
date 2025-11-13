

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './FileUpload.tsx';
import { Loader } from './Loader.tsx';
import { MagicIcon } from './icons/MagicIcon.tsx';
import { analyzeConsultingCase, generateConsultingDocument, categorizeMultipleFiles, summarizeText, refineQuickAnswer, continueConsultingChat } from '../services/geminiService.ts';
import type { UploadedFile, SavedCase, SerializableFile, ConsultingReport, LitigationType, LegalLoophole, ChatMessage } from '../types.ts';
import { BackIcon } from './icons/BackIcon.tsx';
import { saveCase } from '../services/db.ts';
import { SaveCaseIcon } from './icons/SaveCaseIcon.tsx';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { ProcessingProgress } from './ProcessingProgress.tsx';
import { MicrophoneIcon } from './icons/MicrophoneIcon.tsx';
import { ChatIcon } from './icons/ChatIcon.tsx';
import { SendIcon } from './icons/SendIcon.tsx';
import { ChatBubbleLeftIcon } from './icons/ChatBubbleLeftIcon.tsx';

// --- Internal Icons ---
const MinimizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
  </svg>
);
const MaximizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);
const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.75 11.625-3.75-3.75" />
    </svg>
);
const DiscussionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 11.55c0 2.944 1.79 5.515 4.5 6.943.25.123.5.217.75.284V21a.75.75 0 0 0 .94.724l2.16-1.08a8.25 8.25 0 0 0 4.66 0l2.16 1.08a.75.75 0 0 0 .94-.724v-2.008c.25-.067.5-.16.75-.284A8.845 8.845 0 0 0 21 11.55c0-4.556-4.03-8.25-9-8.25Z" />
    </svg>
);
const CaseInfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h10.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" />
    </svg>
);
const DocumentSuggestionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9h7.5m-7.5 3h7.5m-11.25-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Zm-3.75-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Zm-3.75-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Z" />
    </svg>
);
const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);
// --- New Icon for Quick Answer ---
const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.354a15.055 15.055 0 0 1-4.5 0M3 10.5a8.25 8.25 0 1 1 15 5.25v.75a2.25 2.25 0 0 1-2.25 2.25H7.5a2.25 2.25 0 0 1-2.25-2.25v-.75a8.25 8.25 0 0 1 1.5-5.25Z" />
    </svg>
);

const RoadmapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5 3 11.25l3.75 3.75M17.25 7.5 21 11.25l-3.75 3.75M13.5 5.25 10.5 18.75" />
    </svg>
);

const NextStepsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 14.25v-1.5c0-.621.504-1.125 1.125-1.125h14.25c.621 0 1.125.504 1.125 1.125v1.5m-16.5 0v3.75c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125v-3.75m-16.5 0h16.5" />
    </svg>
);


const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01" />
    </svg>
);
const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


const Alert: React.FC<{ message: string; type: 'error' | 'warning' | 'info' }> = ({ message, type }) => {
    const baseClasses = "p-4 text-sm rounded-lg animate-fade-in";
    const typeClasses = { error: "bg-red-50 text-red-800", warning: "bg-amber-50 text-amber-800", info: "bg-blue-50 text-blue-800" };
    const messageParts = message.split(/:(.*)/s);
    const hasTitle = messageParts.length > 1;
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {hasTitle ? (<><span className="font-bold">{messageParts[0]}:</span><span className="ml-1">{messageParts[1]}</span></>) : message}
        </div>
    );
};

interface ConsultingWorkflowProps {
    onPreview: (file: UploadedFile) => void;
    onGoBack: () => void;
    activeCase: SavedCase | null;
    onCasesUpdated: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result.split(',')[1]) : reject(new Error('Failed to read file.'));
        reader.onerror = (error) => reject(error);
    });

const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
};

// --- Helper Hook for Mobile Detection ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};


export const ConsultingWorkflow: React.FC<ConsultingWorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [disputeContent, setDisputeContent] = useState('');
    const [clientRequest, setClientRequest] = useState('');

    const [consultingReport, setConsultingReport] = useState<ConsultingReport | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [generationRequest, setGenerationRequest] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [caseName, setCaseName] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);
    const [isSummarizingField, setIsSummarizingField] = useState<'disputeContent' | 'clientRequest' | null>(null);
    const [summarizationError, setSummarizationError] = useState<string | null>(null);

    const [listeningField, setListeningField] = useState<'disputeContent' | 'clientRequest' | null>(null);
    const recognitionRef = useRef<any>(null);

    const defaultPrompt = `Soạn một bình luận trả lời ngắn gọn, chuyên nghiệp và thể hiện sự đồng cảm cho một bài đăng trên mạng xã hội. Dựa trên phân tích, hãy nhấn mạnh vào một rủi ro pháp lý nghiêm trọng nhất mà họ đang đối mặt và gợi ý 1-2 bước hành động đầu tiên họ nên làm. Kết thúc bằng việc mời họ liên hệ để được tư vấn chi tiết và giải quyết vấn đề.`;

    useEffect(() => {
        if (consultingReport && !generationRequest) {
            setGenerationRequest(defaultPrompt);
        }
    }, [consultingReport, generationRequest]);

    useEffect(() => {
        if (activeCase?.workflowType === 'consulting') {
            const loadedFiles: UploadedFile[] = (activeCase.files || []).map(sf => ({
                id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type),
                preview: null, category: 'Uncategorized', status: 'pending'
            }));
            setFiles(loadedFiles);
            setDisputeContent(activeCase.caseContent || '');
            setClientRequest(activeCase.clientRequest || '');
            setConsultingReport(activeCase.consultingReport || null);
            setCaseName(activeCase.name);
        }
    }, [activeCase]);

    const handleBackClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) onGoBack();
    };

    const handleSave = async () => {
        if (!activeCase) return;
        const defaultName = caseName || clientRequest || `Tư vấn ngày ${new Date().toLocaleDateString('vi-VN')}`;
        const newCaseName = window.prompt("Nhập tên để lưu nghiệp vụ:", defaultName);
        if (!newCaseName) return;

        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(
                files.map(async f => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) }))
            );
            const now = new Date().toISOString();
            const isNewCase = activeCase.id.startsWith('new_');
            const caseToSave: SavedCase = {
                ...activeCase, id: isNewCase ? now : activeCase.id, createdAt: isNewCase ? now : activeCase.createdAt,
                updatedAt: now, name: newCaseName, workflowType: 'consulting', files: serializableFiles, caseContent: disputeContent,
                clientRequest, query: '', litigationType: consultingReport?.caseType !== 'unknown' ? consultingReport?.caseType || null : null,
                litigationStage: 'consulting', analysisReport: null, consultingReport: consultingReport,
            };
            await saveCase(caseToSave);
            onCasesUpdated();
            setCaseName(caseToSave.name);
            alert(`Nghiệp vụ "${newCaseName}" đã được lưu thành công!`);
        } catch (err) {
            console.error("Error saving consulting case:", err);
            alert("Đã xảy ra lỗi khi lưu nghiệp vụ.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSummarizeField = async (fieldName: 'disputeContent' | 'clientRequest') => {
        const textToSummarize = fieldName === 'disputeContent' ? disputeContent : clientRequest;
        if (!textToSummarize.trim()) return;

        setIsSummarizingField(fieldName);
        setSummarizationError(null);
        try {
            const summarizedText = await summarizeText(textToSummarize, fieldName);
            if (fieldName === 'disputeContent') {
                setDisputeContent(summarizedText);
            } else {
                setClientRequest(summarizedText);
            }
        } catch (err) {
            setSummarizationError(err instanceof Error ? err.message : 'Lỗi khi tóm tắt');
        } finally {
            setIsSummarizingField(null);
        }
    };
    
    const handleMicClick = (fieldName: 'disputeContent' | 'clientRequest') => {
        if (listeningField) {
            recognitionRef.current?.stop();
            return;
        }
    
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
            return;
        }
    
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = 'vi-VN';
        recognition.interimResults = false;
        recognition.continuous = true;
    
        recognition.onstart = () => {
            setListeningField(fieldName);
        };
    
        recognition.onend = () => {
            setListeningField(null);
            recognitionRef.current = null;
        };
    
        recognition.onerror = (event: any) => {
            console.error("Lỗi nhận diện giọng nói:", event.error);
            setListeningField(null);
        };
    
        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
    
            if (finalTranscript) {
                const targetSetter = fieldName === 'disputeContent' ? setDisputeContent : setClientRequest;
                targetSetter(prev => (prev ? prev.trim() + ' ' : '') + finalTranscript.trim());
            }
        };
    
        recognition.start();
    };

    const performAnalysis = useCallback(async (filesToAnalyze: UploadedFile[]) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeConsultingCase(filesToAnalyze, disputeContent, clientRequest);
            setConsultingReport(result);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi phân tích.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [disputeContent, clientRequest]);
    
    const handleAnalyzeClick = useCallback(async () => {
        setAnalysisError(null);
        setSummarizationError(null);
        setConsultingReport(null);
        setGeneratedText('');

        if (files.length > 0) {
            setIsPreprocessingFinished(false);
            setIsProcessing(true);
            setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, error: undefined })));

            try {
                const fileObjects = files.map(f => f.file);
                const categoryMap = await categorizeMultipleFiles(fileObjects);
                setFiles(prev => prev.map(f => ({
                    ...f,
                    status: 'completed',
                    category: categoryMap[f.file.name] || 'Uncategorized'
                })));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Lỗi không xác định';
                setFiles(prev => prev.map(f => ({ ...f, status: 'failed', error: message })));
            } finally {
                setIsPreprocessingFinished(true);
            }
        } else {
            if (!disputeContent.trim() && !clientRequest.trim()) {
                setAnalysisError("Vui lòng tải tệp hoặc nhập nội dung để phân tích.");
                return;
            }
            await performAnalysis([]);
        }
    }, [files, disputeContent, clientRequest, performAnalysis]);

    
    const handleContinueAnalysis = useCallback(async () => {
        const successfulFiles = files.filter(f => f.status === 'completed');
        setIsProcessing(false);
        await performAnalysis(successfulFiles);
    }, [files, performAnalysis]);
    
    const handleCancelProcessing = () => {
        setIsProcessing(false);
        setIsPreprocessingFinished(false);
        setFiles(prev => prev.map(f => ({ ...f, status: 'pending', error: undefined })));
    };

    const handleGenerate = async (request: string) => {
        if (!request.trim()) { setGenerationError("Vui lòng nhập yêu cầu."); return; }
        setGenerationRequest(request);
        setGenerationError(null);
        setIsGenerating(true);
        setGeneratedText('');
        try {
            const result = await generateConsultingDocument(consultingReport, disputeContent, request);
            setGeneratedText(result);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : "Lỗi không xác định.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const isAnalyzeDisabled = isAnalyzing || isProcessing || !!isSummarizingField || !!listeningField || (files.length === 0 && !disputeContent.trim() && !clientRequest.trim());

    return (
        <div className="animate-fade-in relative">
             <div className="mb-6 flex justify-between items-center">
                <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    <BackIcon className="w-5 h-5" /> Quay lại Chọn Nghiệp vụ
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300">
                    {isSaving ? <Loader /> : <><SaveCaseIcon className="w-4 h-4" /> <span>Lưu vụ việc</span></>}
                </button>
            </div>
            
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Nghiệp vụ Tư vấn & Soạn thảo</h2>
                <p className="text-slate-600 max-w-2xl mx-auto mt-2">Cung cấp thông tin, để AI phân tích và đề xuất các bước tiếp theo, sau đó soạn thảo văn bản.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">1. Cung cấp Thông tin</h3>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                            <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                             
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="disputeContent" className="text-sm font-semibold text-slate-700">Tóm tắt bối cảnh, tình huống</label>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleMicClick('disputeContent')} 
                                            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors ${listeningField === 'disputeContent' ? 'bg-red-100 text-red-700 animate-pulse' : 'text-blue-600 hover:bg-blue-50'}`}
                                            title="Ghi âm giọng nói"
                                        >
                                            <MicrophoneIcon className="w-4 h-4" />
                                            <span>{listeningField === 'disputeContent' ? 'Dừng...' : 'Ghi âm'}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSummarizeField('disputeContent')} 
                                            disabled={!disputeContent.trim() || !!isSummarizingField || !!listeningField} 
                                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Dùng AI để tóm tắt và làm rõ nội dung bên dưới"
                                        >
                                            {isSummarizingField === 'disputeContent' ? <Loader /> : <MagicIcon className="w-4 h-4" />}
                                            <span>Tóm tắt</span>
                                        </button>
                                    </div>
                                </div>
                                <textarea 
                                    id="disputeContent"
                                    value={disputeContent} 
                                    onChange={e => setDisputeContent(e.target.value)} 
                                    placeholder="Dán, nhập hoặc dùng micro để ghi âm nội dung vụ việc, diễn biến sự kiện vào đây..." 
                                    className="input-base w-full h-28 bg-white" 
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label htmlFor="clientRequest" className="text-sm font-semibold text-slate-700">Yêu cầu của khách hàng</label>
                                     <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleMicClick('clientRequest')} 
                                            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md transition-colors ${listeningField === 'clientRequest' ? 'bg-red-100 text-red-700 animate-pulse' : 'text-blue-600 hover:bg-blue-50'}`}
                                            title="Ghi âm giọng nói"
                                        >
                                            <MicrophoneIcon className="w-4 h-4" />
                                            <span>{listeningField === 'clientRequest' ? 'Dừng...' : 'Ghi âm'}</span>
                                        </button>
                                        <button 
                                            onClick={() => handleSummarizeField('clientRequest')} 
                                            disabled={!clientRequest.trim() || !!isSummarizingField || !!listeningField} 
                                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title="Dùng AI để tóm tắt và làm rõ nội dung bên dưới"
                                        >
                                            {isSummarizingField === 'clientRequest' ? <Loader /> : <MagicIcon className="w-4 h-4" />}
                                            <span>Tóm tắt</span>
                                        </button>
                                    </div>
                                </div>
                                <textarea 
                                    id="clientRequest"
                                    value={clientRequest} 
                                    onChange={e => setClientRequest(e.target.value)} 
                                    placeholder="Dán, nhập hoặc dùng micro để ghi âm yêu cầu của khách hàng..." 
                                    className="input-base w-full h-20 bg-white" 
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-3">2. Phân tích Sơ bộ</h3>
                        {summarizationError && <div className="mb-2"><Alert message={summarizationError} type="error" /></div>}
                        <button onClick={handleAnalyzeClick} disabled={isAnalyzeDisabled} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-md hover:shadow-lg disabled:shadow-none">
                            {isAnalyzing || isProcessing ? <><Loader /> <span>Đang phân tích...</span></> : <><MagicIcon className="w-5 h-5" /> <span>Phân tích Tư vấn</span></>}
                        </button>
                    </div>
                </div>

                <div className="space-y-6 min-h-[400px]">
                     <h3 className="text-lg font-bold text-slate-800">3. Kết quả & Soạn thảo</h3>
                    {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50 rounded-lg border p-6">
                            <Loader /><p className="mt-4">AI đang phân tích...</p>
                        </div>
                    )}
                    {analysisError && <Alert message={analysisError} type="error" />}
                    
                    {!isAnalyzing && !consultingReport && !analysisError && (
                        <div className="flex flex-col items-center justify-center text-center text-slate-400 bg-slate-50 rounded-lg border p-6 h-full">
                            <MagicIcon className="w-16 h-16 mb-4 text-slate-300" />
                            <p className="font-medium text-slate-600">Kết quả phân tích và soạn thảo sẽ xuất hiện ở đây.</p>
                        </div>
                    )}

                    {consultingReport && (
                        <div className="space-y-6 animate-fade-in">
                            <AnalysisResultDisplay 
                                report={consultingReport} 
                                setReport={setConsultingReport}
                                onGenerateRequest={setGenerationRequest} 
                            />
                            <GenerationSection
                                onGenerate={handleGenerate}
                                isLoading={isGenerating}
                                error={generationError}
                                generatedText={generatedText}
                                currentRequest={generationRequest}
                                setCurrentRequest={setGenerationRequest}
                            />
                        </div>
                    )}
                </div>
            </div>
            {isProcessing && (<ProcessingProgress files={files} onContinue={handleContinueAnalysis} onCancel={handleCancelProcessing} isFinished={isPreprocessingFinished} hasTextContent={disputeContent.trim().length > 0 || clientRequest.trim().length > 0} />)}
            {consultingReport && <GlobalChat report={consultingReport} setReport={setConsultingReport} />}
        </div>
    );
};

// --- Sub-components for ConsultingWorkflow ---

const GlobalChat: React.FC<{
    report: ConsultingReport;
    setReport: React.Dispatch<React.SetStateAction<ConsultingReport | null>>;
}> = ({ report, setReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const isMobile = useIsMobile();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        if (isOpen) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
    }, [report.globalChatHistory, isOpen]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!userInput.trim() && attachedFiles.length === 0) || isLoading) return;
        setIsLoading(true);
        const newUserMessage: ChatMessage = { role: 'user', content: userInput.trim() };
        const currentHistory = report.globalChatHistory || [];
        const updatedHistory = [...currentHistory, newUserMessage];
        setReport(prev => prev ? { ...prev, globalChatHistory: updatedHistory } : null);
        
        const attachedUploadedFiles: UploadedFile[] = attachedFiles.map(file => ({
            id: file.name, file, preview: null, category: 'Uncategorized', status: 'pending'
        }));

        try {
            const { chatResponse, updatedReport } = await continueConsultingChat(
                report, currentHistory, userInput.trim(), attachedUploadedFiles
            );
            const aiMessage: ChatMessage = { role: 'model', content: chatResponse };
            const finalHistory = [...updatedHistory, aiMessage];
            
            if (updatedReport) {
                setReport({ ...updatedReport, globalChatHistory: finalHistory });
            } else {
                setReport(prev => prev ? { ...prev, globalChatHistory: finalHistory } : null);
            }
        } catch (err) {
            const errorMessage: ChatMessage = { role: 'model', content: `Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối tới AI.'}` };
            setReport(prev => prev ? { ...prev, globalChatHistory: [...updatedHistory, errorMessage] } : null);
        } finally {
            setUserInput(''); setAttachedFiles([]); setIsLoading(false);
        }
    };
    
    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-40"
                aria-label="Mở cửa sổ trò chuyện"
            >
                <ChatIcon className="w-8 h-8" />
            </button>
        );
    }
    
    const mobileClasses = "inset-0 w-full h-full rounded-none";
    const desktopClasses = "bottom-8 right-8 w-[400px] h-[550px] max-h-[80vh] rounded-xl shadow-2xl border border-slate-200";

    return (
        <div className={`fixed bg-white flex flex-col z-50 animate-fade-in ${isMobile ? mobileClasses : desktopClasses}`}>
            <header className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="font-bold text-slate-800">Trò chuyện với Trợ lý AI</h3>
                <div className="flex items-center gap-1">
                    {!isMobile && (
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Thu nhỏ"><MinimizeIcon className="w-5 h-5"/></button>
                    )}
                    <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100" aria-label="Đóng cửa sổ trò chuyện"><XMarkIcon className="w-6 h-6"/></button>
                </div>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {(report.globalChatHistory || []).map((msg, index) => (
                    <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div>}
                        <div className={`max-w-[85%] p-2.5 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div>
                    </div>
                ))}
                {isLoading && <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0"><MagicIcon className="w-4 h-4 text-white"/></div><div className="p-2.5 rounded-lg bg-slate-100"><Loader /></div></div>}
                <div ref={chatEndRef} />
            </div>

            <footer className="p-4 border-t border-slate-200 flex-shrink-0">
                {attachedFiles.length > 0 && (
                    <div className="mb-2 space-y-1">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded">
                                <span className="truncate">{file.name}</span>
                                <button onClick={() => removeFile(index)} className="p-0.5 rounded-full hover:bg-slate-200"><XMarkIcon className="w-3 h-3 text-slate-500"/></button>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-start gap-2">
                    <textarea 
                        value={userInput} 
                        onChange={e => setUserInput(e.target.value)} 
                        placeholder="Nhập tin nhắn..." 
                        className="flex-grow p-2 border border-slate-300 rounded-md text-sm resize-none"
                        rows={2}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        <label className="p-2 bg-slate-100 text-slate-600 font-semibold rounded-md hover:bg-slate-200 cursor-pointer">
                            <PaperClipIcon className="w-5 h-5"/>
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg"
                                disabled={isLoading}
                            />
                        </label>
                        <button type="submit" disabled={isLoading || (!userInput.trim() && attachedFiles.length === 0)} className="p-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-300">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </form>
            </footer>
        </div>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 soft-shadow">
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-2 rounded-full">{icon}</div>
            <h4 className="font-bold text-slate-800">{title}</h4>
        </div>
        <div className="pl-12 text-sm text-slate-700 space-y-3">{children}</div>
    </div>
);

const AnalysisResultDisplay: React.FC<{ 
    report: ConsultingReport; 
    setReport: React.Dispatch<React.SetStateAction<ConsultingReport | null>>;
    onGenerateRequest: (req: string) => void; 
}> = ({ report, setReport, onGenerateRequest }) => {
    const [isRefining, setIsRefining] = useState<string|null>(null);
    
    const renderConciseAnswer = (text?: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return (
          <>
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
              }
              return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
          </>
        );
    };

    const handleCopyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert('Đã sao chép vào bộ nhớ tạm!');
    };

    const handleRefineAnswer = async (mode: 'concise' | 'empathetic' | 'formal') => {
        if (!report?.conciseAnswer) return;
        setIsRefining(mode);
        try {
            const newAnswer = await refineQuickAnswer(report.conciseAnswer, mode);
            setReport(prev => prev ? { ...prev, conciseAnswer: newAnswer } : null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsRefining(null);
        }
    };
    
    const handleZaloCopy = async () => {
        if (!report?.conciseAnswer || isRefining) return;
        setIsRefining('zalo_fb');
        try {
            const zaloVersion = await refineQuickAnswer(report.conciseAnswer, 'zalo_fb');
            navigator.clipboard.writeText(zaloVersion);
            alert('Đã sao chép phiên bản Zalo/Facebook vào bộ nhớ tạm!');
        } catch (error) {
            console.error(error);
            alert('Lỗi khi tạo phiên bản Zalo/Facebook.');
        } finally {
            setIsRefining(null);
        }
    };

    return (
        <div className="space-y-4">
            {report.conciseAnswer && (
                 <InfoCard icon={<LightbulbIcon className="w-5 h-5"/>} title="Câu trả lời Tư vấn Nhanh">
                    <div className="relative">
                        <p className="font-medium text-slate-800 whitespace-pre-wrap pr-8">{renderConciseAnswer(report.conciseAnswer)}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                        {['concise', 'empathetic', 'formal'].map(mode => {
                            const labels = { concise: 'Làm gọn', empathetic: 'Đồng cảm', formal: 'Trang trọng' };
                            return (
                                <button
                                    key={mode}
                                    onClick={() => handleRefineAnswer(mode as any)}
                                    disabled={!!isRefining}
                                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 disabled:opacity-50 transition-colors"
                                >
                                    {isRefining === mode ? <Loader /> : labels[mode as keyof typeof labels]}
                                </button>
                            );
                        })}
                        <div className="flex-grow" />
                        <button onClick={handleZaloCopy} disabled={!!isRefining} className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50" title="Sao chép bản Zalo/Facebook">
                            {isRefining === 'zalo_fb' ? <Loader /> : <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />}
                        </button>
                        <button onClick={() => handleCopyToClipboard(report.conciseAnswer || '')} disabled={!!isRefining} className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50" title="Sao chép">
                            <CopyIcon className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </InfoCard>
            )}

            {report.preliminaryAssessment && (
                 <InfoCard icon={<CaseInfoIcon className="w-5 h-5"/>} title="Đánh giá Sơ bộ & Định hướng">
                    <p>{report.preliminaryAssessment}</p>
                </InfoCard>
            )}

            {report.proposedRoadmap && (
                 <InfoCard icon={<RoadmapIcon className="w-5 h-5"/>} title="Lộ trình Giải quyết Đề xuất">
                    <div className="relative pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                        {report.proposedRoadmap.map((step, index) => (
                            <div key={index} className="relative mb-4 last:mb-0">
                                <div className="absolute -left-[28px] top-1 w-4 h-4 bg-blue-500 rounded-full border-4 border-white"></div>
                                <h5 className="font-bold text-blue-700">{step.stage}</h5>
                                <p className="mt-1">{step.description}</p>
                                <p className="text-xs text-slate-500 mt-1"><span className="font-semibold">Mục tiêu:</span> {step.outcome}</p>
                            </div>
                        ))}
                    </div>
                </InfoCard>
            )}

             {report.nextActions && (
                 <InfoCard icon={<NextStepsIcon className="w-5 h-5"/>} title="Hành động Tiếp theo Ngay lập tức">
                    <ul className="space-y-1.5 list-disc list-inside">
                        {report.nextActions.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                </InfoCard>
            )}

            {report.discussionPoints && (
                <InfoCard icon={<DiscussionIcon className="w-5 h-5"/>} title="Điểm quan trọng cần trao đổi thêm">
                    <ul className="space-y-1.5 list-disc list-inside">
                        {report.discussionPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                </InfoCard>
            )}
            
            {report.legalLoopholes && report.legalLoopholes.length > 0 && (
                <InfoCard icon={<ExclamationTriangleIcon className="w-5 h-5"/>} title="Cảnh báo Rủi ro & Lỗ hổng Pháp lý">
                     <p className="text-slate-600 text-xs mb-3">AI đã phát hiện một số rủi ro tiềm ẩn cần được xem xét cẩn thận:</p>
                     <div className="space-y-2">
                        {report.legalLoopholes.map((item, index) => (
                            <div key={index} className="p-2 border rounded-md bg-amber-50/50 border-amber-200">
                                <p className="font-semibold text-amber-900">{item.description}</p>
                                <p className="text-xs mt-1"><span className="font-semibold">Gợi ý:</span> {item.suggestion}</p>
                            </div>
                        ))}
                     </div>
                </InfoCard>
            )}
        </div>
    );
};

const GenerationSection: React.FC<{
    onGenerate: (req: string) => void;
    isLoading: boolean;
    error: string | null;
    generatedText: string;
    currentRequest: string;
    setCurrentRequest: (req: string) => void;
}> = ({ onGenerate, isLoading, error, generatedText, currentRequest, setCurrentRequest }) => {
    
    const handleCopyToClipboard = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            alert("Đã sao chép vào bộ nhớ tạm!");
        }
    };
    
    const proposalPrompt = "Dựa trên báo cáo phân tích, hãy soạn thảo một Thư Tư vấn chính thức gửi khách hàng. Thư cần bao gồm: tóm tắt lại vấn đề, trình bày lộ trình giải quyết đã đề xuất, phạm vi công việc chi tiết cho từng giai đoạn, và cấu trúc phí dịch vụ đề xuất.";

    return (
        <div className="space-y-4 pt-6 border-t border-slate-200">
            <div>
                 <div className="flex flex-wrap gap-2 mb-2">
                    <button onClick={() => setCurrentRequest("Soạn thảo một email trả lời khách hàng dựa trên các phân tích trên.")} className="flex items-center gap-1.5 text-xs p-1.5 bg-blue-100 text-blue-800 font-medium rounded-md hover:bg-blue-200">
                        <PlusIcon className="w-3 h-3 shrink-0" />Soạn Email
                    </button>
                     <button onClick={() => setCurrentRequest(proposalPrompt)} className="flex items-center gap-1.5 text-xs p-1.5 bg-green-100 text-green-800 font-medium rounded-md hover:bg-green-200">
                        <PlusIcon className="w-3 h-3 shrink-0" />Soạn thảo Thư Tư vấn & Báo giá
                    </button>
                </div>
                <textarea
                    value={currentRequest}
                    onChange={(e) => setCurrentRequest(e.target.value)}
                    placeholder="Nhập yêu cầu soạn thảo..."
                    className="input-base w-full h-24 bg-white"
                />
            </div>
            <button
                onClick={() => onGenerate(currentRequest)}
                disabled={isLoading || !currentRequest.trim()}
                className="w-full py-2 px-4 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader /> <span>Đang soạn thảo...</span></> : 'Soạn thảo theo Yêu cầu'}
            </button>
            {error && <Alert message={error} type="error" />}

            <div className="rounded-xl bg-white border border-slate-200 p-4 overflow-y-auto min-h-[250px] relative shadow-inner">
                {generatedText && !isLoading && (
                    <button onClick={handleCopyToClipboard} className="absolute top-3 right-3 bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-300 z-10">Copy</button>
                )}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500"><Loader /><p className="mt-4">AI đang tư duy...</p></div>
                )}
                {!isLoading && !generatedText && (
                    <div className="flex items-center justify-center h-full text-slate-400 text-center"><p>Văn bản do AI tạo sẽ xuất hiện ở đây.</p></div>
                )}
                {generatedText && <pre className="whitespace-pre-wrap break-words text-slate-800 font-sans">{generatedText}</pre>}
            </div>
        </div>
    );
};