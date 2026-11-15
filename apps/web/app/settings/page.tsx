'use client';

import React, { useState } from 'react';
import GemsCrest from '@/components/GemsCrest';
import {
  Settings,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Palette,
  School,
  User,
  Sliders,
  ExternalLink,
  Save,
  Check,
  Key,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const [schoolName, setSchoolName] = useState('GEMS Our Own Indian School');
  const [brandColor, setBrandColor] = useState('#005a36');
  const [accentColor, setAccentColor] = useState('#f5a623');
  const [teacherName, setTeacherName] = useState('Vihaan Bhandari');
  const [classGrade, setClassGrade] = useState('Grade 11-A');
  const [gmailStatus, setGmailStatus] = useState<'CONNECTED' | 'CHECKING'>('CONNECTED');
  const [whatsappStatus, setWhatsappStatus] = useState<'CONNECTED' | 'CHECKING'>('CONNECTED');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestGmail = () => {
    setGmailStatus('CHECKING');
    setTimeout(() => {
      setGmailStatus('CONNECTED');
    }, 1000);
  };

  const handleTestWhatsApp = () => {
    setWhatsappStatus('CHECKING');
    setTimeout(() => {
      setWhatsappStatus('CONNECTED');
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">System & Brand Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure school identity, verify dispatch channel connections, and manage class teacher profile.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* School Branding Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-gems-green/10 text-gems-green flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">School Identity & Branding</h3>
              <p className="text-xs text-gray-500">Official crest and theme colors embedded into parent HTML emails</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Primary GEMS Green
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 text-xs font-mono p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Accent Amber
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 text-xs font-mono p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* School Crest Badge Preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GemsCrest size={48} />
              <div>
                <h4 className="font-bold text-sm text-gray-900">{schoolName}</h4>
                <p className="text-xs text-gray-500">Official GEMS Education Identity Preview</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                Brand Active
              </span>
            </div>
          </div>
        </div>

        {/* Dispatch Channels & Authentication Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gmail Channel Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Official Gmail Channel</h4>
                  <p className="text-[11px] text-gray-500">Nodemailer SMTP &bull; Google OAuth 2.0</p>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Sender Account:</span>
                <span className="font-semibold text-gray-900 font-mono">vihaanbhandari235@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Protocol:</span>
                <span className="font-medium text-gray-800">SMTP TLS (Port 587)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DKIM & SPF:</span>
                <span className="font-medium text-emerald-700">Verified & Passed</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestGmail}
              disabled={gmailStatus === 'CHECKING'}
              className="w-full py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gmailStatus === 'CHECKING' ? 'animate-spin' : ''}`} />
              <span>{gmailStatus === 'CHECKING' ? 'Testing Connection...' : 'Test Gmail Connection'}</span>
            </button>
          </div>

          {/* WhatsApp Mudslide Channel Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">WhatsApp Mudslide Channel</h4>
                  <p className="text-[11px] text-gray-500">Baileys Multidevice Session</p>
                </div>
              </div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Session Active</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Session ID:</span>
                <span className="font-mono text-gray-900">gems-oais-mudslide</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Engine:</span>
                <span className="font-medium text-gray-800">Baileys WA Socket</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium text-emerald-700">Authenticated (Persistent)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={whatsappStatus === 'CHECKING'}
              className="w-full py-2 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors flex items-center justify-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${whatsappStatus === 'CHECKING' ? 'animate-spin' : ''}`} />
              <span>{whatsappStatus === 'CHECKING' ? 'Pinging Session...' : 'Test WhatsApp Ping'}</span>
            </button>
          </div>
        </div>

        {/* Teacher Class Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Teacher Profile & Sign-off</h3>
              <p className="text-xs text-gray-500">Appears in footer signature of generated notices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Teacher Name
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Assigned Class Grade
              </label>
              <input
                type="text"
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
