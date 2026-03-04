export enum AuditType {
  FINANCIAL = 'Financial Audit',
  PERFORMANCE = 'Performance Audit',
  COMPLIANCE = 'Compliance Audit',
  PROFESSIONAL_REVIEW = 'Professional Performance Review'
}

export enum ComplianceStatus {
  COMPLIANT = 'Compliant', // مستوفى
  NON_CONFORMANCE = 'Non-Conformance', // حالة عدم مطابقة
  IMPROVEMENT_OPPORTUNITY = 'Improvement Opportunity' // فرصة تحسين
}

export type ResponseStatus = 'pending' | 'submitted' | 'returned' | 'approved';

export interface ResponseInteraction {
  id: string;
  date: string;
  user: string;
  role: string;
  action: 'submit' | 'return' | 'approve';
  note: string; // The response text or the reviewer's comment
  evidence?: string;
  evidenceName?: string;
}

export interface UnitResponse {
  unitName: string;
  // Current active fields (drafting area)
  action: string; 
  evidence?: string;
  evidenceName?: string;
  date?: string;
  status?: ResponseStatus; 
  // History of deliberations
  history?: ResponseInteraction[];
}

export interface CriterionResult {
  text: string;
  status: ComplianceStatus;
  analysis: string;       // Analysis per criterion
  gaps: string;           // Gaps per criterion
  recommendation: string; // Recommendation per criterion
  
  // New Fields requested
  governingStandard?: string; // المعيار المنظم
  responsibleUnits?: string;  // الوحدات المعنية بالتصويب

  // New fields for Entity Follow-up
  entityAction?: string;     // Legacy/Summary action field
  actionEvidence?: string;   // Legacy evidence
  actionEvidenceName?: string; // Legacy evidence name
  
  // New: Support for multiple unit responses
  unitResponses?: UnitResponse[]; 
}

export interface AuditStageEvaluation {
  elementName: string;
  // We keep overall status for the stage summary, derived or manual
  status: ComplianceStatus; 
  criteriaResults: CriterionResult[]; // New field for granular evaluation
  analysis: string; // General stage analysis (optional/summary)
  gaps: string;     // General stage gaps (optional/summary)
  recommendation: string; // General stage recommendation (optional/summary)
}

export interface AuditAnalysisResult {
  auditType: string;
  targetName?: string; // Explicit name of the mission/person being audited
  targetType?: QCTargetType; // Explicit type
  controlUnitName?: string; // The specific control unit name (Entity)
  overallSummary: string;
  stages: AuditStageEvaluation[];
  // New fields for form state restoration
  startDate?: string;
  endDate?: string;
  evaluationPeriod?: string;
  auditTypeEnum?: AuditType;
  rawTargetName?: string;
}

// Configuration Types
export interface QCStageConfig {
  name: string;
  criteria: string[];
}

export type QCConfig = QCStageConfig[];

export type ReportStatus = 'assigned' | 'draft' | 'pending_head' | 'returned_to_head' | 'pending_director' | 'completed' | 'returned';

export interface ApprovalAction {
  date: string;
  user: string;
  role: string;
  action: 'approve' | 'return' | 'submit';
  note?: string;
}

export type QCTargetType = 'Mission' | 'TeamLeader' | 'TeamMember' | 'AuditProgram';

export interface UserPermissions {
  createPlan: boolean;
  approvePlan: boolean;
  startPlan: boolean;
  performReview: boolean;
  respondToFindings: boolean;
  reviewAndEscalate: boolean;
  sendToFollowUp: boolean;
  editReport: boolean;
  approveReport: boolean; // New: Specific permission to approve QC reports
}

export interface User {
  id: number;
  name: string;
  username: string; // Added username field for login
  password?: string; // Added password field
  email: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: UserPermissions;
  isDeleted?: boolean; // For Soft Delete
}

export interface QCLogItem {
  id: string;
  reportNumber: string;
  missionName: string;
  targetType: QCTargetType;
  auditType: string;
  controlUnitName?: string; // Explicit field for filtering by Control Unit
  status: ReportStatus;
  date: string;
  scoreClassification: string;
  reviewerId: number;
  reviewerName: string;
  resultData: AuditAnalysisResult;
  approvalHistory?: ApprovalAction[];
  isDeleted?: boolean; // For Soft Delete
  deletionReason?: string; // Reason for deletion
}

// Unified Activity Log Interface
export interface ActivityLog {
  id: string;
  userId: number;
  userName: string;
  userRole: string;
  action: string; // e.g., 'login', 'create', 'delete', 'update'
  target: string; // e.g., 'Plan Item', 'Report QC-001'
  details?: string;
  timestamp: string;
}

// Legacy Login Log (kept for type compatibility if needed, but ActivityLog supercedes it)
export interface LoginLog {
  id: string;
  userId: number;
  userName: string;
  role: string;
  timestamp: string;
}

// New Interface for Follow-up Registry
export interface FollowUpItem {
  id: string;
  reportId: string;
  reportNumber: string;
  missionName: string; // Added mission name
  controlUnitName: string;
  findingType: 'NON_CONFORMANCE' | 'IMPROVEMENT_OPPORTUNITY';
  findingText: string;
  recommendation: string;
  status: 'Open' | 'Resolved'; // Open = Pending Action, Resolved = Entity Responded/Closed
  sentDate: string;
  isDeleted?: boolean; // For Soft Delete
}

export interface PlanMetadata {
  year: number;
  title: string;
  description: string;
  objectives: string;
  isApproved?: boolean;
}

export interface PlanItem {
  id: number;
  targetType: QCTargetType;
  targetName: string;
  controlUnitName?: string; // Optional field for the associated Control Unit
  date: string;
  auditType: AuditType;
  status: string;
  year: number;
  justification?: string;
  evaluationPeriod?: string;
  changeStatus?: 'original' | 'added_post_approval' | 'modified_post_approval';
  isDeleted?: boolean; // For Soft Delete
  deletionReason?: string; // Reason for deletion
}