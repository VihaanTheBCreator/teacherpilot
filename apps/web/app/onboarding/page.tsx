'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  School,
  Mail,
  Smartphone,
  Users,
  SendHorizontal,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Download,
  UploadCloud,
  ShieldCheck,
  QrCode,
  Key,
  RotateCcw,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: School Profile State
  const [schoolName, setSchoolName] = useState('GEMS Our Own Indian School');
  const [gradeClass, setGradeClass] = useState('Grade 11-A');
  const [teacherName, setTeacherName] = useState('Vihaan Bhandari');

  // Step 2: Gmail State
  const [gmailConnected, setGmailConnected] = useState(true);
  const [testingGmail, setTestingGmail] = useState(false);

  // Step 3: WhatsApp Pairing State
  const [waPairingMode, setWaPairingMode] = useState<'qr' | 'code'>('qr');
  const [waConnected, setWaConnected] = useState(true);
  const [pairingCode] = useState('GEMS-8821');

  // Step 4: Roster State
  const [rosterConfirmed, setRosterConfirmed] = useState(true);

  // Step 5: Simulation Broadcast State
  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [simCountdown, setSimCountdown] = useState(10);
  const [simUndone, setSimUndone] = useState(false);

  const steps = [
    { num: 1, title: 'School Profile', desc: 'Identity & Brand', icon: School },
    { num: 2, title: 'Google Mail', desc: 'Official Domain', icon: Mail },
    { num: 3, title: 'WhatsApp Link', desc: '1-to-1 Baileys Socket', icon: Smartphone },
    { num: 4, title: 'Class Roster', desc: 'Student Contacts', icon: Users },
    { num: 5, title: 'Test Broadcast', desc: 'Safety Simulation', icon: SendHorizontal },
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const runTestBroadcast = () => {
    setSimulating(true);
    setSimUndone(false);
    setSimCountdown(10);

    const interval = setInterval(() => {
      setSimCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setSimulating(false);
          setSimDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleUndoSimulation = () => {
    setSimulating(false);
    setSimUndone(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#005a36] to-[#003b23] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <GemsCrest size={64} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
                TeacherPilot Onboarding Wizard
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                5-Step Setup
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Welcome to GEMS Parent Communication
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Complete your classroom co-pilot setup in under 3 minutes to start dispatching personalized, compliant communications across Email & WhatsApp.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="self-start md:self-auto text-xs text-emerald-200 hover:text-white underline"
        >
          Skip to Dashboard &rarr;
        </Link>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`p-3 rounded-xl text-left transition-all flex items-center space-x-2.5 ${
                  isCurrent
                    ? 'bg-gems-green text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                  <div className={`text-[10px] truncate ${isCurrent ? 'text-emerald-100' : 'text-gray-400'}`}>
                    {s.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs min-h-[420px] flex flex-col justify-between space-y-6">
        {/* Step 1: School Profile */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-gems-green uppercase tracking-wider">Step 1 of 5</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">School Profile & Classroom Identification</h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure your school and classroom details so all outgoing emails and WhatsApp notices reflect official GEMS credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned School</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class Grade & Section</label>
                <input
                  type="text"
                  value={gradeClass}
                  onChange={(e) => setGradeClass(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Class Teacher</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Brand Palette</label>
                <div className="flex items-center space-x-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#005a36] inline-block shadow-xs" />
                    <span className="text-[11px] font-mono text-gray-700 font-semibold">#005a36</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-[#f5a623] inline-block shadow-xs" />
                    <span className="text-[11px] font-mono text-gray-700 font-semibold">#f5a623</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>
                Verified GEMS Education portal tenant. All parent signatures and school headers adhere to GEMS Corporate Identity standards.
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Google Mail Connection */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-gems-green uppercase tracking-wider">Step 2 of 5</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Connect Official Google Workspace / Gmail</h2>
              <p className="text-xs text-gray-500 mt-1">
                Parent emails are dispatched directly through your verified Google Workspace address to ensure 100% deliverability and DKIM authentication.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-red-500 shadow-xs">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Google Workspace Email Service</h3>
                    <p className="text-xs text-gray-500 font-mono">vihaanbhandari235@gmail.com</p>
                  </div>
                </div>

                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authenticated</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">DKIM Status</span>
                  <span className="font-semibold text-emerald-700">Verified & Active</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Domain Reputation</span>
                  <span className="font-semibold text-emerald-700">High (gemsedu.com)</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Protocol</span>
                  <span className="font-semibold text-gray-800">Nodemailer SMTP + OAuth</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTestingGmail(true);
                setTimeout(() => setTestingGmail(false), 800);
              }}
              className="text-xs font-semibold text-gems-green hover:underline flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingGmail ? 'animate-spin' : ''}`} />
              <span>{testingGmail ? 'Verifying SMTP connection...' : 'Test SMTP Mail Connection'}</span>
            </button>
          </div>
        )}

        {/* Step 3: Teacher WhatsApp Pairing Guide */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-gems-green uppercase tracking-wider">Step 3 of 5</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">WhatsApp Mudslide Pairing Guide</h2>
              <p className="text-xs text-gray-500 mt-1">
                Link your official teacher WhatsApp account. TeacherPilot uses Baileys multidevice socket for 1-to-1 parent alerts with zero group spam.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Pairing Instructions & Guarantee */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-900">
                  <div className="font-bold flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Zero Group Spam Guarantee</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    TeacherPilot never posts to WhatsApp parent groups. Messages are sent individually to each parent&apos;s direct phone number, protecting privacy under UAE PDPL regulations.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setWaPairingMode('qr')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      waPairingMode === 'qr' ? 'bg-[#005a36] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaPairingMode('code')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      waPairingMode === 'code' ? 'bg-[#005a36] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Pairing Code
                  </button>
                </div>

                <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Open WhatsApp on your teacher mobile device</li>
                  <li>Tap <strong>Settings &rarr; Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong> and point camera to QR code</li>
                </ol>
              </div>

              {/* QR Mockup or Pairing Code Display */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 text-white rounded-3xl shadow-md border border-slate-800 text-center">
                {waPairingMode === 'qr' ? (
                  <div className="space-y-3">
                    <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-slate-900" />
                    </div>
                    <span className="inline-block text-[10px] font-mono bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
                      Session: gems-oais-mudslide
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <Key className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-400">Enter this 8-digit code in WhatsApp:</p>
                    <div className="text-3xl font-mono font-bold tracking-widest text-amber-300">
                      {pairingCode}
                    </div>
                  </div>
                )}
                <div className="mt-3 flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Session Authenticated & Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Class Roster Setup */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-gems-green uppercase tracking-wider">Step 4 of 5</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Class Roster & Student Contact Sync</h2>
              <p className="text-xs text-gray-500 mt-1">
                Review your seeded class directory or download the official GEMS CSV template to import student records and guardian contacts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CSV Template Download Card */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-gems-green/10 text-gems-green flex items-center justify-center mb-2">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Download Official CSV Template</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Pre-formatted spreadsheet template with student name, parent contacts, bus route, and academic flags.
                  </p>
                </div>
                <a
                  href="/api/roster/template"
                  download="gems_class_roster_template.csv"
                  className="bg-white border border-gray-300 hover:border-gems-green text-gray-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-gems-green" />
                  <span>Download gems_roster_template.csv</span>
                </a>
              </div>

              {/* Current Active Roster Status */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">Seeded Grade 11-A Roster Ready</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    10 verified student records with linked parent emails and WhatsApp mobile numbers are ready for broadcast.
                  </p>
                </div>
                <Link
                  href="/roster"
                  target="_blank"
                  className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Inspect Directory Table</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Interactive Test Broadcast Simulation */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-gems-green uppercase tracking-wider">Step 5 of 5</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">Safety Guardrail & Broadcast Simulation</h2>
              <p className="text-xs text-gray-500 mt-1">
                Experience TeacherPilot&apos;s trademark <strong>10-second undo countdown</strong>. You always have 10 seconds to abort any dispatch before it leaves the server.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Interactive Test Scenario: Bus 14 Delay Alert</h3>
                    <p className="text-xs text-slate-400">Targeting 4 parents on Bus 14 route</p>
                  </div>
                </div>

                {!simulating && !simDone && !simUndone && (
                  <button
                    type="button"
                    onClick={runTestBroadcast}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-md"
                  >
                    Start Test Broadcast
                  </button>
                )}
              </div>

              {/* Active Simulation Countdown */}
              {simulating && (
                <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-amber-400/40 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-xs font-bold text-amber-300">
                        Dispatch In 10-Second Grace Period ({simCountdown}s remaining)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleUndoSimulation}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Undo Test Dispatch</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(simCountdown / 10) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    If you realize a mistake, clicking &ldquo;Undo&rdquo; halts the queue with zero messages delivered.
                  </p>
                </div>
              )}

              {/* Simulation Undone Message */}
              {simUndone && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-center justify-between">
                  <span>✓ Test broadcast was safely cancelled! Zero messages sent.</span>
                  <button
                    type="button"
                    onClick={runTestBroadcast}
                    className="text-amber-300 hover:underline font-semibold"
                  >
                    Retry test
                  </button>
                </div>
              )}

              {/* Simulation Delivered Message */}
              {simDone && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs flex items-center justify-between">
                  <span>🎉 Test broadcast completed! Dual-channel messages delivered.</span>
                  <button
                    type="button"
                    onClick={runTestBroadcast}
                    className="text-amber-300 hover:underline font-semibold"
                  >
                    Run another test
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center space-x-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
            >
              <span>Continue to Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-[#f5a623] hover:bg-[#d48810] text-slate-950 font-bold px-7 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch TeacherPilot Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
