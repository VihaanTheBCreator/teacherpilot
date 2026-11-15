'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Monitor, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';
import { RecipientItem } from './RecipientPills';
import GemsCrest from './GemsCrest';

interface EmailPreviewFrameProps {
  recipient?: RecipientItem;
  teacherEmail?: string;
  teacherName?: string;
}

export default function EmailPreviewFrame({
  recipient,
  teacherEmail = 'vihaanbhandari235@gmail.com',
  teacherName = 'Vihaan Bhandari (Grade 11-A Lead)'
}: EmailPreviewFrameProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  if (!recipient) {
    return (
      <div className="h-full min-h-[460px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
        <div>
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-600">No recipient selected</p>
          <p className="text-xs text-gray-400 mt-1">Select a student above to inspect personalized email</p>
        </div>
      </div>
    );
  }

  const handleCopySubject = () => {
    if (recipient.emailSubject) {
      navigator.clipboard.writeText(recipient.emailSubject);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Email Client Header Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium">
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>GEMS Official Mail Client</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 rounded-lg p-0.5 flex text-xs">
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                deviceView === 'desktop' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                deviceView === 'mobile' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Email Metadata Details */}
      <div className="bg-slate-50 border-b border-gray-200 p-4 space-y-2 text-xs">
        <div className="grid grid-cols-[60px_1fr] items-baseline gap-2">
          <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">From:</span>
          <div className="text-gray-800 flex items-center space-x-2">
            <span className="font-semibold text-gems-green">{teacherName}</span>
            <span className="text-gray-500 font-mono text-[11px]">&lt;{teacherEmail}&gt;</span>
            <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
              <ShieldCheck className="w-3 h-3 mr-0.5" /> DKIM Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[60px_1fr] items-baseline gap-2">
          <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">To:</span>
          <div className="text-gray-800 flex items-center space-x-2">
            <span className="font-semibold">{recipient.guardianName || 'Guardian'}</span>
            <span className="text-gray-500 font-mono text-[11px]">&lt;{recipient.email || 'parent@gemsedu.com'}&gt;</span>
            <span className="text-gray-400 text-[11px]">({recipient.studentName})</span>
          </div>
        </div>

        <div className="grid grid-cols-[60px_1fr] items-baseline gap-2">
          <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Subject:</span>
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm">{recipient.emailSubject || '(No Subject)'}</span>
            <button
              type="button"
              onClick={handleCopySubject}
              className="text-gray-400 hover:text-gray-600 text-[11px] flex items-center space-x-1"
              title="Copy subject line"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Email Body */}
      <div className={`flex-1 overflow-y-auto p-4 bg-gray-100/70 flex justify-center`}>
        <div
          className={`w-full transition-all duration-200 bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden ${
            deviceView === 'mobile' ? 'max-w-sm my-2' : 'max-w-2xl my-2'
          }`}
        >
          {/* School Banner Header */}
          <div className="bg-[#005a36] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GemsCrest size={42} />
              <div>
                <h4 className="font-bold text-sm tracking-wide leading-tight">GEMS OUR OWN INDIAN SCHOOL</h4>
                <p className="text-[11px] text-emerald-100">Excellence in Education &bull; Dubai, UAE</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                Official Notice
              </span>
            </div>
          </div>

          {/* Golden accent bar */}
          <div className="h-1 bg-[#f5a623]" />

          {/* Email Content */}
          <div className="p-6">
            {recipient.emailBodyHtml ? (
              <div
                className="email-content text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: recipient.emailBodyHtml }}
              />
            ) : (
              <div className="text-gray-600 text-sm space-y-4">
                <p>Dear {recipient.guardianSalutation || 'Mr./Mrs.'} {recipient.guardianName || 'Parent'},</p>
                <p>This is an official communication regarding your ward, <strong>{recipient.studentName}</strong>.</p>
                <p>Please review school notices and contact us if any support is needed.</p>
                <p className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                  Warm regards,<br />
                  <strong>Vihaan Bhandari</strong><br />
                  Class Teacher &bull; Grade 11-A<br />
                  GEMS Our Own Indian School
                </p>
              </div>
            )}
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 text-center text-[11px] text-gray-400">
            <p>You received this official notification because your child is enrolled at GEMS Education.</p>
            <p className="mt-1 text-[10px]">Al Quoz 1, Dubai, UAE &bull; Phone: +971 4 339 1188</p>
          </div>
        </div>
      </div>
    </div>
  );
}
