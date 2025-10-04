


import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { Loader } from './Loader';
import { MagicIcon } from './icons/MagicIcon';
import { analyzeConsultingCase, generateConsultingDocument } from '../services/geminiService';
import type { UploadedFile, SavedCase, SerializableFile, ConsultingReport, LitigationType } from '../types';
import { BackIcon } from './icons/BackIcon';
import { saveCase } from '../services/db';
import { SaveCaseIcon } from './icons/SaveCaseIcon';
import { PlusIcon } from './icons/PlusIcon';


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


export const ConsultingWorkflow: React.FC<ConsultingWorkflowProps> = ({ onPreview, onGoBack, activeCase, onCasesUpdated }) => {
    // State for inputs
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [disputeContent, setDisputeContent] = useState('');
    const [generationRequest, setGenerationRequest] = useState('');
    
    // State for analysis
    const [consultingReport, setConsultingReport] = useState<ConsultingReport | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // State for document generation
    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // State for saving
    const [isSaving, setIsSaving] = useState(false);
    const [caseName, setCaseName] = useState('');

    useEffect(() => {
        if (activeCase && activeCase.workflowType === 'consulting') {
            const loadedFiles: UploadedFile[] = (activeCase.files || []).map(sf => {
                const file = base64ToFile(sf.content, sf.name, sf.type);
                return { id: `${sf.name}-${Math.random()}`, file, preview: null, category: 'Uncategorized', status: 'pending' };
            });
            setFiles(loadedFiles);
            setDisputeContent(activeCase.caseContent || '');
            setGenerationRequest(activeCase.clientRequest || ''); // clientRequest maps to generationRequest
            setConsultingReport(activeCase.consultingReport || null);
            setCaseName(activeCase.name);
        }
    }, [activeCase]);

    const handleBackClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) {
            onGoBack();
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (files.length === 0 && !disputeContent.trim()) {
            setAnalysisError("Vui lòng tải lên tệp hoặc nhập nội dung vụ việc để phân tích.");
            return;
        }
        setAnalysisError(null);
        setConsultingReport(null);
        setIsAnalyzing(true);
        try {
            const result = await analyzeConsultingCase(files, disputeContent, generationRequest);
            setConsultingReport(result);
        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi phân tích.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [files, disputeContent, generationRequest]);

    const handleGenerate = async (requestText: string) => {
        if (!requestText.trim()) {
            setGenerationError("Vui lòng nhập yêu cầu hoặc chọn một gợi ý.");
            return;
        }
        setGenerationRequest(requestText);
        setGenerationError(null);
        setIsGenerating(true);
        setGeneratedText('');
        try {
            const result = await generateConsultingDocument(consultingReport, disputeContent, requestText);
            setGeneratedText(result);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSave = async () => {
        if (!activeCase) return;
        const defaultName = caseName || generationRequest || `Tư vấn ngày ${new Date().toLocaleDateString('vi-VN')}`;
        const newCaseName = window.prompt("Nhập tên để lưu nghiệp vụ:", defaultName);
        if (!newCaseName) return;

        setIsSaving(true);
        try {
            const serializableFiles: SerializableFile[] = await Promise.all(
                files.map(async (uploadedFile) => ({
                    name: uploadedFile.file.name,
                    type: uploadedFile.file.type,
                    content: await fileToBase64(uploadedFile.file),
                }))
            );

            const now = new Date().toISOString();
            const isNewCase = activeCase.id.startsWith('new_');
            
            const caseToSave: SavedCase = {
                ...activeCase,
                id: isNewCase ? now : activeCase.id,
                createdAt: isNewCase ? now : activeCase.createdAt,
                updatedAt: now,
                name: newCaseName,
                workflowType: 'consulting',
                files: serializableFiles,
                caseContent: disputeContent,
                clientRequest: generationRequest,
                query: '',
                litigationType: consultingReport?.caseType !== 'unknown' ? consultingReport?.caseType || null : null,
                litigationStage: 'consulting',
                analysisReport: null,
                consultingReport: consultingReport,
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

    const handleCopyToClipboard = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            alert("Đã sao chép vào bộ nhớ tạm!");
        }
    };
    
    const isAnalyzeDisabled = isAnalyzing || (files.length === 0 && !disputeContent.trim());
    const isGenerateDisabled = isGenerating;
    const caseTypeLabel: Record<LitigationType | 'unknown', string> = {
      civil: 'Dân sự',
      criminal: 'Hình sự',
      administrative: 'Hành chính',
      unknown: 'Chưa xác định'
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-6 flex justify-between items-center">
                <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    <BackIcon className="w-5 h-5" />
                    Quay lại Chọn Nghiệp vụ
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300 transition-colors">
                    {isSaving ? <Loader /> : <SaveCaseIcon className="w-4 h-4" />}
                    Lưu Nghiệp vụ
                </button>
            </div>
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Nghiệp vụ Tư vấn & Soạn thảo</h2>
                    <p className="text-center text-slate-600 max-w-2xl mx-auto">
                        Cung cấp thông tin, để AI phân tích và đề xuất các bước tiếp theo, sau đó soạn thảo văn bản.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs & Analysis */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="block text-lg font-bold text-slate-800 mb-3">1. Cung cấp Thông tin</h3>
                             <div className="p-4 bg-gray-50 border border-slate-200 rounded-lg space-y-4">
                                <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                                <textarea
                                    id="disputeContent"
                                    value={disputeContent}
                                    onChange={(e) => setDisputeContent(e.target.value)}
                                    placeholder="Thêm bối cảnh, tình huống của khách hàng..."
                                    className="w-full h-32 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                                />
                             </div>
                        </div>

                        <div>
                             <h3 className="block text-lg font-bold text-slate-800 mb-3">2. Phân tích Sơ bộ</h3>
                             <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzeDisabled}
                                className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-base rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                             >
                                 {isAnalyzing ? <><Loader /> <span>Đang phân tích...</span></> : <><MagicIcon className="w-5 h-5" /> Phân tích Tư vấn</>}
                             </button>
                             {analysisError && <p className="text-red-500 text-sm mt-2 text-center">{analysisError}</p>}
                        </div>

                         {consultingReport && (
                             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4 animate-fade-in-down">
                                <h4 className="font-bold text-blue-800">Kết quả Phân tích:</h4>
                                <div>
                                    <p className="font-semibold text-sm mb-1">Điểm quan trọng cần trao đổi:</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-800">
                                        {consultingReport.discussionPoints.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                                <div className="text-sm">
                                    <p><span className="font-semibold">Loại vụ việc:</span> {caseTypeLabel[consultingReport.caseType]}</p>
                                    <p><span className="font-semibold">Giai đoạn sơ bộ:</span> {consultingReport.preliminaryStage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column: Generation */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">3. Soạn thảo Văn bản</h3>
                        <div className="flex-grow space-y-4">
                            {consultingReport && consultingReport.suggestedDocuments.length > 0 && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in-down">
                                    <h4 className="font-semibold text-green-800 mb-2">Văn bản đề xuất:</h4>
                                    <div className="flex flex-col items-start gap-2">
                                        {consultingReport.suggestedDocuments.map((doc, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleGenerate(doc)}
                                                className="text-left w-full p-2 bg-green-100 text-green-900 font-medium rounded-md hover:bg-green-200 text-sm flex items-center gap-2"
                                            >
                                                <PlusIcon className="w-4 h-4 shrink-0" />{doc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <textarea
                                id="generationRequest"
                                value={generationRequest}
                                onChange={(e) => setGenerationRequest(e.target.value)}
                                placeholder="Hoặc nhập yêu cầu soạn thảo khác..."
                                className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                            />
                            <button
                                onClick={() => handleGenerate(generationRequest)}
                                disabled={isGenerateDisabled || !generationRequest}
                                className="w-full py-2.5 px-4 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <><Loader /> <span>AI đang soạn thảo...</span></> : 'Soạn thảo theo Yêu cầu'}
                            </button>
                            {generationError && <p className="text-red-500 text-center">{generationError}</p>}
                            
                            <div className="flex-grow rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-y-auto min-h-[300px] relative shadow-inner">
                                {generatedText && !isGenerating && (
                                    <button onClick={handleCopyToClipboard} className="absolute top-3 right-3 bg-slate-200 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-300 transition-colors z-10">
                                        Copy
                                    </button>
                                )}
                                {isGenerating && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <Loader />
                                        <p className="mt-4">AI đang phân tích và soạn thảo...</p>
                                    </div>
                                )}
                                {!isGenerating && !generatedText && (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-center">
                                        <p>Văn bản do AI tạo sẽ xuất hiện ở đây.</p>
                                    </div>
                                )}
                                {generatedText && (
                                    <pre className="whitespace-pre-wrap break-words text-slate-800 font-sans">{generatedText}</pre>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};