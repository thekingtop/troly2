


export type FileCategory = 'Uncategorized' | 'Contract' | 'Correspondence' | 'Minutes' | 'Evidence' | 'Image';

export interface UploadedFile {
    id: string;
    file: File;
    preview: string | null; 
    category: FileCategory;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
}

export type DocType = '' | 'legalServiceContract' | 'demandLetter' | 'powerOfAttorney' | 'meetingMinutes' | 'lawsuit' | 'evidenceList' | 'civilMatterPetition' | 'statement' | 'appeal' | 'civilContract' | 'businessRegistration' | 'divorcePetition' | 'will' | 'enforcementPetition' | 'complaint' | 'reviewPetition' | 'inheritanceWaiver';

// A single, flexible interface for all form data
export interface FormData {
    [key: string]: string | undefined;
}

// --- New Analysis Report Structure ---

export interface LawArticle {
    articleNumber: string;
    summary: string;
}

export interface ApplicableLaw {
    documentName: string;
    articles: LawArticle[];
}

export interface GapAnalysis {
    missingInformation: string[];
    recommendedActions: string[];
    legalLoopholes: string[];
}

export interface CaseProspects {
    strengths: string[];
    weaknesses: string[];
    risks: string[];
}

export interface ProposedStrategy {
    preLitigation: string[];
    litigation: string[];
}

export interface AnalysisReport {
  legalRelationship: string;
  coreLegalIssues: string[];
  applicableLaws: ApplicableLaw[];
  gapAnalysis: GapAnalysis;
  caseProspects: CaseProspects;
  proposedStrategy: ProposedStrategy;
  customNotes?: string;
  quickSummary?: string;
}

// --- Types for Case Management ---

export type LitigationType = 'civil' | 'criminal' | 'administrative';
export type LitigationStage = string; // Now a generic string to accommodate dynamic stages

export interface SerializableFile {
    name: string;
    type: string;
    content: string; // base64 encoded string
}

export interface SavedCase {
    id: string;
    name: string;
    workflowType: 'consulting' | 'litigation';
    caseContent: string;
    clientRequest: string;
    query: string;
    files: SerializableFile[];
    createdAt: string;
    // --- New contextual fields ---
    updatedAt: string;
    litigationType: LitigationType | null; // Can be null for consulting cases
    litigationStage: LitigationStage;
    analysisReport: AnalysisReport | null;
    // --- New fields for consulting workflow ---
    extractedData?: Record<string, string> | null;
    generatedText?: string;
}