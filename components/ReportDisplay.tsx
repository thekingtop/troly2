


import React, { useState } from 'react';
import type { AnalysisReport, ApplicableLaw, LawArticle, UploadedFile } from '../types';
import { MagicIcon } from './icons/MagicIcon';
import { explainLaw } from '../services/geminiService';
import { Loader } from './Loader';
import { SearchIcon } from './icons/SearchIcon';

interface ReportDisplayProps {
  report: AnalysisReport;
  files: UploadedFile[];
  onPreview: (file: UploadedFile) => void;
  onClearSummary: () => void;
}

const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) {
        return <>{text}</>;
    }
    // Escape special characters for regex
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 text-yellow-900 px-0.5 rounded-sm">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </>
    );
});


const Section: React.FC<{ title: string; children: React.ReactNode; id?: string; highlightTerm: string; }> = ({ title, children, id, highlightTerm }) => (
  <div id={id} className="mb-8">
    <h3 className="text-lg font-semibold text-slate-900 border-b-2 border-slate-100 pb-2 mb-4">
        <HighlightedText text={title} term={highlightTerm} />
    </h3>
    <div className="space-y-3 text-slate-700">
      {children}
    </div>
  </div>
);

const BulletList: React.FC<{ items: string[]; title: string; highlightTerm: string; }> = ({ items, title, highlightTerm }) => (
  <div>
      <h4 className="font-semibold text-slate-800"><HighlightedText text={title} term={highlightTerm} />:</h4>
      <ul className="list-disc list-inside mt-1 space-y-1 pl-1">
          {items.map((item, index) => <li key={index}><HighlightedText text={item} term={highlightTerm} /></li>)}
      </ul>
  </div>
);


