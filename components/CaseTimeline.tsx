import React from 'react';
import type { CaseTimelineEvent } from '../types.ts';

// --- Icon Components for Event Types ---
const ContractIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);
const PaymentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 1 0 9 0Z M16.5 18.75h-9a9 9 0 1 1 9 0ZM12 12.75V18m0-12.75v-.008" />
    </svg>
);
const OtherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
);

const eventMeta: Record<CaseTimelineEvent['eventType'], { icon: React.ReactNode; color: string; }> = {
    Contract: { icon: <ContractIcon className="w-5 h-5"/>, color: 'border-purple-500' },
    Payment: { icon: <PaymentIcon className="w-5 h-5"/>, color: 'border-green-500' },
    Communication: { icon: <CommunicationIcon className="w-5 h-5"/>, color: 'border-blue-500' },
    LegalAction: { icon: <LegalActionIcon className="w-5 h-5"/>, color: 'border-red-500' },
    Milestone: { icon: <MilestoneIcon className="w-5 h-5"/>, color: 'border-amber-500' },
    Other: { icon: <OtherIcon className="w-5 h-5"/>, color: 'border-slate-500' },
};

const HighlightedText: React.FC<{ text: string | undefined; term: string }> = React.memo(({ text, term }) => {
    if (!term.trim() || !text) return <>{text}</>;
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <mark key={i} className="bg-yellow-300 text-yellow-900 px-0.5 rounded-sm">{part}</mark> : <React.Fragment key={i}>{part}</React.Fragment>
            )}
        </>
    );
});


const TimelineEventCard: React.FC<{ event: CaseTimelineEvent; isLeft: boolean; highlightTerm: string }> = ({ event, isLeft, highlightTerm }) => {
    const { icon, color } = eventMeta[event.eventType] || eventMeta.Other;
    
    const significanceClasses: Record<CaseTimelineEvent['significance'], string> = {
        High: 'bg-red-100 text-red-800 border-red-200',
        Medium: 'bg-amber-100 text-amber-800 border-amber-200',
        Low: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    const cardPosition = isLeft ? 'text-right' : 'text-left';

    return (
        <div className={`w-[calc(50%-1.25rem)] mb-8 flex flex-col items-stretch ${isLeft ? 'self-start' : 'self-end'}`}>
             <div className="relative p-4 bg-white border rounded-lg soft-shadow">
                <div className={`absolute top-3 ${isLeft ? 'right-3' : 'left-3'}`}>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${significanceClasses[event.significance]}`}>
                        <HighlightedText text={event.significance} term={highlightTerm} />
                    </span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 ${color}`}>
                        {icon}
                    </span>
                    <time className="font-bold text-slate-800 text-base">
                        <HighlightedText text={event.date} term={highlightTerm} />
                    </time>
                </div>
                <p className="text-sm text-slate-700 my-2">
                    <HighlightedText text={event.description} term={highlightTerm} />
                </p>
                <p className="text-xs text-slate-500 italic mt-2">
                    Nguồn: <HighlightedText text={event.sourceDocument} term={highlightTerm} />
                </p>
                <div className={`absolute top-1/2 -mt-2 w-4 h-4 bg-white border transform rotate-45 ${isLeft ? 'right-[-8.5px] border-t border-r' : 'left-[-8.5px] border-b border-l'}`}></div>
            </div>
        </div>
    );
};


export const CaseTimeline: React.FC<{ events: CaseTimelineEvent[]; highlightTerm: string }> = ({ events, highlightTerm }) => {
    if (!events || events.length === 0) {
        return <p className="text-slate-500 text-center py-4">Không có sự kiện nào được tìm thấy trong dòng thời gian.</p>;
    }
    
    // Sort events by date just in case they aren't already
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="relative wrap p-4">
            <div className="absolute left-1/2 -translate-x-1/2 h-full border-2 border-slate-200 border-dashed rounded-full"></div>
            <div className="flex flex-col items-stretch">
                {sortedEvents.map((event, index) => (
                    <TimelineEventCard
                        key={index}
                        event={event}
                        isLeft={index % 2 === 0}
                        highlightTerm={highlightTerm}
                    />
                ))}
            </div>
        </div>
    );
};