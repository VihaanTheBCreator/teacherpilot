export type ScenarioType = 
  | 'stayback_cancel'
  | 'bus_delay'
  | 'remedial'
  | 'consent_chase'
  | 'praise'
  | 'custom';

export type ToneType = 'Warm' | 'Firm' | 'Institutional';

export type UrgencyType = 'immediate' | 'today' | 'planning';

export interface TargetFilter {
  stayBack?: boolean;
  busRoute?: string;
  remedial?: boolean;
  consentStatus?: 'PENDING' | 'SUBMITTED' | 'WAIVED' | string;
  studentIds?: string[];
  minScore?: number;
  maxScore?: number;
}

export interface Intent {
  scenario: ScenarioType;
  targetFilter: TargetFilter;
  tone: ToneType;
  urgency: UrgencyType;
  keyFacts: string[];
  rawPrompt: string;
}

export interface StudentData {
  id: string;
  name: string;
  gender?: string;
  parentName?: string;
  parentSalutation?: string;
  parentEmail?: string;
  parentWhatsApp?: string;
  transport?: string;
  busRoute?: string;
  busStop?: string;
  busSeat?: string | null;
  stayBack?: boolean;
  remedial?: boolean;
  lastScore?: number | null;
  consentStatus?: string;
  medicalAlert?: string | null;
}

export interface GuardianData {
  id?: string;
  name: string;
  salutation: string;
  email: string;
  whatsappNumber: string;
  relationship?: string;
}

export interface SchoolContext {
  schoolName?: string;
  brandColor?: string;
  teacherName?: string;
  teacherRole?: string;
  classGrade?: string;
  dateStr?: string;
}

export interface GeneratedMessage {
  studentId: string;
  studentName: string;
  guardianName: string;
  guardianEmail: string;
  guardianWhatsApp: string;
  emailSubject: string;
  emailBodyHtml: string;
  whatsappText: string;
}

export interface PresetScenario {
  id: ScenarioType;
  title: string;
  urgency: UrgencyType;
  tone: ToneType;
  icon: string;
  prompt: string;
  targetFilter: TargetFilter;
  filterDescription: string;
}
