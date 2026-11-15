'use client';

import React, { useEffect, useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface UndoToastProps {
  campaignId: string;
  durationSeconds?: number;
  onUndoComplete?: (result: any) => void;
  onExpired?: () => void;
  onClose?: () => void;
}

export default function UndoToast({
  campaignId,
  durationSeconds = 10,
  onUndoComplete,
  onExpired,
  onClose
}: UndoToastProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationSeconds);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);
  const [undone, setUndone] = useState<boolean>(false);
  const [expired, setExpired] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (undone || expired) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setExpired(true);
          if (onExpired) onExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [undone, expired, onExpired]);

  const handleUndo = async () => {
    if (isUndoing || undone || expired) return;
    setIsUndoing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/dispatch/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUndone(true);
        if (onUndoComplete) onUndoComplete(data);
      } else {
        setErrorMessage(data.error || 'Failed to cancel dispatch');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error undoing dispatch');
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden">
        {/* Animated Countdown Progress Bar */}
        {!undone && !expired && (
          <div className="w-full bg-slate-800 h-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all ease-linear"
              style={{
                width: `${(secondsRemaining / durationSeconds) * 100}%`,
                transitionDuration: '1000ms'
              }}
            />
          </div>
        )}

        <div className="p-4 sm:p-5">
          {undone ? (
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-white">Campaign Dispatched Cancelled</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Undo successful. No emails or WhatsApp messages were sent.
                </p>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : expired ? (
            <div className="flex items-center space-x-3 text-emerald-400">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-white">Undo Window Closed</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Campaign is active. Email and WhatsApp messages are now delivering.
                </p>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-white">Dispatch In Progress</h4>
                      <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                        {secondsRemaining}s grace period
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">
                      Messages scheduled for dispatch. Click undo within {secondsRemaining}s to halt.
                    </p>
                  </div>
                </div>

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="mt-3 text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-800">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  Campaign ID: <span className="font-mono text-slate-300">{campaignId.slice(-8)}</span>
                </span>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md disabled:opacity-50"
                >
                  {isUndoing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Dispatch ({secondsRemaining}s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
