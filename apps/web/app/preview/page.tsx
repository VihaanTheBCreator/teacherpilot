'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SendHorizontal,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import EmailPreviewFrame from '@/components/EmailPreviewFrame';
import WhatsAppBubble from '@/components/WhatsAppBubble';
import StudentSelector from '@/components/StudentSelector';
import UndoToast from '@/components/UndoToast';
import { RecipientItem } from '@/components/RecipientPills';

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId') || searchParams.get('campaignId');

  const [campaignData, setCampaignData] = useState<{
    prompt?: string;
    tone?: string;
    scenario?: string;
    recipients: RecipientItem[];
  } | null>(null);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [undoStatus, setUndoStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load generated batch from database via draftId / campaignId, with fallback to active roster
  useEffect(() => {
    async function loadCampaignData() {
      setLoading(true);
      setErrorMessage(null);

      // 1. If draftId or campaignId exists in query params, fetch from database API
      if (draftIdParam) {
        try {
          const res = await fetch(`/api/campaigns/${draftIdParam}`);
          if (res.ok) {
            const data = await res.json();
            if (data.recipients && data.recipients.length > 0) {
              const mappedRecipients: RecipientItem[] = data.recipients.map((r: any) => ({
                studentId: r.guardian?.student?.id || r.id,
                studentName: r.studentName || 'Student',
                gender: r.gender || 'Other',
                transport: r.studentTransport || 'Bus 14',
                busRoute: r.busRoute || 'Bus 14',
                busStop: r.busStop || 'Standard Stop',
                stayBack: true,
                remedial: false,
                consentStatus: 'SUBMITTED',
                guardianName: r.name || r.guardianName || 'Parent',
                guardianSalutation: r.salutation || 'Mr./Mrs.',
                email: r.email,
                whatsappNumber: r.whatsappNumber,
                emailSubject: r.emailSubject,
                emailBodyHtml: r.emailBodyHtml,
                whatsappText: r.whatsappText
              }));

              setCampaignData({
                prompt: data.campaign?.prompt || 'Class Broadcast',
                tone: data.campaign?.tone || 'Warm',
                scenario: data.campaign?.scenario || 'stayback_cancel',
                recipients: mappedRecipients
              });
              setLoading(false);
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch draft campaign by ID:', fetchErr);
        }
      }

      // 2. Check localStorage session cache if present
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('teacherpilot_generated_campaign');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && Array.isArray(parsed.recipients) && parsed.recipients.length > 0) {
              setCampaignData(parsed);
              setLoading(false);
              return;
            }
          } catch {}
        }
      }

      // 3. Fallback: Automatically generate from real database roster instead of fake mock names
      try {
        const genRes = await fetch('/api/compose/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Stay-back cancelled today for all students. Regular 2:15 PM buses.',
            tone: 'Warm',
            teacherId: 'teacher-vihaan'
          })
        });

        if (genRes.ok) {
          const genData = await genRes.json();
          if (genData.recipients && genData.recipients.length > 0) {
            setCampaignData({
              prompt: 'Stay-back cancelled today for all students. Regular 2:15 PM buses.',
              tone: 'Warm',
              scenario: genData.intent?.scenario || 'stayback_cancel',
              recipients: genData.recipients
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to auto-generate default preview from roster:', err);
      }

      setLoading(false);
    }

    loadCampaignData();
  }, [draftIdParam]);

  const recipients = campaignData?.recipients || [];
  const currentRecipient = recipients[selectedIndex] || recipients[0];

  const handleSendToAll = async () => {
    if (recipients.length === 0 || isSending) return;

    setIsSending(true);
    setErrorMessage(null);
    setUndoStatus(null);

    try {
      const res = await fetch('/api/dispatch/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: 'teacher-vihaan',
          prompt: campaignData?.prompt || 'Class notification',
          tone: campaignData?.tone || 'Warm',
          scenario: campaignData?.scenario || 'custom',
          recipients: recipients
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch campaign');
      }

      setActiveCampaignId(data.campaignId);
      setSendSuccess(true);
      setShowUndoToast(true);
    } catch (err: any) {
      console.error('Send error:', err);
      setErrorMessage(err.message || 'Error executing dispatch');
    } finally {
      setIsSending(false);
    }
  };

  const handleUndoComplete = (result: any) => {
    setUndoStatus('CANCELLED');
    setShowUndoToast(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-gems-green mx-auto" />
        <p className="text-sm font-semibold text-gray-700">Loading personalized messages from database...</p>
        <p className="text-xs text-gray-400">Personalizing official HTML email and WhatsApp formats per parent</p>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center bg-white rounded-2xl border border-gray-200 p-8 space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">No Generated Messages in Preview Queue</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Select or prompt a scenario in the AI Composer to automatically target students and prepare dual-channel copy.
        </p>
        <Link
          href="/compose"
          className="inline-flex items-center space-x-2 bg-gems-green text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:bg-gems-green-dark transition-colors"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Open AI Composer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/compose"
              className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              title="Back to Composer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Dual-Channel Broadcast Preview
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {recipients.length} Parents Targeted
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Inspect individualized copy for each parent across official GEMS HTML Email and instant WhatsApp channels before initiating live broadcast.
          </p>
        </div>

        {/* Send Action Button */}
        <div className="flex items-center space-x-3">
          <Link
            href="/compose"
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            Edit Prompt
          </Link>

          <button
            type="button"
            onClick={handleSendToAll}
            disabled={isSending || recipients.length === 0}
            className="bg-[#005a36] hover:bg-[#004328] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all flex items-center space-x-2 shadow-sm disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scheduling Dispatch...</span>
              </>
            ) : (
              <>
                <SendHorizontal className="w-4 h-4 text-amber-400" />
                <span>Send to All {recipients.length} Parents</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Safety Notice & Status Alert */}
      {undoStatus === 'CANCELLED' ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>
              <strong>Dispatch Cancelled:</strong> The broadcast was safely aborted during the 10-second undo window. No emails or WhatsApp messages were delivered.
            </span>
          </div>
          <Link href="/compose" className="font-semibold underline ml-2">
            Compose new message
          </Link>
        </div>
      ) : sendSuccess && !showUndoToast ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Broadcast Dispatched!</strong> Messages have passed the undo grace period and are delivering via GEMS Gmail and Mudslide WhatsApp channels.
            </span>
          </div>
          <Link href="/campaigns" className="font-semibold underline ml-2">
            View Audit Log &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 px-4 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Safety Guardrail Active:</strong> Every dispatch includes an automatic <strong>10-second undo window</strong> before messages leave the server queue.
            </span>
          </div>
          <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            1-to-1 Isolated Mode (Zero CC/BCC)
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Student Selector Bar */}
      <StudentSelector
        recipients={recipients}
        selectedIndex={selectedIndex}
        onSelect={(idx) => setSelectedIndex(idx)}
      />

      {/* Dual Channel Side-by-Side Frames */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Frame: HTML Email Client Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                Channel 1: Official HTML Email
              </h3>
            </div>
            <span className="text-[11px] text-gray-500">DKIM &bull; GEMS Brand Crest</span>
          </div>
          <div className="flex-1">
            <EmailPreviewFrame recipient={currentRecipient} />
          </div>
        </div>

        {/* Right Frame: WhatsApp Green Chat Bubble Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                Channel 2: WhatsApp Flash Notice
              </h3>
            </div>
            <span className="text-[11px] text-gray-500">Instant Parent Alert</span>
          </div>
          <div className="flex-1">
            <WhatsAppBubble recipient={currentRecipient} />
          </div>
        </div>
      </div>

      {/* Floating 10-Second Undo Toast */}
      {showUndoToast && activeCampaignId && (
        <UndoToast
          campaignId={activeCampaignId}
          durationSeconds={10}
          onUndoComplete={handleUndoComplete}
          onExpired={() => {}}
          onClose={() => setShowUndoToast(false)}
        />
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading preview...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
