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

export declare function parseIntent(prompt: string, options?: { tone?: ToneType; [key: string]: any }): Promise<Intent>;
export declare function parseIntentOffline(prompt: string, options?: { tone?: ToneType; [key: string]: any }): Intent;

export declare function generateMessage(
  intent: Intent,
  student: StudentData,
  guardian: GuardianData,
  schoolContext?: SchoolContext
): Promise<GeneratedMessage>;

export declare function generateMessageOffline(
  intent: Intent,
  student: StudentData,
  guardian: GuardianData,
  schoolContext?: SchoolContext
): GeneratedMessage;

export declare function generateMessages(
  intent: Intent,
  students: StudentData[],
  schoolContext?: SchoolContext
): Promise<GeneratedMessage[]>;

export declare const presets: PresetScenario[];
export declare const PRESET_SCENARIOS: PresetScenario[];

export declare function applySbiFilter(text: string): string;
export declare const BLAME_PATTERNS: Array<{ pattern: RegExp; replacement: string }>;

export declare function getSalutation(guardian: { salutation?: string; name?: string }, tone?: ToneType): string;
export declare function wrapEmailHtml(params: any): string;
export declare function formatWhatsAppText(rawText: string): string;