export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onClearSummary }) => {
  const [explanation, setExplanation] = useState<{
    law: string;
    content: string;
    isLoading: boolean;
    error: string | null;
    rect: DOMRect | null;
  } | null>(null);
  const [highlightTerm, setHighlightTerm] = useState('');

  const handleLawClick = async (law: ApplicableLaw, article: LawArticle, event: React.MouseEvent<HTMLButtonElement>) => {
    const lawText = `${article.articleNumber} ${law.documentName}`;
    if (explanation?.law === lawText) {
      setExplanation(null);
      return;
    }

    const buttonRect = event.currentTarget.getBoundingClientRect();
    setExplanation({
      law: lawText,
      content: '',
      isLoading: true,
      error: null,
      rect: buttonRect,
    });

    try {
      const result = await explainLaw(lawText);
      setExplanation(prev => (prev?.law === lawText ? { ...prev, content: result, isLoading: false } : prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định.';
      setExplanation(prev => (prev?.law === lawText ? { ...prev, error: errorMessage, isLoading: false } : prev));
    }
  };

  return (
    <div id="report-content" className="animate-fade-in">
      <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
              type="text"
              value={highlightTerm}
              onChange={(e) => setHighlightTerm(e.target.value)}
              placeholder="Tìm kiếm và tô sáng nội dung trong báo cáo..."
              aria-label="Tìm kiếm trong báo cáo"
              className="w-full py-2 pl-10 pr-10 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          {highlightTerm && (
              <button
                  onClick={() => setHighlightTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa tìm kiếm"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
          )}
      </div>

      {report.quickSummary && (
        <div className="mb-8 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg relative animate-fade-in-down shadow-md shadow-blue-500/10">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <MagicIcon className="w-6 h-6 text-blue-600" />
                    <HighlightedText text="Tóm tắt Nhanh" term={highlightTerm} />
                </h3>
                 <button 
                    onClick={onClearSummary} 
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100/50"
                    title="Ẩn tóm tắt"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                     </svg>
                 </button>
            </div>
            <p className="text-slate-800 whitespace-pre-wrap ml-8"><HighlightedText text={report.quickSummary} term={highlightTerm} /></p>
        </div>
      )}

      {report.customNotes && (
        <Section title="Ghi chú Tùy chỉnh" id="customNotesSection" highlightTerm={highlightTerm}>
          <p className="whitespace-pre-wrap bg-yellow-50 border-l-4 border-yellow-300 p-4 text-slate-800 rounded-md"><HighlightedText text={report.customNotes} term={highlightTerm} /></p>
        </Section>
      )}

      {report.legalRelationship && (
        <Section title="1. Quan hệ pháp luật" id="legalRelationship" highlightTerm={highlightTerm}>
          <p><HighlightedText text={report.legalRelationship} term={highlightTerm} /></p>
        </Section>
      )}

      {report.coreLegalIssues && report.coreLegalIssues.length > 0 && (
         <Section title="2. Vấn đề pháp lý cốt lõi" id="coreLegalIssues" highlightTerm={highlightTerm}>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
                {report.coreLegalIssues.map((issue, index) => (
                    <li key={index}><HighlightedText text={issue} term={highlightTerm} /></li>
                ))}
            </ul>
        </Section>
      )}

      {report.applicableLaws && report.applicableLaws.length > 0 && (
        <Section title="3. Cơ sở pháp lý áp dụng" id="applicableLaws" highlightTerm={highlightTerm}>
          <div className="space-y-4">
            {report.applicableLaws.map((law, lawIndex) => (
              <div key={lawIndex} className="p-3 bg-slate-50/70 border border-slate-200 rounded-md">
                  <h4 className="font-semibold text-slate-800"><HighlightedText text={law.documentName} term={highlightTerm} /></h4>
                  <ul className="list-disc list-inside space-y-1.5 pl-4 mt-2">
                    {law.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <button
                          onClick={(e) => handleLawClick(law, article, e)}
                          className="text-left text-blue-600 underline decoration-dotted underline-offset-4 hover:text-blue-700 hover:decoration-solid transition-colors"
                          aria-label={`Giải thích ${article.articleNumber} ${law.documentName}`}
                        >
                          <strong className="font-semibold"><HighlightedText text={article.articleNumber} term={highlightTerm} />:</strong>
                        </button>
                        <span className="ml-2 text-slate-700"><HighlightedText text={article.summary} term={highlightTerm} /></span>
                      </li>
                    ))}
                  </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.gapAnalysis && (
        <Section title="4. Phân tích Lỗ hổng & Hành động Đề xuất" id="gapAnalysis" highlightTerm={highlightTerm}>
          <div className="flex flex-col gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BulletList title="Thông tin / Chứng cứ còn thiếu" items={report.gapAnalysis.missingInformation} highlightTerm={highlightTerm} />
                <BulletList title="Hành động đề xuất" items={report.gapAnalysis.recommendedActions} highlightTerm={highlightTerm} />
              </div>
              {report.gapAnalysis.legalLoopholes && report.gapAnalysis.legalLoopholes.length > 0 && (
                <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-lg">
                   <BulletList title="Lỗ hổng pháp lý tiềm ẩn" items={report.gapAnalysis.legalLoopholes} highlightTerm={highlightTerm} />
                </div>
              )}
          </div>
        </Section>
      )}

      {report.caseProspects && (
        <Section title="5. Đánh giá Triển vọng Vụ việc" id="caseProspects" highlightTerm={highlightTerm}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <BulletList title="Điểm mạnh" items={report.caseProspects.strengths} highlightTerm={highlightTerm} />
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                     <BulletList title="Điểm yếu" items={report.caseProspects.weaknesses} highlightTerm={highlightTerm} />
                </div>
                 <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                     <BulletList title="Rủi ro" items={report.caseProspects.risks} highlightTerm={highlightTerm} />
                </div>
           </div>
        </Section>
      )}
      
      {report.proposedStrategy && (
        <Section title="6. Đề xuất Lộ trình & Chiến lược" id="proposedStrategy" highlightTerm={highlightTerm}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200">
                  <BulletList title="Giai đoạn Tiền tố tụng" items={report.proposedStrategy.preLitigation} highlightTerm={highlightTerm} />
              </div>
               <div className="bg-blue-50/70 p-4 rounded-lg border border-blue-200">
                  <BulletList title="Giai đoạn Tố tụng" items={report.proposedStrategy.litigation} highlightTerm={highlightTerm} />
              </div>
          </div>
        </Section>
      )}
      
      {explanation && (
        <div
            style={{
                top: explanation.rect ? window.scrollY + explanation.rect.bottom + 8 : 0,
                left: explanation.rect ? explanation.rect.left : 0,
                maxWidth: '400px',
            }}
            className="fixed z-50 p-4 bg-white rounded-lg shadow-xl border border-slate-200 animate-fade-in-down w-full"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                <h4 className="font-semibold text-slate-800 text-sm truncate pr-2">Giải thích: {explanation.law}</h4>
                <button 
                    onClick={() => setExplanation(null)} 
                    className="text-slate-400 hover:text-red-600 text-2xl leading-none"
                    aria-label="Đóng"
                >&times;</button>
            </div>
            <div className="min-h-[40px]">
                {explanation.isLoading && (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Loader />
                        <span>AI đang phân tích...</span>
                    </div>
                )}
                {explanation.error && <p className="text-red-600 text-sm">{explanation.error}</p>}
                {explanation.content && <p className="text-slate-700 text-sm whitespace-pre-wrap">{explanation.content}</p>}
            </div>
        </div>
      )}
    </div>
  );
};