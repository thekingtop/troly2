import React, { useState, useMemo } from 'react';
import type { AnalysisReport, UploadedFile, DocumentChecklistItem } from '../types.ts';
import { generateDocumentChecklist } from '../services/geminiService.ts';
import { LEGAL_PROCEDURES } from '../constants.ts';
import { Loader } from './Loader.tsx';

// Icons
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
);
const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);
const QuestionMarkCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.061 3.5 3.5 0 117.002 0a.75.75 0 01-1.06 1.061 2 2 0 10-4.002 0zM10 12.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);
const MinusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
  </svg>
);

const statusMeta: Record<DocumentChecklistItem['status'], { icon: React.ReactNode, color: string, label: string }> = {
    provided: { icon: <CheckCircleIcon className="w-6 h-6 text-green-600"/>, color: 'border-green-500', label: 'Đã có'},
    missing: { icon: <XCircleIcon className="w-6 h-6 text-red-600"/>, color: 'border-red-500', label: 'Còn thiếu'},
    provisional: { icon: <QuestionMarkCircleIcon className="w-6 h-6 text-amber-600"/>, color: 'border-amber-500', label: 'Cần xem xét'},
    not_applicable: { icon: <MinusCircleIcon className="w-6 h-6 text-slate-500"/>, color: 'border-slate-400', label: 'Không áp dụng'},
};

export const DocumentChecklistView: React.FC<{ report: AnalysisReport | null, files: UploadedFile[] }> = ({ report, files }) => {
    const [selectedProcedure, setSelectedProcedure] = useState('');
    const [checklist, setChecklist] = useState<DocumentChecklistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const availableProcedures = useMemo(() => {
        const procedures: { label: string, options: string[] }[] = [];
        if (report?.landInfo) {
            procedures.push({ label: 'Thủ tục về Đất đai', options: LEGAL_PROCEDURES.land });
        }
        if (report?.familyLawInfo) {
             procedures.push({ label: 'Thủ tục về Hôn nhân & Gia đình', options: LEGAL_PROCEDURES.family });
        }
        // Always add general procedures if none are contextually available
        if (procedures.length === 0) {
            procedures.push({ label: 'Thủ tục về Đất đai', options: LEGAL_PROCEDURES.land });
            procedures.push({ label: 'Thủ tục về Hôn nhân & Gia đình', options: LEGAL_PROCEDURES.family });
        }
        return procedures;
    }, [report]);
    
    const handleCheck = async () => {
        if (!report || !selectedProcedure) return;
        setIsLoading(true);
        setError(null);
        setChecklist([]);
        try {
            const fileNames = files.map(f => f.file.name);
            const result = await generateDocumentChecklist(report, fileNames, selectedProcedure);
            setChecklist(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!report) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 bg-slate-50 rounded-lg border p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12v5.25a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75a2.25 2.25 0 0 1 2.25-2.25h.586a1.5 1.5 0 0 0 1.06-.44L8.25 3.15a1.5 1.5 0 0 1 1.06-.44h5.38a1.5 1.5 0 0 1 1.06.44l.803.804a1.5 1.5 0 0 0 1.06.44h.586a2.25 2.25 0 0 1 2.25 2.25v2.25Z" /></svg>
                <h2 className="text-xl font-bold text-slate-700">Kiểm tra Hồ sơ Thủ tục</h2>
                <p className="mt-2 max-w-md">Vui lòng chạy phân tích vụ việc trước. AI sẽ sử dụng bối cảnh vụ việc để đưa ra checklist hồ sơ chính xác nhất.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Kiểm tra Hồ sơ Thủ tục</h2>
            <p className="text-sm text-slate-600 mb-6">Chọn một thủ tục để AI đối chiếu với hồ sơ hiện có và đưa ra hướng dẫn.</p>
            
            <div className="flex items-end gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex-grow">
                    <label htmlFor="procedure" className="block text-sm font-semibold text-slate-700 mb-1">Chọn thủ tục cần kiểm tra</label>
                    <select id="procedure" value={selectedProcedure} onChange={(e) => setSelectedProcedure(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                        <option value="">-- Vui lòng chọn --</option>
                        {availableProcedures.map(group => (
                            <optgroup label={group.label} key={group.label}>
                                {group.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <button onClick={handleCheck} disabled={isLoading || !selectedProcedure} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center gap-2">
                    {isLoading ? <Loader /> : 'Kiểm tra'}
                </button>
            </div>

            {error && <p className="text-red-600 mt-4">{error}</p>}

            {isLoading && <div className="mt-6 text-center"><Loader /> <p>AI đang đối chiếu hồ sơ...</p></div>}

            {checklist.length > 0 && (
                <div className="mt-6 space-y-3 animate-fade-in">
                    {checklist.map((item, index) => (
                         <details key={index} className="bg-white p-4 rounded-lg border-l-4 transition-all open:shadow-lg" style={{ borderColor: statusMeta[item.status].color }}>
                            <summary className="flex items-center gap-4 cursor-pointer">
                                {statusMeta[item.status].icon}
                                <div className="flex-grow">
                                    <p className="font-semibold text-slate-800">{item.documentName}</p>
                                    <p className="text-xs text-slate-500">{statusMeta[item.status].label}</p>
                                </div>
                            </summary>
                            <div className="mt-4 pl-10 text-sm space-y-3">
                                <p><strong className="text-slate-600">Lý do:</strong> {item.reason}</p>
                                <p><strong className="text-slate-600">Phân tích:</strong> {item.analysis}</p>
                                <p className="p-2 bg-slate-50 rounded-md"><strong className="text-slate-600">Hướng dẫn bổ sung:</strong> {item.howToSupplement}</p>
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </div>
    );
};