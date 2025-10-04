
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { ReportDisplay } from './components/ReportDisplay';
import { Loader } from './components/Loader';
import { analyzeCaseFiles, generateContextualDocument, refineText, generateReportSummary, categorizeFile } from './services/geminiService';
import { db, getAllCasesSorted, saveCase, deleteCaseById } from './services/db';
import type { AnalysisReport, UploadedFile, SavedCase, SerializableFile, LitigationStage, LitigationType, FileCategory } from './types';
import { ConsultingWorkflow } from './components/ConsultingWorkflow';
import { AnalysisIcon } from './components/icons/AnalysisIcon';
import { PreviewModal } from './components/PreviewModal';
import { MagicIcon } from './components/icons/MagicIcon';
import { ExportIcon } from './components/icons/ExportIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { PanelCollapseIcon } from './components/icons/PanelCollapseIcon';
import { PanelExpandIcon } from './components/icons/PanelExpandIcon';
import { SaveCaseIcon } from './components/icons/SaveCaseIcon';
import { FolderIcon } from './components/icons/FolderIcon';
import { PlusIcon } from './components/icons/PlusIcon';
import { CustomizeReportModal, ReportSection } from './components/CustomizeReportModal';
import { BackIcon } from './components/icons/BackIcon';
import { litigationStagesByType, getStageLabel, litigationStageSuggestions } from './constants';
import { ProcessingProgress } from './components/ProcessingProgress';


// Declare global variables from CDN scripts to satisfy TypeScript
declare var docx: any;
declare var XLSX: any;
declare var jspdf: any;
declare var html2canvas: any;

type RefineField = 'caseContent' | 'clientRequest';
type RefineMode = 'concise' | 'detailed';
type MainActionType = 'analyze' | 'update' | 'none';

interface MainAction {
    text: string;
    disabled: boolean;
    action: MainActionType;
    loadingText: string;
}

type StageSuggestions = {
  actions: string[];
  documents: string[];
};


// --- Helper Functions & Types ---

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
  

// --- UI Components (Defined within App.tsx for simplicity) ---

const Alert: React.FC<{ message: string; type: 'error' | 'warning' | 'info' }> = ({ message, type }) => {
  const baseClasses = "p-4 text-sm rounded-lg animate-fade-in";
  const typeClasses = {
    error: "bg-red-50 text-red-800",
    warning: "bg-amber-50 text-amber-800",
    info: "bg-blue-50 text-blue-800",
  };
  // Split message to bold the first part if it contains a colon
  const messageParts = message.split(/:(.*)/s);
  const hasTitle = messageParts.length > 1;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      {hasTitle ? (
        <>
          <span className="font-bold">{messageParts[0]}:</span>
          <span className="ml-1">{messageParts[1]}</span>
        </>
      ) : (
        message
      )}
    </div>
  );
};


