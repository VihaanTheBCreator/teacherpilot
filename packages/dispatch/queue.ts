/**
 * TeacherPilot - 10-Second Undo Dispatch Queue (TypeScript)
 */

import { EventEmitter } from 'events';

export type CampaignStatus = 'DRAFT' | 'WAITING_UNDO' | 'DISPATCHING' | 'COMPLETED' | 'CANCELLED';
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface RecipientInput {
  id?: string;
  guardianId?: string;
  guardianName?: string;
  studentName?: string;
  name?: string;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  emailSubject?: string;
  emailBodyHtml?: string;
  whatsappText?: string;
}

export interface CampaignRecipientRecord {
  id: string;
  campaignId: string;
  guardianId: string;
  guardianName: string;
  studentName: string;
  email: string;
  whatsappNumber: string;
  emailSubject: string;
  emailBodyHtml: string;
  whatsappText: string;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  emailSentAt: Date | null;
  whatsappSentAt: Date | null;
  emailError: string | null;
  whatsappError: string | null;
  createdAt: Date;
}

export interface CampaignRecord {
  id: string;
  teacherId: string;
  prompt: string;
  scenario: string;
  tone: string;
  status: CampaignStatus;
  createdAt: Date;
  undoExpiresAt: Date;
  dispatchedAt: Date | null;
  completedAt: Date | null;
  recipients: CampaignRecipientRecord[];
}

export interface QueueCampaignInput {
  id?: string;
  teacherId?: string;
  prompt?: string;
  scenario?: string;
  tone?: string;
  recipients: RecipientInput[];
  customUndoWindowMs?: number;
}

export interface QueueCampaignResult {
  campaignId: string;
  status: 'WAITING_UNDO';
  undoExpiresAt: Date;
  secondsRemaining: number;
  recipientCount: number;
}

export interface CancelCampaignResult {
  success: boolean;
  campaignId?: string;
  status?: CampaignStatus;
  message?: string;
  error?: string;
}

export interface DispatchQueueOptions {
  undoWindowMs?: number;
  recipientIntervalMs?: number;
  dryRun?: boolean;
  prisma?: any;
}

export declare class DispatchQueue extends EventEmitter {
  constructor(options?: DispatchQueueOptions);
  undoWindowMs: number;
  recipientIntervalMs: number;
  dryRun: boolean;
  prisma: any;
  queueCampaign(campaignInput: QueueCampaignInput): QueueCampaignResult;
  cancelCampaign(campaignId: string): CancelCampaignResult;
  getCampaign(campaignId: string): CampaignRecord | null;
  getAllCampaigns(): CampaignRecord[];
  destroy(): void;
}

const {
  DispatchQueue: CjsDispatchQueue,
  createDispatchQueue: cjsCreateDispatchQueue,
  defaultQueue: cjsDefaultQueue,
  queueCampaign: cjsQueueCampaign,
  cancelCampaign: cjsCancelCampaign,
  getCampaign: cjsGetCampaign
} = require('./queue.js');

export const createDispatchQueue = cjsCreateDispatchQueue;
export const defaultQueue = cjsDefaultQueue;
export const queueCampaign = cjsQueueCampaign;
export const cancelCampaign = cjsCancelCampaign;
export const getCampaign = cjsGetCampaign;
export default createDispatchQueue;
