import React from 'react';
import type { AnalysisReport } from '../types.ts';

const ReportSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200/80 soft-shadow">
        <h4 className="text-base font-bold text-slate-800 mb-3">{title}</h4>
        <div className="text-sm text-slate-700 space-y-3">{children}</div>
    </div>
);

const DetailRow: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="py-2 border-b border-slate-200/60 last:border-b-0">
            <span className="font-semibold text-slate-600">{label}:</span>
            <span className="ml-2 text-slate-800">{value}</span>
        </div>
    );
};

export const FamilyLawInfoDisplay: React.FC<{ report: AnalysisReport }> = ({ report }) => {
    const { familyLawInfo } = report;

    if (!familyLawInfo) {
        return null;
    }

    const hasData = Object.values(familyLawInfo).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined && value !== '';
    });

    if (!hasData) {
        return null;
    }

    return (
        <ReportSection title="Thông tin Vụ việc Hôn nhân & Gia đình">
             <div className="flex items-center gap-2 mb-4 p-2 bg-rose-50 border border-rose-200 rounded-md">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-xs font-bold text-rose-800">Chế độ Phân tích: Hôn nhân & Gia đình</span>
            </div>

            <DetailRow label="Phân loại" value={familyLawInfo.divorceType} />
            <DetailRow label="Thông tin Đăng ký Kết hôn" value={familyLawInfo.marriageInfo} />
            
            {familyLawInfo.commonChildren && familyLawInfo.commonChildren.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 mt-2">Về con chung:</h5>
                    <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                        {familyLawInfo.commonChildren.map((child, index) => (
                            <li key={index}>
                                {child.name} (Sinh ngày: {child.dob}). Yêu cầu nuôi con: {child.requestedCustody}. Yêu cầu cấp dưỡng: {child.requestedSupport}.
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {familyLawInfo.commonProperty && familyLawInfo.commonProperty.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 mt-2">Về tài sản chung:</h5>
                    <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                         {familyLawInfo.commonProperty.map((prop, index) => (
                            <li key={index}>
                                {prop.name} {prop.value ? `(Giá trị: ${prop.value})` : ''}. Đề xuất phân chia: {prop.proposedDivision}.
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {familyLawInfo.commonDebt && familyLawInfo.commonDebt.length > 0 && (
                <div>
                    <h5 className="font-semibold text-slate-700 mt-2">Về nợ chung:</h5>
                    <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                         {familyLawInfo.commonDebt.map((debt, index) => (
                            <li key={index}>
                                {debt.name} {debt.value ? `(Giá trị: ${debt.value})` : ''}. Đề xuất phân chia: {debt.proposedDivision}.
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </ReportSection>
    );
};