export type FileCategory = 'Uncategorized' | 'Contract' | 'Correspondence' | 'Minutes' | 'Evidence' | 'Image';

export interface UploadedFile {
    id: string;
    file: File;
    preview: string | null; 
    category: FileCategory;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
}

export type DocType = '' | 'legalServiceContract' | 'demandLetter' | 'powerOfAttorney' | 'meetingMinutes' | 'lawsuit' | 'evidenceList' | 'civilMatterPetition' | 'statement' | 'appeal' | 'civilContract' | 'businessRegistration' | 'divorcePetition' | 'will' | 'enforcementPetition' | 'complaint' | 'reviewPetition' | 'inheritanceWaiver' | 'statementOfOpinion';

// A single, flexible interface for all form data
export interface FormData {
    [key: string]: string | undefined;
}

export interface ParagraphGenerationOptions {
  tone: 'assertive' | 'persuasive' | 'formal' | 'conciliatory' | 'warning';
  terminology: 'legal' | 'plain';
  detail: 'concise' | 'detailed';
  outputFormat: 'text' | 'markdown';
}

// --- New Analysis Report Structure ---

export interface LawArticle {
    articleNumber: string;
    summary: string;
}

export interface ApplicableLaw {
    documentName: string;
    coreIssueAddressed?: string; // Analysis of the main issue the law covers.
    relevanceToCase?: string;    // How this law applies to the current case.
    articles: LawArticle[];
}

export interface LegalLoophole {
    classification: 'Hợp đồng' | 'Quy phạm Pháp luật' | 'Tố tụng' | 'Khác';
    description: string;
    severity: 'Cao' | 'Trung bình' | 'Thấp';
    suggestion: string;
    evidence: string; // The text snippet from the document
}

export interface GapAnalysis {
    missingInformation: string[];
    recommendedActions: string[];
    legalLoopholes: LegalLoophole[];
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

export interface ProceduralStatus {
  partyName: string;
  status: string; // e.g., 'Nguyên đơn', 'Bị đơn'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CaseTimelineEvent {
    date: string; // YYYY-MM-DD
    description: string;
    sourceDocument: string;
    eventType: 'Contract' | 'Payment' | 'Communication' | 'LegalAction' | 'Milestone' | 'Other';
    significance: 'High' | 'Medium' | 'Low';
}

// --- Argument Map Types ---
export type ArgumentNodeType = 
  | 'legalIssue'
  | 'strength'
  | 'weakness'
  | 'risk'
  | 'timelineEvent'
  | 'applicableLaw'
  | 'loophole'
  | 'custom';

export interface ArgumentNode {
  id: string;
  type: ArgumentNodeType;
  label: string; // Short title, e.g., "Legal Issue 1", "Strength 3"
  content: string; // The full text of the item
  position: { x: number; y: number };
  chatHistory?: ChatMessage[];
}

export interface ArgumentEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
}

export interface ArgumentGraph {
  nodes: ArgumentNode[];
  edges: ArgumentEdge[];
}

export interface AnalysisReport {
  editableCaseSummary?: string;
  caseTimeline: CaseTimelineEvent[];
  litigationStage: LitigationStage;
  proceduralStatus: ProceduralStatus[];
  legalRelationship: string;
  coreLegalIssues: string[];
  applicableLaws: ApplicableLaw[];
  gapAnalysis: GapAnalysis;
  caseProspects: CaseProspects;
  proposedStrategy: ProposedStrategy;
  requestResolutionPlan?: string[];
  customNotes?: string;
  quickSummary?: string;
  userAddedLaws?: ApplicableLaw[]; // Field for user-added legal bases
  contingencyPlan?: string[]; // phương án xử lý nếu thua kiện
  prospectsChat?: ChatMessage[]; // For Case Prospects chat
  gapAnalysisChat?: ChatMessage[]; // For Gap Analysis chat
  strategyChat?: ChatMessage[]; // For Proposed Strategy chat
  resolutionPlanChat?: ChatMessage[]; // For Request Resolution Plan chat
  intelligentSearchChat?: ChatMessage[]; // For Intelligent Q&A
  argumentGraph?: ArgumentGraph; // Data for the Argument Map
}

// --- New Consulting Report Structure ---
export interface ConsultingReport {
    discussionPoints: string[];
    caseType: LitigationType | 'unknown';
    preliminaryStage: string;
    suggestedDocuments: string[];
    legalLoopholes?: LegalLoophole[];
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
    consultingReport?: ConsultingReport | null;
}