const App: React.FC = () => {
  // --- Core State ---
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [query, setQuery] = useState<string>('');
  const [caseContent, setCaseContent] = useState<string>('');
  const [clientRequest, setClientRequest] = useState<string>('');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [originalReport, setOriginalReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  
  // --- Case Management State ---
  const [savedCases, setSavedCases] = useState<SavedCase[]>([]);
  const [activeCase, setActiveCase] = useState<SavedCase | null>(null);
  const [isCaseListOpen, setIsCaseListOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isWorkflowSelectorOpen, setIsWorkflowSelectorOpen] = useState(false);
  
  // --- Litigation Workflow State ---
  const [currentLitigationType, setCurrentLitigationType] = useState<LitigationType>('civil');
  const [currentLitigationStage, setCurrentLitigationStage] = useState<LitigationStage>('consulting');
  const [mainAction, setMainAction] = useState<MainAction>({ text: 'Phân tích Vụ việc', disabled: true, action: 'analyze', loadingText: 'Đang phân tích...' });
  const [refiningField, setRefiningField] = useState<{ field: RefineField; mode: RefineMode } | null>(null);
  const [refineError, setRefineError] = useState<{field: RefineField, message: string} | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isGeneratingDocument, setIsGeneratingDocument] = useState<boolean>(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [caseDocRequest, setCaseDocRequest] = useState('');
  const [suggestedDocRequest, setSuggestedDocRequest] = useState('');

  // --- UI State ---
  const [previewingFile, setPreviewingFile] = useState<UploadedFile | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [libsReady, setLibsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreprocessingFinished, setIsPreprocessingFinished] = useState(false);

  const resetAnalysisState = useCallback(() => {
    setFiles([]);
    setQuery('');
    setCaseContent('');
    setClientRequest('');
    setReport(null);
    setOriginalReport(null);
    setError(null);
    setSummaryError(null);
    setGenerationError(null);
    setGeneratedDocument(null);
    setCaseDocRequest('');
    setSuggestedDocRequest('');
    const defaultLitigationType: LitigationType = 'civil';
    const defaultStage = litigationStagesByType[defaultLitigationType]?.[0]?.value || 'consulting';
    setCurrentLitigationType(defaultLitigationType);
    setCurrentLitigationStage(defaultStage);
  }, []);


  const handleGoBackToSelection = useCallback(() => {
    setActiveCase(null);
    resetAnalysisState();
    setIsWorkflowSelectorOpen(false);
  }, [resetAnalysisState]);

  const loadData = useCallback(async () => {
      try {
          const casesFromDb = await getAllCasesSorted();
          setSavedCases(casesFromDb);
      } catch (e) {
          console.error("Failed to load cases:", e);
      }
  }, []);

  // --- Effects ---
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const checkLibs = () => {
      if (typeof docx !== 'undefined' && typeof XLSX !== 'undefined' && typeof jspdf !== 'undefined' && typeof html2canvas !== 'undefined') {
        setLibsReady(true);
        return true;
      }
      return false;
    };
    if (checkLibs()) return;
    const interval = setInterval(() => { if (checkLibs()) clearInterval(interval); }, 500);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const isReadyForAnalysis = query.trim().length > 0 && (files.length > 0 || caseContent.trim().length > 0 || clientRequest.trim().length > 0);
    const stageLabel = getStageLabel(currentLitigationType, currentLitigationStage);

    if (!report) {
        setMainAction({ text: 'Phân tích Vụ việc', disabled: !isReadyForAnalysis || isLoading || isProcessing, action: 'analyze', loadingText: 'Đang xử lý...' });
    } else {
        const isUpdatableStage = currentLitigationStage !== 'consulting' && currentLitigationStage !== 'closed';
        if (isUpdatableStage) {
            setMainAction({ text: `Cập nhật cho GĐ: ${stageLabel}`, disabled: isLoading || isProcessing, action: 'update', loadingText: 'Đang cập nhật...' });
        } else {
            setMainAction({ text: 'Đã phân tích', disabled: true, action: 'none', loadingText: '' });
        }
    }
  }, [report, currentLitigationStage, currentLitigationType, files, caseContent, clientRequest, query, isLoading, isProcessing]);

  const handleDocSuggestionClick = (docName: string) => {
    setCaseDocRequest(`Soạn thảo "${docName}"`);
    document.getElementById('generation-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const performAnalysis = async (filesToAnalyze: UploadedFile[]) => {
      setIsLoading(true);
      try {
          const analysisResult = await analyzeCaseFiles(filesToAnalyze, query, caseContent, clientRequest);
          setReport(analysisResult);
          setOriginalReport(analysisResult);
          
          const currentStageOptions = litigationStagesByType[currentLitigationType] || [];
          if (analysisResult.litigationStage && currentStageOptions.some(opt => opt.value === analysisResult.litigationStage)) {
              setCurrentLitigationStage(analysisResult.litigationStage);
          } else if (currentLitigationStage === 'consulting') {
              const nextStage = litigationStagesByType[currentLitigationType]?.[1]?.value || currentLitigationStage;
              setCurrentLitigationStage(nextStage);
          }

          let suggestion = '';
          const strategy = analysisResult.proposedStrategy;
          if (strategy?.litigation?.length > 0) suggestion = strategy.litigation[0];
          else if (strategy?.preLitigation?.length > 0) suggestion = strategy.preLitigation[0];
          setSuggestedDocRequest(suggestion);
          setCaseDocRequest('');
      } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleAnalyze = useCallback(async () => {
    setError(null);
    setSummaryError(null);
    setGenerationError(null);
    setReport(null);
    setOriginalReport(null);
    setGeneratedDocument(null);
    setSuggestedDocRequest('');

    if (files.length > 0) {
        setIsPreprocessingFinished(false);
        setIsProcessing(true);
        const filesToProcess = files.map(f => ({ ...f, status: 'pending' as const, error: undefined }));
        setFiles(filesToProcess);

        for (const file of filesToProcess) {
            try {
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processing' } : f));
                const category = await categorizeFile(file.file);
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'completed', category } : f));
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Lỗi không xác định';
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'failed', error: message } : f));
            }
        }
        setIsPreprocessingFinished(true);
    } else {
        await performAnalysis([]);
    }
  }, [files, query, caseContent, clientRequest]);
  
  const handleContinueAnalysis = useCallback(async () => {
    const successfulFiles = files.filter(f => f.status === 'completed');
    setIsProcessing(false);
    await performAnalysis(successfulFiles);
  }, [files, query, caseContent, clientRequest]);

  const handleRetryFile = useCallback(async (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (!fileToRetry) return;
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing', error: undefined } : f));
    try {
        const category = await categorizeFile(fileToRetry.file);
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'completed', category } : f));
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi không xác định';
        setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'failed', error: message } : f));
    }
  }, [files]);
  
  const handleCancelProcessing = () => {
      setIsProcessing(false);
      setIsPreprocessingFinished(false);
      setFiles(prev => prev.map(f => ({ ...f, status: 'pending', error: undefined })));
  };

  const handleUpdateAnalysis = useCallback(async () => {
    if (!originalReport) { setError("Không có báo cáo gốc để cập nhật."); return; }
    setError(null); setSummaryError(null); setIsLoading(true);
    try {
      const updatedReport = await analyzeCaseFiles(files, query, caseContent, clientRequest, {
        report: originalReport,
        stage: getStageLabel(currentLitigationType, currentLitigationStage)
      });
      setReport(updatedReport); setOriginalReport(updatedReport);
      alert(`Đã cập nhật thành công cho giai đoạn: ${getStageLabel(currentLitigationType, currentLitigationStage)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định khi cập nhật.");
    } finally {
      setIsLoading(false);
    }
  }, [originalReport, currentLitigationType, currentLitigationStage, files, query, caseContent, clientRequest]);

  const handleMainActionClick = () => {
    if (mainAction.action === 'analyze') handleAnalyze();
    else if (mainAction.action === 'update') handleUpdateAnalysis();
  };
  
  // --- Case Management Logic ---
  const startNewWorkflow = (type: 'consulting' | 'litigation') => {
        resetAnalysisState();
        setActiveCase({
          id: `new_${Date.now()}`,
          workflowType: type, name: '', caseContent: '', clientRequest: '', query: '',
          files: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          litigationType: 'civil', litigationStage: 'consulting', analysisReport: null,
        });
        setIsInputCollapsed(false);
        setIsWorkflowSelectorOpen(false);
  };

  const handleSaveCase = async () => {
    if (!activeCase) return;
    const defaultName = activeCase.name || query || `Vụ việc ngày ${new Date().toLocaleDateString('vi-VN')}`;
    const caseName = window.prompt("Nhập tên để lưu vụ việc:", defaultName);
    if (!caseName) return;
    
    setIsSaving(true);
    try {
      const serializableFiles: SerializableFile[] = await Promise.all(files.map(async (f) => ({ name: f.file.name, type: f.file.type, content: await fileToBase64(f.file) })));
      const now = new Date().toISOString();
      const caseToSave: SavedCase = {
        ...activeCase,
        id: activeCase.id.startsWith('new_') ? now : activeCase.id,
        createdAt: activeCase.id.startsWith('new_') ? now : activeCase.createdAt,
        name: caseName, caseContent, clientRequest, query, files: serializableFiles, updatedAt: now,
        litigationType: currentLitigationType, litigationStage: currentLitigationStage, analysisReport: report,
      };
      await saveCase(caseToSave);
      setActiveCase(caseToSave);
      await loadData();
      alert(`Vụ việc "${caseName}" đã được lưu!`);
    } catch (err) {
      alert("Đã xảy ra lỗi khi lưu vụ việc.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadCase = (caseToLoad: SavedCase) => {
    resetAnalysisState();
    setActiveCase({ ...caseToLoad, workflowType: caseToLoad.workflowType || 'litigation' });
    setCaseContent(caseToLoad.caseContent);
    setClientRequest(caseToLoad.clientRequest);
    setQuery(caseToLoad.query);
    setReport(caseToLoad.analysisReport);
    setOriginalReport(caseToLoad.analysisReport);
    setCurrentLitigationType(caseToLoad.litigationType || 'civil');
    setCurrentLitigationStage(caseToLoad.litigationStage || 'consulting');
    const loadedFiles: UploadedFile[] = caseToLoad.files.map(sf => ({ id: `${sf.name}-${Math.random()}`, file: base64ToFile(sf.content, sf.name, sf.type), preview: null, category: 'Uncategorized', status: 'pending' }));
    setFiles(loadedFiles);
    setIsCaseListOpen(false);
    setIsInputCollapsed(false);
    alert(`Đã tải vụ việc "${caseToLoad.name}".`);
  };

  const handleDeleteCase = async (caseId: string) => {
     if (window.confirm("Bạn có chắc chắn muốn xóa vụ việc này?")) {
        try {
            await deleteCaseById(caseId);
            setSavedCases(p => p.filter(c => c.id !== caseId));
            if (activeCase?.id === caseId) setActiveCase(null);
        } catch(err) {
            alert("Đã xảy ra lỗi khi xóa vụ việc.");
        }
     }
  };

  const filteredCases = savedCases.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.caseContent.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- Export Logic ---
  const generateSafeFilename = (baseName: string) => baseName.replace(/[^a-z0-9_-\s]/gi, '').replace(/\s+/g, '_').substring(0, 50) || 'Bao_cao';
  
  const handleFinalExport = (format: 'docx' | 'xlsx' | 'pdf', customizedReport: AnalysisReport, orderedSections: ReportSection[]) => {
    if (!report || isExporting) return;
    const baseFilename = `Bao_cao_Phan_tich_${generateSafeFilename(query)}`;
    setIsExporting(true);
    try {
        if (format === 'docx') { exportToDocx(customizedReport, `${baseFilename}.docx`, orderedSections); setIsExporting(false); setIsCustomizeModalOpen(false); }
        else if (format === 'xlsx') { exportToXlsx(customizedReport, `${baseFilename}.xlsx`); setIsExporting(false); setIsCustomizeModalOpen(false); }
        else if (format === 'pdf') {
            setReport(customizedReport);
            setTimeout(() => exportToPdf(`${baseFilename}.pdf`), 100);
        }
    } catch (err) {
        setError(`Xuất file ${format.toUpperCase()} thất bại.`);
        setIsExporting(false);
    }
  }

  const exportToDocx = (reportData: AnalysisReport, fileName: string, orderedSections: ReportSection[]) => {
    if (typeof docx === 'undefined') { console.error("DOCX library not ready."); return; }
    const { Document, Packer, Paragraph, HeadingLevel, AlignmentType } = docx;
    const createHeading = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
    const createSubHeading = (text: string) => new Paragraph({ text, style: "strongStyle", spacing: { before: 150, after: 75 } });
    const createParagraph = (text: string) => new Paragraph({ text, spacing: { after: 100 } });
    const createListItem = (text: string) => new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 50 } });
    let docSections: any[] = [ new Paragraph({ text: `BÁO CÁO PHÂN TÍCH VỤ VIỆC`, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }), new Paragraph({ text: query, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }), ];
    orderedSections.forEach(section => {
        switch (section.id) {
            case 'customNotesSection': if (reportData.customNotes) docSections.push(createHeading(section.title), createParagraph(reportData.customNotes)); break;
            case 'legalRelationship': if (reportData.legalRelationship) docSections.push(createHeading(section.title), createParagraph(reportData.legalRelationship)); break;
            case 'coreLegalIssues': if (reportData.coreLegalIssues?.length) docSections.push(createHeading(section.title), ...reportData.coreLegalIssues.map(issue => createListItem(issue))); break;
            case 'applicableLaws': if (reportData.applicableLaws?.length) { docSections.push(createHeading(section.title)); reportData.applicableLaws.forEach(law => { docSections.push(createSubHeading(law.documentName)); law.articles.forEach(article => { docSections.push(createListItem(`${article.articleNumber}: ${article.summary}`)); }); }); } break;
            case 'gapAnalysis': if (reportData.gapAnalysis) docSections.push( createHeading(section.title), createSubHeading("Thông tin / Chứng cứ còn thiếu:"), ...reportData.gapAnalysis.missingInformation.map(item => createListItem(item)), createSubHeading("Hành động đề xuất:"), ...reportData.gapAnalysis.recommendedActions.map(item => createListItem(item)) ); break;
            case 'caseProspects': if (reportData.caseProspects) docSections.push( createHeading(section.title), createSubHeading("Điểm mạnh:"), ...reportData.caseProspects.strengths.map(item => createListItem(item)), createSubHeading("Điểm yếu:"), ...reportData.caseProspects.weaknesses.map(item => createListItem(item)), createSubHeading("Rủi ro:"), ...reportData.caseProspects.risks.map(item => createListItem(item)) ); break;
            case 'proposedStrategy': if (reportData.proposedStrategy) docSections.push( createHeading(section.title), createSubHeading("Giai đoạn Tiền tố tụng:"), ...reportData.proposedStrategy.preLitigation.map(item => createListItem(item)), createSubHeading("Giai đoạn Tố tụng:"), ...reportData.proposedStrategy.litigation.map(item => createListItem(item)) ); break;
        }
    });
    const doc = new Document({ styles: { paragraphStyles: [{ id: "strongStyle", name: "Strong Style", basedOn: "Normal", next: "Normal", run: { bold: true }, }], }, sections: [{ children: docSections }] });
    Packer.toBlob(doc).then(blob => { const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link); });
  };
  const exportToXlsx = (reportData: AnalysisReport, fileName: string) => {
    if (typeof XLSX === 'undefined') { console.error("XLSX library not ready."); return; }
    const wb = XLSX.utils.book_new();
    const appendSheet = (title: string, data: any[][]) => { const ws = XLSX.utils.aoa_to_sheet(data); XLSX.utils.book_append_sheet(wb, ws, title); };
    if (reportData.customNotes) appendSheet("Ghi chú", [["Ghi chú Tùy chỉnh"], [reportData.customNotes]]);
    if (reportData.legalRelationship) appendSheet("Tổng quan", [["Quan hệ pháp luật", reportData.legalRelationship],["Vấn đề pháp lý cốt lõi", (reportData.coreLegalIssues || []).join('\n')]]);
    if (reportData.applicableLaws?.length) { const d = [["Văn bản", "Điều luật", "Nội dung"]]; reportData.applicableLaws.forEach(l => l.articles.forEach(a => d.push([l.documentName, a.articleNumber, a.summary]))); appendSheet("Cơ sở pháp lý", d); }
    if (reportData.gapAnalysis) { const d = [["Lỗ hổng thông tin", "Hành động đề xuất"]]; const max = Math.max(reportData.gapAnalysis.missingInformation.length, reportData.gapAnalysis.recommendedActions.length); for (let i = 0; i < max; i++) d.push([reportData.gapAnalysis.missingInformation[i] || '', reportData.gapAnalysis.recommendedActions[i] || '']); appendSheet("Phân tích Lỗ hổng", d); }
    if (reportData.caseProspects) { const d = [["Điểm mạnh", "Điểm yếu", "Rủi ro"]]; const max = Math.max(reportData.caseProspects.strengths.length, reportData.caseProspects.weaknesses.length, reportData.caseProspects.risks.length); for (let i = 0; i < max; i++) d.push([reportData.caseProspects.strengths[i] || '', reportData.caseProspects.weaknesses[i] || '', reportData.caseProspects.risks[i] || '']); appendSheet("Triển vọng Vụ việc", d); }
    if (reportData.proposedStrategy) { const d = [["Chiến lược Tiền tố tụng", "Chiến lược Tố tụng"]]; const max = Math.max(reportData.proposedStrategy.preLitigation.length, reportData.proposedStrategy.litigation.length); for (let i = 0; i < max; i++) d.push([reportData.proposedStrategy.preLitigation[i] || '', reportData.proposedStrategy.litigation[i] || '']); appendSheet("Chiến lược Đề xuất", d); }
    XLSX.writeFile(wb, fileName);
  };
  const exportToPdf = (fileName: string) => {
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') { setIsExporting(false); return; }
    const reportElement = document.getElementById('report-content');
    if (!reportElement) { setError("Could not find report content."); setIsExporting(false); return; }
    html2canvas(reportElement, { scale: 2, useCORS: true }).then((canvas) => { const imgData = canvas.toDataURL('image/png'); const { jsPDF } = jspdf; const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' }); const pdfWidth = pdf.internal.pageSize.getWidth(); const ratio = canvas.width / pdfWidth; const imgHeight = canvas.height / ratio; let heightLeft = imgHeight; let position = 0; pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); heightLeft -= pdf.internal.pageSize.getHeight(); while (heightLeft > 0) { position = heightLeft - imgHeight; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight); heightLeft -= pdf.internal.pageSize.getHeight(); } pdf.save(fileName); }).catch(err => { setError("Error creating PDF."); }).finally(() => { setIsExporting(false); setIsCustomizeModalOpen(false); if (originalReport) setReport(originalReport); });
  };

  const handleGenerateCaseDocument = useCallback(async (useSuggestion: boolean = false) => {
    const requestText = useSuggestion ? `Soạn thảo văn bản cho: "${suggestedDocRequest}"` : caseDocRequest;
    if (!report || !requestText.trim()) { setGenerationError("Vui lòng nhập yêu cầu."); return; }
    if (useSuggestion) setCaseDocRequest('');
    setGenerationError(null); setIsGeneratingDocument(true); setGeneratedDocument(null);
    try {
      setGeneratedDocument(await generateContextualDocument(report, requestText));
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Lỗi khi soạn thảo.");
    } finally {
      setIsGeneratingDocument(false);
    }
  }, [report, caseDocRequest, suggestedDocRequest]);

  const handleRefineText = async (field: RefineField, mode: RefineMode) => {
    const textToRefine = field === 'caseContent' ? caseContent : clientRequest;
    if (!textToRefine.trim()) { setRefineError({field, message: "Vui lòng nhập nội dung."}); return; }
    setRefiningField({ field, mode }); setRefineError(null);
    try {
      const refinedText = await refineText(textToRefine, mode);
      if (field === 'caseContent') setCaseContent(refinedText); else setClientRequest(refinedText);
    } catch (err) {
      setRefineError({field, message: err instanceof Error ? err.message : "Lỗi không xác định"});
    } finally {
      setRefiningField(null);
    }
  };
  
  const handleGenerateSummary = useCallback(async () => {
    if (!report) return;
    setIsSummarizing(true); setSummaryError(null);
    try {
        const summary = await generateReportSummary(report);
        const newReport = { ...report, quickSummary: summary };
        setReport(newReport); setOriginalReport(newReport);
    } catch (err) {
        setSummaryError(err instanceof Error ? err.message : "Lỗi khi tạo tóm tắt.");
    } finally {
        setIsSummarizing(false);
    }
  }, [report]);

  const handleClearSummary = () => {
    const clearSummary = (prev: AnalysisReport | null) => { if (!prev) return null; const { quickSummary, ...rest } = prev; return rest as AnalysisReport; };
    setReport(clearSummary); setOriginalReport(clearSummary);
  };

  const renderLitigationWorkflow = () => {
    const gridLayout = report ? isInputCollapsed ? 'lg:grid-cols-12' : 'lg:grid-cols-4' : 'lg:grid-cols-2';
    const inputColSpan = report ? isInputCollapsed ? 'lg:col-span-1' : 'lg:col-span-1' : 'lg:col-span-1';
    const outputColSpan = report ? isInputCollapsed ? 'lg:col-span-11' : 'lg:col-span-3' : 'lg:col-span-1';
    const currentStageOptions = litigationStagesByType[currentLitigationType] || [];
    const currentStageSuggestions = litigationStageSuggestions[currentLitigationStage];
    const showStageSuggestions = report && currentStageSuggestions && (currentStageSuggestions.actions.length > 0 || currentStageSuggestions.documents.length > 0);

    const handleTypeChange = (newType: LitigationType) => {
        setCurrentLitigationType(newType);
        setCurrentLitigationStage(litigationStagesByType[newType]?.[0]?.value || 'consulting');
    }

    const RefineButton: React.FC<{field: RefineField, mode: RefineMode, text: string}> = ({ field, mode, text }) => {
        const isLoading = refiningField?.field === field && refiningField?.mode === mode;
        return (<button onClick={() => handleRefineText(field, mode)} disabled={!!refiningField} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 text-blue-700 font-semibold rounded-full hover:bg-blue-100 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all" title={text}>
            {isLoading ? <Loader /> : <MagicIcon className="w-4 h-4" />}
            <span>{text}</span>
        </button>);
    };

    return (
      <div className="animate-fade-in">
        <div className="mb-6">
            <button onClick={() => { if (window.confirm("Bạn có chắc chắn muốn quay lại? Mọi dữ liệu chưa lưu sẽ bị mất.")) { handleGoBackToSelection(); } }} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                <BackIcon className="w-5 h-5" /> Quay lại Chọn Nghiệp vụ
            </button>
        </div>
        <div className={`grid grid-cols-1 ${gridLayout} gap-6 transition-all duration-500`}>
          <div className={`${inputColSpan} ${isInputCollapsed ? 'input-panel-collapsed' : 'input-panel-expanded'} border border-slate-200 rounded-xl bg-white soft-shadow`}>
            <div className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-200 rounded-t-xl">
              <h3 className="text-sm font-bold text-slate-700 truncate" title={activeCase?.name || 'Nhập liệu Vụ việc'}>{activeCase?.name ? `Vụ việc: ${activeCase.name}` : 'Nhập liệu Vụ việc'}</h3>
              <button onClick={() => setIsInputCollapsed(!isInputCollapsed)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-full ml-auto" title={isInputCollapsed ? "Mở rộng" : "Thu gọn"}>
                  {isInputCollapsed ? <PanelExpandIcon className="w-5 h-5" /> : <PanelCollapseIcon className="w-5 h-5" />}
              </button>
            </div>
            <div className="space-y-5 p-4">
              {activeCase && (
                  <div className="space-y-3 pb-5 border-b border-slate-200">
                      <div>
                          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Loại vụ việc:</label>
                          <div className="flex gap-2">
                              {(Object.keys(litigationStagesByType) as LitigationType[]).map(type => (
                                  <button key={type} onClick={() => handleTypeChange(type)} className={`flex-1 text-xs py-1.5 px-2 rounded-md border transition-colors ${currentLitigationType === type ? 'bg-blue-600 text-white font-semibold border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                                      {type === 'civil' ? 'Dân sự' : type === 'criminal' ? 'Hình sự' : 'Hành chính'}
                                  </button>
                              ))}
                          </div>
                      </div>
                       <div>
                          <label htmlFor="stage-select" className="text-xs font-medium text-slate-600 mb-1.5 block">Giai đoạn:</label>
                          <select id="stage-select" value={currentLitigationStage} onChange={(e) => setCurrentLitigationStage(e.target.value as LitigationStage)} className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                              {currentStageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                      </div>
                  </div>
              )}
              
              <div>
                <label className="block text-base font-semibold text-slate-800 mb-2">Tải lên Hồ sơ</label>
                <FileUpload files={files} setFiles={setFiles} onPreview={setPreviewingFile} />
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                  <label htmlFor="caseContent" className="block text-base font-semibold text-slate-800">Tóm tắt Nội dung</label>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RefineButton field="caseContent" mode="concise" text="Làm gọn" />
                    <RefineButton field="caseContent" mode="detailed" text="Chi tiết hóa" />
                  </div>
                </div>
                <textarea id="caseContent" value={caseContent} onChange={(e) => setCaseContent(e.target.value)} placeholder="Tóm tắt diễn biến, sự việc, các mốc thời gian quan trọng..." className="input-base w-full min-h-[120px] bg-white" rows={5}/>
                {refineError?.field === 'caseContent' && <p className="text-red-500 text-sm mt-1">{refineError.message}</p>}
              </div>

              <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center">
                    <label htmlFor="clientRequest" className="block text-base font-semibold text-slate-800">Yêu cầu Khách hàng</label>
                     <div className="flex items-center gap-2 flex-shrink-0">
                        <RefineButton field="clientRequest" mode="concise" text="Làm gọn" />
                        <RefineButton field="clientRequest" mode="detailed" text="Chi tiết hóa" />
                    </div>
                </div>
                <textarea id="clientRequest" value={clientRequest} onChange={(e) => setClientRequest(e.target.value)} placeholder="Khách hàng mong muốn đạt được điều gì? Ví dụ: Đòi lại tiền cọc..." className="input-base w-full min-h-[90px] bg-white" rows={3} />
                {refineError?.field === 'clientRequest' && <p className="text-red-500 text-sm mt-1">{refineError.message}</p>}
              </div>

              <div className="!mt-6 bg-blue-50 p-4 rounded-xl border-2 border-dashed border-blue-200 shadow-inner">
                <label htmlFor="mainQuery" className="block text-base font-bold text-blue-900 mb-2">Yêu cầu Chính cho AI</label>
                <p className="text-xs text-blue-800/80 mb-3">Đây là yêu cầu quan trọng nhất, quyết định hướng phân tích của AI.</p>
                <input id="mainQuery" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: Phân tích và đề xuất chiến lược khởi kiện" className="input-base w-full !p-3.5 !text-base !font-semibold !bg-white focus:!ring-blue-500" />
              </div>
              
              <div className="space-y-3 pt-5 border-t border-slate-200">
                  <div title={mainAction.disabled ? "Vui lòng tải lên hồ sơ hoặc tóm tắt nội dung, và nhập Yêu cầu Chính." : mainAction.text}>
                    <button onClick={handleMainActionClick} disabled={mainAction.disabled} className="btn btn-primary !text-xl !font-extrabold !py-4 w-full group !from-blue-500 !to-indigo-600 hover:!from-blue-600 hover:!to-indigo-700 !shadow-lg !shadow-blue-500/40 hover:!shadow-xl hover:!shadow-blue-500/50 !gap-3">
                      {isLoading ? <><Loader /><span>{mainAction.loadingText}</span></> : <><MagicIcon className="w-7 h-7 transition-transform group-hover:scale-110"/> <span>{mainAction.text}</span></>}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleSaveCase} disabled={isSaving} className="w-full flex items-center justify-center gap-2 py-2.5 px-2 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:bg-slate-300 transition-colors">{isSaving ? <Loader /> : <SaveCaseIcon className="w-4 h-4" />}Lưu Vụ việc</button>
                      <button onClick={() => setIsCaseListOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-2 bg-slate-100 text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors"><FolderIcon className="w-4 h-4" />Mở danh sách</button>
                  </div>
              </div>
              {error && <div className="mt-2"><Alert message={error} type="error" /></div>}
            </div>
          </div>

          <div className={`flex flex-col ${outputColSpan}`}>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-slate-800">Kết quả Phân tích</h3>
                {report && !isLoading && (<div className="flex items-center gap-2">
                    <button onClick={handleGenerateSummary} disabled={isSummarizing} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:bg-slate-200">{isSummarizing ? <Loader /> : <MagicIcon className="w-4 h-4" />}Tóm tắt</button>
                    <button onClick={() => setIsCustomizeModalOpen(true)} disabled={isExporting || !libsReady} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400">{!libsReady ? <Loader /> : <ExportIcon className="w-4 h-4" />}{!libsReady ? "Tải..." : "Xuất"}</button>
                </div>)}
            </div>
            {summaryError && <Alert message={summaryError} type="error" />}
            <div className="flex-grow rounded-xl bg-white border border-slate-200 p-6 overflow-y-auto min-h-[85vh] soft-shadow">
              {isLoading && (<div className="flex flex-col items-center justify-center h-full text-slate-500"><Loader /><p className="mt-4 text-base">{mainAction.loadingText}</p></div>)}
              {!isLoading && !report && !generatedDocument && (<div className="flex flex-col items-center justify-center h-full text-center text-slate-400"><AnalysisIcon className="w-20 h-20 mb-4 text-slate-300" /><p className="text-lg font-medium text-slate-600">Báo cáo phân tích sẽ xuất hiện ở đây.</p></div>)}
              {report && (<div className="animate-fade-in">
                  <ReportDisplay 
                    report={report} 
                    files={files} 
                    onPreview={setPreviewingFile} 
                    onClearSummary={handleClearSummary}
                    litigationType={currentLitigationType}
                  />
                  {showStageSuggestions && (
                    <div className="mt-8 pt-6 border-t-2 border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">Gợi ý cho GĐ: {getStageLabel(currentLitigationType, currentLitigationStage)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
                        <div>
                          <h4 className="font-semibold mb-2">Hành động đề xuất:</h4>
                          <ul className="list-disc list-inside space-y-1.5 text-sm">{currentStageSuggestions.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Văn bản cần soạn thảo:</h4>
                          <div className="flex flex-col items-start gap-2">{currentStageSuggestions.documents.map((d, i) => (<button key={i} onClick={() => handleDocSuggestionClick(d)} className="text-left w-full p-2 bg-blue-100 text-blue-800 font-medium rounded-md hover:bg-blue-200 text-sm flex items-center gap-2"><PlusIcon className="w-4 h-4 shrink-0" />{d}</button>))}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div id="generation-section" className="mt-8 pt-6 border-t-2 border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Soạn thảo Văn bản theo Bối cảnh</h3>
                    {suggestedDocRequest && (<div className="mb-4"><button onClick={() => handleGenerateCaseDocument(true)} disabled={isGeneratingDocument} className="w-full text-left p-3 bg-blue-50 border-2 border-dashed border-blue-200 text-blue-800 font-semibold rounded-lg hover:bg-blue-100 flex items-center justify-between"><span className="flex items-center gap-2"><MagicIcon className="w-5 h-5"/><span>{`Gợi ý: "${suggestedDocRequest}"`}</span></span>{isGeneratingDocument && caseDocRequest === '' && <Loader />}</button></div>)}
                    <div className="flex gap-2">
                      <input type="text" value={caseDocRequest} onChange={(e) => setCaseDocRequest(e.target.value)} placeholder="Ví dụ: Soạn Đơn khởi kiện" className="input-base flex-grow" />
                      <button onClick={() => handleGenerateCaseDocument(false)} disabled={isGeneratingDocument || !caseDocRequest} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-slate-300">{isGeneratingDocument && caseDocRequest !== '' ? 'Soạn...' : "Soạn thảo"}</button>
                    </div>
                    {generationError && <div className="mt-2"><Alert message={generationError} type="error" /></div>}
                  </div>
              </div>)}
              {generatedDocument && (<div className="mt-4 animate-fade-in"><h4 className="text-lg font-semibold mb-2">Văn bản đã soạn:</h4><pre className="whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-lg border">{generatedDocument}</pre></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderWelcomeScreen = () => (
    <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-slate-800">Chào mừng đến với Trợ lý Pháp lý</h2>
        <p className="text-slate-600 mt-2 mb-8">Vui lòng bắt đầu bằng cách tạo một vụ việc mới hoặc mở một vụ việc đã có.</p>
        <div className="flex justify-center gap-4">
            <button onClick={() => setIsWorkflowSelectorOpen(true)} className="flex items-center justify-center gap-2 py-2 px-5 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700"><PlusIcon className="w-5 h-5" />Vụ việc Mới</button>
            <button onClick={() => setIsCaseListOpen(true)} className="flex items-center justify-center gap-2 py-2 px-5 bg-slate-200 text-slate-800 text-base font-semibold rounded-lg hover:bg-slate-300"><FolderIcon className="w-5 h-5" />Mở danh sách</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 pb-4 border-b border-slate-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Trợ lý của LS Hồng Vân</h1>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">Phân tích hồ sơ, xây dựng chiến lược, soạn thảo văn bản và quản lý vụ việc.</p>
        </header>
        <main className="mt-0 p-6 sm:p-8 bg-white rounded-xl border border-slate-200 soft-shadow-lg">
            {!activeCase && renderWelcomeScreen()}
            {activeCase?.workflowType === 'litigation' && renderLitigationWorkflow()}
            {activeCase?.workflowType === 'consulting' && <ConsultingWorkflow onPreview={setPreviewingFile} onGoBack={handleGoBackToSelection} activeCase={activeCase} onCasesUpdated={loadData} />}
        </main>
      </div>

       <PreviewModal file={previewingFile} onClose={() => setPreviewingFile(null)} />

       {isProcessing && activeCase?.workflowType === 'litigation' && (<ProcessingProgress files={files} onRetry={handleRetryFile} onCancel={handleCancelProcessing} onContinue={handleContinueAnalysis} isFinished={isPreprocessingFinished} hasTextContent={caseContent.trim().length > 0 || clientRequest.trim().length > 0}/>)}
       
       {isWorkflowSelectorOpen && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-11/12 max-w-lg text-center soft-shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Chọn loại Nghiệp vụ</h3>
                    <p className="text-slate-600 mb-8">Chọn một luồng công việc phù hợp với nhu cầu.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button onClick={() => startNewWorkflow('litigation')} className="p-6 border rounded-lg hover:bg-blue-50 hover:border-blue-400 text-left">
                            <h4 className="font-bold text-blue-700">Vụ việc Tranh tụng</h4>
                            <p className="text-sm text-slate-500 mt-2">Phân tích sâu, quản lý theo giai đoạn cho các vụ việc phức tạp.</p>
                        </button>
                        <button onClick={() => startNewWorkflow('consulting')} className="p-6 border rounded-lg hover:bg-green-50 hover:border-green-400 text-left">
                            <h4 className="font-bold text-green-700">Nhiệm vụ Tư vấn</h4>
                            <p className="text-sm text-slate-500 mt-2">Soạn thảo nhanh thư tư vấn hoặc các văn bản đơn lẻ khác.</p>
                        </button>
                    </div>
                     <button onClick={() => setIsWorkflowSelectorOpen(false)} className="mt-8 text-sm text-slate-500 hover:text-slate-800">Hủy</button>
                </div>
           </div>
       )}

       {isCaseListOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-11/12 max-w-3xl flex flex-col max-h-[85vh] soft-shadow-lg">
                    <div className="flex justify-between items-center pb-4 border-b">
                        <h3 className="text-xl font-bold">Danh sách Vụ việc đã lưu</h3>
                        <button onClick={() => setIsCaseListOpen(false)} className="text-slate-400 hover:text-red-600 text-3xl p-1 leading-none">&times;</button>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm..." className="input-base w-full p-2.5 my-4" />
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
                       {filteredCases.length > 0 ? filteredCases.map(c => (
                           <div key={c.id} className="p-3 bg-white border rounded-lg flex justify-between items-center gap-4 hover:border-blue-400 hover:bg-slate-50/50">
                               <div>
                                   <p className="font-semibold text-blue-700 truncate">{c.name}</p>
                                   <div className="flex items-center gap-3 mt-1.5">
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${c.litigationType === 'criminal' ? 'bg-red-100 text-red-800 border-red-200' : c.litigationType === 'administrative' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-sky-100 text-sky-800 border-sky-200'}`}>
                                          {c.litigationType === 'civil' ? 'Dân sự' : c.litigationType === 'criminal' ? 'Hình sự' : 'Hành chính'}
                                      </span>
                                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.workflowType === 'consulting' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                          {c.workflowType === 'consulting' ? 'Tư vấn' : getStageLabel(c.litigationType, c.litigationStage)}
                                      </span>
                                      <p className="text-xs text-slate-500">Cập nhật: {new Date(c.updatedAt || c.createdAt).toLocaleString('vi-VN')}</p>
                                   </div>
                               </div>
                               <div className="flex-shrink-0 flex items-center gap-2">
                                   <button onClick={() => handleLoadCase(c)} className="px-4 py-1.5 text-sm bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Mở</button>
                                   <button onClick={() => handleDeleteCase(c.id)} className="p-2 text-slate-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                               </div>
                           </div>
                       )) : (<p className="text-center text-slate-500 py-12">Không tìm thấy vụ việc nào.</p>)}
                    </div>
                </div>
            </div>
       )}

       {report && <CustomizeReportModal isOpen={isCustomizeModalOpen} onClose={() => setIsCustomizeModalOpen(false)} onExport={handleFinalExport} baseReport={report} isExporting={isExporting} libsReady={libsReady} />}
    </div>
  );
};

export default App;
