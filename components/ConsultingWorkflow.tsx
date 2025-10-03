

import React, { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { Loader } from './Loader';
import { MagicIcon } from './icons/MagicIcon';
import { FileImportIcon } from './icons/FileImportIcon';
import { generateConsultingDocument, extractDataFromDocument, suggestCaseType } from '../services/geminiService';
import type { UploadedFile, LitigationType } from '../types';
import { BackIcon } from './icons/BackIcon';

interface ConsultingWorkflowProps {
    onPreview: (file: UploadedFile) => void;
    onGoBack: () => void;
}

export const ConsultingWorkflow: React.FC<ConsultingWorkflowProps> = ({ onPreview, onGoBack }) => {
    // State for inputs
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [disputeContent, setDisputeContent] = useState('');
    const [clientRequest, setClientRequest] = useState('');
    
    // State for data extraction
    const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionError, setExtractionError] = useState<string | null>(null);

    // State for case type suggestion
    const [litigationType, setLitigationType] = useState<LitigationType | null>(null);
    const [isSuggestingType, setIsSuggestingType] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    // State for document generation
    const [generatedText, setGeneratedText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const handleBackClick = () => {
        if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) {
            onGoBack();
        }
    };

    const handleExtract = useCallback(async () => {
        if (files.length === 0) {
            setExtractionError("Vui lòng tải lên ít nhất một tệp để trích xuất.");
            return;
        }
        const fileToProcess = files[0];

        setExtractionError(null);
        setIsExtracting(true);
        setExtractedData(null);
        try {
            const result = await extractDataFromDocument(fileToProcess);
            if (Object.keys(result).length === 0) {
                setExtractionError("Không tìm thấy thông tin quan trọng nào trong tài liệu.");
            } else {
                setExtractedData(result);
            }
        } catch (err) {
            setExtractionError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi trích xuất.");
        } finally {
            setIsExtracting(false);
        }
    }, [files]);

     const handleSuggestCaseType = useCallback(async () => {
        if (files.length === 0 && !disputeContent.trim() && !clientRequest.trim()) {
            setSuggestionError("Vui lòng tải tệp hoặc nhập nội dung để AI đề xuất.");
            return;
        }
        setIsSuggestingType(true);
        setSuggestionError(null);
        try {
            const suggestedType = await suggestCaseType(files, disputeContent, clientRequest);
            setLitigationType(suggestedType);
        } catch (err) {
            setSuggestionError(err instanceof Error ? err.message : "Lỗi khi đề xuất loại vụ việc.");
        } finally {
            setIsSuggestingType(false);
        }
    }, [files, disputeContent, clientRequest]);
    
    const handleGenerate = async () => {
        if (!disputeContent.trim() && !clientRequest.trim() && !extractedData && files.length === 0) {
            setGenerationError("Vui lòng cung cấp thông tin, yêu cầu hoặc trích xuất dữ liệu từ tệp.");
            return;
        }
        setGenerationError(null);
        setIsGenerating(true);
        setGeneratedText('');
        try {
            const result = await generateConsultingDocument(disputeContent, clientRequest, extractedData, litigationType);
            setGeneratedText(result);
        } catch (err) {
            setGenerationError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            alert("Đã sao chép vào bộ nhớ tạm!");
        }
    };
    
    const isGenerateDisabled = isGenerating || (!disputeContent.trim() && !clientRequest.trim() && !extractedData && files.length === 0);
    const isSuggestionDisabled = isSuggestingType || (files.length === 0 && !disputeContent.trim() && !clientRequest.trim());


    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <button onClick={handleBackClick} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                    <BackIcon className="w-5 h-5" />
                    Quay lại Chọn Nghiệp vụ
                </button>
            </div>
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Nghiệp vụ Tư vấn & Soạn thảo</h2>
                    <p className="text-center text-slate-600 max-w-2xl mx-auto">
                        Tải lên tài liệu, trích xuất dữ liệu tự động, và yêu cầu AI soạn thảo văn bản.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="block text-lg font-bold text-slate-800 mb-3">1. Cung cấp Tài liệu & Dữ liệu</h3>
                            <div className="p-4 bg-gray-50 border border-slate-200 rounded-lg space-y-4">
                                <FileUpload files={files} setFiles={setFiles} onPreview={onPreview} />
                                <button
                                    onClick={handleExtract}
                                    disabled={isExtracting || files.length === 0}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700 text-white font-semibold text-sm rounded-lg hover:bg-slate-800 disabled:bg-slate-300 transition-colors"
                                >
                                    {isExtracting ? <><Loader /> <span>Đang trích xuất...</span></> : <><FileImportIcon className="w-5 h-5" /> Trích xuất Thông tin từ Tệp</>}
                                </button>
                                {extractionError && <p className="text-red-500 text-sm mt-2 text-center">{extractionError}</p>}
                            </div>
                        </div>
                         {extractedData && (
                             <div className="animate-fade-in-down">
                                <h4 className="font-semibold text-slate-800 mb-2">Thông tin đã trích xuất:</h4>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-48 overflow-y-auto">
                                    <ul className="space-y-1.5 text-sm">
                                        {Object.entries(extractedData).map(([key, value]) => (
                                            <li key={key} className="grid grid-cols-3 gap-2">
                                                <strong className="text-slate-600 truncate col-span-1">{key}:</strong>
                                                <span className="text-slate-800 col-span-2">{value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="block text-lg font-bold text-slate-800">2. Phân loại Vụ việc (Tùy chọn)</h3>
                                <button 
                                    onClick={handleSuggestCaseType}
                                    disabled={isSuggestionDisabled}
                                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-50 text-blue-700 font-semibold rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
                                >
                                    {isSuggestingType ? <Loader/> : <MagicIcon className="w-4 h-4"/>}
                                    AI Đề xuất
                                </button>
                            </div>
                             <div className="p-4 bg-gray-50 border border-slate-200 rounded-lg space-y-3">
                                 <div className="flex gap-2">
                                    {(['civil', 'criminal', 'administrative'] as LitigationType[]).map(type => (
                                        <button key={type} onClick={() => setLitigationType(type)} className={`flex-1 text-sm py-2 px-2 rounded-md border transition-colors ${litigationType === type ? 'bg-blue-600 text-white font-semibold border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                                            {type === 'civil' ? 'Dân sự' : type === 'criminal' ? 'Hình sự' : 'Hành chính'}
                                        </button>
                                    ))}
                                </div>
                                 {suggestionError && <p className="text-red-500 text-sm text-center">{suggestionError}</p>}
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="disputeContent" className="block text-lg font-bold text-slate-800 mb-3">3. Bối cảnh & Yêu cầu</label>
                            <textarea
                                id="disputeContent"
                                value={disputeContent}
                                onChange={(e) => setDisputeContent(e.target.value)}
                                placeholder="Thêm bối cảnh, tình huống của khách hàng (nếu cần)..."
                                className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <textarea
                                id="clientRequest"
                                value={clientRequest}
                                onChange={(e) => setClientRequest(e.target.value)}
                                placeholder="Yêu cầu AI soạn thảo (ví dụ: Soạn thư tư vấn phân tích rủi ro, Soạn thư yêu cầu đòi tiền cọc...)"
                                className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full py-3 px-4 bg-blue-600 text-white font-bold text-base rounded-lg hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            {isGenerating ? <><Loader /><span>AI đang soạn thảo...</span></> : <><MagicIcon className="w-5 h-5" /> Soạn thảo Văn bản</>}
                        </button>
                        {generationError && <p className="text-red-500 text-center mt-2">{generationError}</p>}
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-3">3. Kết quả</h3>
                        <div className="flex-grow rounded-xl bg-slate-50 border border-slate-200 p-4 overflow-y-auto min-h-[400px] relative shadow-inner">
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
    );
};