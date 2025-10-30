import React, { useRef, useState } from 'react';
import type { CaseTimelineEvent } from '../types.ts';

// --- Icon Components for Event Types ---
const ContractIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const PaymentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125h16.5c.621 0 1.125.504 1.125 1.125v.375m-18 0h18M12 12.75h.008v.008H12v-.008Zm0 3h.008v.008H12v-.008Zm-3-3h.008v.008H9v-.008Zm0 3h.008v.008H9v-.008Zm-3-3h.008v.008H6v-.008Zm0 3h.008v.008H6v-.008Zm9-3h.008v.008H15v-.008Zm0 3h.008v.008H15v-.008Z" />
    </svg>
);
const CommunicationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);
const LegalActionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-3.5-16.5v16.5m-3.5-16.5v16.5m0 0C5.116 20.507 3 19.742 3 18.25V8.75c0-1.492 2.116-2.257 4.5-2.257m0 11.75c2.384 0 4.5-.765 4.5-2.257V8.75C12 7.258 9.884 6.5 7.5 6.5m0 11.75 4.5-11.75" />
    </svg>
);
const MilestoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 1 0-2.636 6.364M16.5 12V8.25" />
    </svg>
);
const OtherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);

const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) {
        return <>{text}</>;
    }
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-yellow-300 text-yellow-900 px-0.5 rounded-sm">{part}</mark>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                )
            )}
        </>
    );
});

const getEventMeta = (type: CaseTimelineEvent['eventType']) => {
    switch (type) {
        case 'Contract': return { icon: <ContractIcon className="w-5 h-5" />, color: 'bg-indigo-500' };
        case 'Payment': return { icon: <PaymentIcon className="w-5 h-5" />, color: 'bg-green-500' };
        case 'Communication': return { icon: <CommunicationIcon className="w-5 h-5" />, color: 'bg-sky-500' };
        case 'LegalAction': return { icon: <LegalActionIcon className="w-5 h-5" />, color: 'bg-red-500' };
        case 'Milestone': return { icon: <MilestoneIcon className="w-5 h-5" />, color: 'bg-amber-500' };
        default: return { icon: <OtherIcon className="w-5 h-5" />, color: 'bg-slate-500' };
    }
};

const getSignificanceClasses = (significance: CaseTimelineEvent['significance']) => {
    switch (significance) {
        case 'High': return 'border-red-500 bg-red-50';
        case 'Medium': return 'border-amber-500 bg-amber-50';
        case 'Low': return 'border-slate-400 bg-slate-50';
        default: return 'border-slate-400 bg-slate-50';
    }
};

interface CaseTimelineProps {
  events: CaseTimelineEvent[];
  highlightTerm: string;
  onUpdateEvents: (updatedEvents: CaseTimelineEvent[]) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({ events, highlightTerm, onUpdateEvents }) => {
  const dragItem = useRef<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItemIndex === null || dragItem.current === dragOverItemIndex) return;
    
    const eventsCopy = [...events];
    const draggedItemContent = eventsCopy.splice(dragItem.current, 1)[0];
    eventsCopy.splice(dragOverItemIndex, 0, draggedItemContent);
    
    dragItem.current = null;
    
    onUpdateEvents(eventsCopy);
  };

  return (
    <div className="relative pl-8" onDragLeave={() => setDragOverItemIndex(null)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
      {events.map((event, index) => {
        const meta = getEventMeta(event.eventType);
        const significanceClasses = getSignificanceClasses(event.significance);
        const isItemDragging = draggedItemIndex === index;
        const isDragOver = dragOverItemIndex === index;
        const itemClasses = `relative mb-6 p-4 rounded-lg cursor-grab active:cursor-grabbing border-l-4 transition-all duration-200 ${significanceClasses} ${isItemDragging ? 'dragging' : ''} ${isDragOver ? 'drag-placeholder' : ''}`;

        return (
          <div 
            key={`${event.date}-${index}`}
            draggable
            onDragStart={() => {
              dragItem.current = index;
              setDraggedItemIndex(index);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOverItemIndex(index);
            }}
            onDragEnd={() => {
              handleSort();
              setDraggedItemIndex(null);
              setDragOverItemIndex(null);
            }}
            onDragOver={(e) => e.preventDefault()}
            className={itemClasses}
          >
            <div className={`absolute -left-[34px] top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full text-white ${meta.color}`}>
              {meta.icon}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  <HighlightedText text={event.date} term={highlightTerm} />
                </p>
                <p className="text-slate-700 mt-1">
                  <HighlightedText text={event.description} term={highlightTerm} />
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                <HighlightedText text={event.eventType} term={highlightTerm} />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <span className="font-semibold">Nguồn:</span> <HighlightedText text={event.sourceDocument} term={highlightTerm} />
            </p>
          </div>
        );
      })}
    </div>
  );
};
