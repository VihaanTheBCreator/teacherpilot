'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Send,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Check
} from 'lucide-react';
import ScenarioPicker, { SCENARIO_PRESETS, ScenarioPreset } from '@/components/ScenarioPicker';
import RecipientPills, { RecipientItem } from '@/components/RecipientPills';

function ComposeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialScenarioParam = searchParams.get('scenario');

  const [prompt, setPrompt] = useState<string>('');
  const [tone, setTone] = useState<'Warm' | 'Firm' | 'Institutional'>('Warm');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    intent?: any;
    recipients: RecipientItem[];
    count: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialScenarioParam) {
      const match = SCENARIO_PRESETS.find((p) => p.scenarioKey === initialScenarioParam);
      if (match) {
        setSelectedScenarioId(match.id);
        setPrompt(match.prompt);
        setTone(match.suggestedTone);
      }
    }
  }, [initialScenarioParam]);

  const handleScenarioSelect = (preset: ScenarioPreset) => {
    setSelectedScenarioId(preset.id);
    setPrompt(preset.prompt);
    setTone(preset.suggestedTone);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please type what happened or pick a quick scenario button above.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/compose/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          tone,
          teacherId: 'teacher-vihaan'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to draft messages');
      }

      setDraftId(data.draftId || null);
      setGeneratedResult({
        intent: data.intent,
        recipients: data.recipients || [],
        count: data.count || (data.recipients ? data.recipients.length : 0)
      });

      // Cache backup
      const payloadToCache = {
        draftId: data.draftId,
        prompt: prompt.trim(),
        tone,
        scenario: data.intent?.scenario || selectedScenarioId || 'custom',
        recipients: data.recipients || [],
        generatedAt: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('teacherpilot_generated_campaign', JSON.stringify(payloadToCache));
      }
    } catch (err: any) {
      console.error('Error generating messages:', err);
      setErrorMessage(err.message || 'Could not draft messages. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveRecipient = (index: number) => {
    if (!generatedResult) return;
    const updated = [...generatedResult.recipients];
    updated.splice(index, 1);
    setGeneratedResult({
      ...generatedResult,
      recipients: updated,
      count: updated.length
    });
  };

  const handleProceedToPreview = () => {
    if (!generatedResult || generatedResult.recipients.length === 0) return;
    if (draftId) {
      router.push(`/preview?draftId=${draftId}`);
    } else {
      router.push('/preview');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Send Parent Alert</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Grade 11-A Homeroom
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Type one sentence below. The app automatically writes a personalized email and WhatsApp note for each parent.
          </p>
        </div>

        {generatedResult && (
          <button
            type="button"
            onClick={handleProceedToPreview}
            className="saas-button bg-gems-green hover:bg-gems-green-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-sm"
          >
            <span>Review Messages &amp; Send</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5 Scenario Quick-Buttons */}
      <div className="saas-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Scenarios (Tap to autofill)
          </span>
          <span className="text-[11px] text-slate-400">Zero typing needed</span>
        </div>
        <ScenarioPicker
          selectedId={selectedScenarioId}
          onSelect={handleScenarioSelect}
        />
      </div>

      {/* Main Composer Box */}
      <div className="saas-card rounded-2xl p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="promptInput" className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <span>What do parents need to know?</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </label>
            <span className="text-[11px] text-slate-400">Type naturally in plain English</span>
          </div>
          <textarea
            id="promptInput"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Stay-back is cancelled today, Bus 14 is 20 mins late, or Remedial session this Thursday..."
            className="w-full text-sm text-slate-900 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gems-green/30 focus:border-gems-green resize-y leading-relaxed bg-slate-50/50"
          />
        </div>

        {/* Friendly Style Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Message Style</span>
            <span className="text-[11px] text-slate-400">Pick how friendly or formal you want the words to sound</span>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            {(['Warm', 'Firm', 'Institutional'] as const).map((t) => {
              const isSelected = tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'Warm' && '🤝 Friendly & Caring'}
                  {t === 'Firm' && '⚠️ Urgent & Direct'}
                  {t === 'Institutional' && '🏛️ Formal Notice'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button & Safety Note */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Private: Each parent only sees their own child&apos;s note (zero CC/BCC leak)</span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="saas-button bg-gems-green hover:bg-gems-green-dark text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-900/10 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Writing Messages for Parents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Draft Messages for Parents ✨</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Generated Ready Result Pill */}
      {generatedResult && (
        <div className="space-y-4 animate-slide-up">
          <div className="saas-card rounded-2xl p-5 border-emerald-200 bg-emerald-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-gems-green text-white flex items-center justify-center font-bold shadow-sm">
                <Check className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ✨ Done! {generatedResult.count} Parent Messages Prepared
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Targeted: <strong className="text-emerald-900">{generatedResult.intent?.scenario ? generatedResult.intent.scenario.replace('_', ' ') : 'General'}</strong> &bull; Style: <strong>{tone}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToPreview}
              className="saas-button bg-gems-green hover:bg-gems-green-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Review Messages &amp; Send</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <RecipientPills
            recipients={generatedResult.recipients}
            onRemove={handleRemoveRecipient}
            title="Parents who will receive this alert"
            subtext="Tap the ✕ icon if you want to skip any student from this broadcast."
          />
        </div>
      )}
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading composer...</div>}>
      <ComposeContent />
    </Suspense>
  );
}
