'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Bus,
  BookOpen,
  AlertCircle,
  Award,
  Mail,
  Smartphone,
  ChevronRight,
  Monitor,
  Zap,
  Users
} from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';
import EmailPreviewFrame from '@/components/EmailPreviewFrame';
import WhatsAppBubble from '@/components/WhatsAppBubble';
import { SCENARIO_PRESETS } from '@/components/ScenarioPicker';

export default function DemoPage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('stayback_cancel');

  const demoScenarios = [
    {
      id: 'stayback_cancel',
      title: 'Stay-back Cancel',
      category: 'Weather & Safety',
      icon: Clock,
      prompt: 'Stay-back cancelled today due to unexpected weather. All students will take regular 2:15 PM buses home.',
      tone: 'Warm',
      timeSaved: '18 minutes',
      sampleRecipient: {
        studentName: 'Aarav Sharma',
        gender: 'Male',
        busRoute: 'Bus 14',
        busStop: 'Al Barsha 1, Street 23',
        guardianName: 'Rajesh Sharma',
        guardianSalutation: 'Mr.',
        email: 'rajesh.sharma@example.com',
        whatsappNumber: '+971501234567',
        emailSubject: 'Important Notice: Stay-back Cancelled for Aarav Sharma Today',
        emailBodyHtml: `<p>Dear Mr. Rajesh Sharma,</p><p>Please note that today's after-school stay-back session for <strong>Aarav Sharma</strong> has been cancelled due to weather precautions.</p><p>Aarav will board regular afternoon <strong>Bus 14</strong> at 2:15 PM and arrive at your designated stop (Al Barsha 1, Street 23) at standard timings.</p><p>Kindly ensure someone is present to receive Aarav.</p><p>Warm regards,<br/><strong>Vihaan Bhandari</strong><br/>Class Teacher, Grade 11-A<br/>GEMS Our Own Indian School</p>`,
        whatsappText: `*GEMS OOIS Alert:* Dear Mr. Rajesh Sharma, please note that today's stay-back for *Aarav Sharma* is CANCELLED. Aarav will take regular Bus 14 home at 2:15 PM. - Mr. Vihaan`
      }
    },
    {
      id: 'bus_delay',
      title: 'Bus Delay Alert',
      category: 'Logistics',
      icon: Bus,
      prompt: 'Bus 14 is experiencing a 25-minute delay due to heavy congestion along Al Khail Road. ETA updated to 3:45 PM.',
      tone: 'Firm',
      timeSaved: '25 minutes',
      sampleRecipient: {
        studentName: 'Diya Patel',
        gender: 'Female',
        busRoute: 'Bus 14',
        busStop: 'Tecom Block B',
        guardianName: 'Pooja Patel',
        guardianSalutation: 'Mrs.',
        email: 'pooja.patel@example.com',
        whatsappNumber: '+971502345678',
        emailSubject: 'Transport Update: Bus 14 Delayed 25 Minutes - ETA 3:45 PM',
        emailBodyHtml: `<p>Dear Mrs. Pooja Patel,</p><p>This is an urgent transport notice regarding <strong>Bus 14</strong> carrying <strong>Diya Patel</strong>.</p><p>Due to severe traffic congestion on Al Khail Road, the bus is delayed by approximately 25 minutes. Updated drop-off time at Tecom Block B is now estimated at <strong>3:45 PM</strong>.</p><p>The transport supervisor is monitoring the route via STS GPS tracking.</p><p>Warm regards,<br/><strong>Vihaan Bhandari</strong><br/>Grade 11-A Lead<br/>GEMS Our Own Indian School</p>`,
        whatsappText: `*GEMS Transport Alert:* Bus 14 is delayed ~25 mins due to Al Khail traffic. New ETA for *Diya Patel* at Tecom Block B is *3:45 PM*. Driver & supervisor are in transit.`
      }
    },
    {
      id: 'remedial_class',
      title: 'Remedial Class Notice',
      category: 'Academic Intervention',
      icon: BookOpen,
      prompt: 'Mandatory remedial support session for Mathematics this Thursday from 2:30 PM to 3:30 PM in Room 204.',
      tone: 'Institutional',
      timeSaved: '32 minutes',
      sampleRecipient: {
        studentName: 'Rohan Verma',
        gender: 'Male',
        busRoute: 'Bus 08',
        busStop: 'Karama Post Office',
        guardianName: 'Sunil Verma',
        guardianSalutation: 'Mr.',
        email: 'sunil.verma@example.com',
        whatsappNumber: '+971503456789',
        emailSubject: 'Academic Support: Mathematics Remedial Session for Rohan Verma',
        emailBodyHtml: `<p>Dear Mr. Sunil Verma,</p><p>Following our recent formative assessment review, we have scheduled a focused Mathematics remedial support session for <strong>Rohan Verma</strong>.</p><p><strong>Session Details:</strong><br/>&bull; Date: This Thursday<br/>&bull; Time: 2:30 PM – 3:30 PM<br/>&bull; Location: Room 204 (Senior Science Block)</p><p>Late transport has been pre-arranged for participating students.</p><p>Sincerely,<br/><strong>Vihaan Bhandari</strong><br/>Grade 11-A Lead &bull; GEMS Our Own Indian School</p>`,
        whatsappText: `*GEMS Academic Support:* Mandatory Math remedial session for *Rohan Verma* scheduled this Thursday 2:30-3:30 PM in Room 204. Late transport provided. - Mr. Vihaan`
      }
    },
    {
      id: 'consent_chase',
      title: 'Field Trip Consent Chase',
      category: 'Compliance',
      icon: AlertCircle,
      prompt: 'Urgent reminder: Field trip consent forms for Dubai Science Park visit are due by tomorrow morning 8:00 AM.',
      tone: 'Firm',
      timeSaved: '40 minutes',
      sampleRecipient: {
        studentName: 'Ananya Rao',
        gender: 'Female',
        busRoute: 'Bus 12',
        busStop: 'Mirdif City Centre',
        guardianName: 'Kavita Rao',
        guardianSalutation: 'Dr.',
        email: 'kavita.rao@example.com',
        whatsappNumber: '+971504567890',
        emailSubject: 'Action Required: Outstanding Field Trip Consent for Ananya Rao',
        emailBodyHtml: `<p>Dear Dr. Kavita Rao,</p><p>This is a priority reminder regarding the upcoming Grade 11-A educational visit to <strong>Dubai Science Park</strong>.</p><p>Our records indicate that the official digital consent slip for <strong>Ananya Rao</strong> remains outstanding. KHDA regulations require signed parental permission prior to departure.</p><p>Please review and submit the consent form before <strong>tomorrow morning, 8:00 AM</strong>.</p><p>Warm regards,<br/><strong>Vihaan Bhandari</strong><br/>GEMS Our Own Indian School</p>`,
        whatsappText: `*URGENT GEMS REMINDER:* Please submit the Dubai Science Park consent slip for *Ananya Rao* by tomorrow 8:00 AM to enable participation. KHDA compliance required. - Mr. Vihaan`
      }
    },
    {
      id: 'star_praise',
      title: 'Star Student Commendation',
      category: 'Student Well-being',
      icon: Award,
      prompt: 'Delighted to share that your child received the Star Student of the Week commendation for exemplary leadership!',
      tone: 'Warm',
      timeSaved: '15 minutes',
      sampleRecipient: {
        studentName: 'Zayd Khan',
        gender: 'Male',
        busRoute: 'Bus 14',
        busStop: 'Silicon Oasis Gate 2',
        guardianName: 'Tariq Khan',
        guardianSalutation: 'Mr.',
        email: 'tariq.khan@example.com',
        whatsappNumber: '+971505678901',
        emailSubject: '🌟 Commendation: Zayd Khan Awarded Star Student of the Week!',
        emailBodyHtml: `<p>Dear Mr. Tariq Khan,</p><p>It is with great pleasure that I write to celebrate <strong>Zayd Khan</strong> today!</p><p>Zayd has been awarded the <strong>Grade 11-A Star Student of the Week</strong> commendation in recognition of exemplary academic initiative and peer mentorship in Physics lab.</p><p>Thank you for your ongoing partnership and support.</p><p>With warmest regards,<br/><strong>Vihaan Bhandari</strong><br/>Class Teacher, Grade 11-A<br/>GEMS Our Own Indian School</p>`,
        whatsappText: `🌟 *GEMS Commendation:* Congratulations! *Zayd Khan* has been recognized as Star Student of the Week for outstanding leadership and mentorship in Grade 11-A! Proud moment! - Mr. Vihaan`
      }
    }
  ];

  const currentScenario = demoScenarios.find((s) => s.id === activeScenarioId) || demoScenarios[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Hero Showcase */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-3 mb-4">
            <GemsCrest size={48} />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Executive Product Demonstration
              </span>
              <p className="text-xs text-slate-400">GEMS Education AI Parent Communication Co-Pilot</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            How TeacherPilot Transforms Routine Parent Broadcasts
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Teachers write a single natural sentence. TeacherPilot queries classroom database filters, generates personalized official HTML emails and WhatsApp flash alerts, and guarantees complete 1-to-1 privacy with an automatic 10-second safety undo window.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/compose"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center space-x-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch Live Composer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/onboarding"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors border border-slate-700 flex items-center space-x-2"
            >
              <span>Setup Guide (3 mins)</span>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Value Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">4.2 Hours / Wk</div>
            <p className="text-xs text-gray-500">Teacher administrative time saved</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">100% Compliant</div>
            <p className="text-xs text-gray-500">UAE PDPL & 1-to-1 Parent Isolation</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">10s Safety Undo</div>
            <p className="text-xs text-gray-500">Accidental dispatch prevention</p>
          </div>
        </div>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Select Live Demo Scenario
          </span>
          <span className="text-xs text-gems-green font-semibold">
            Time saved: {currentScenario.timeSaved}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {demoScenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = sc.id === activeScenarioId;

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenarioId(sc.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-gems-green bg-gems-green text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50/70 hover:bg-white text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-gems-green'}`} />
                  <span className="font-bold text-xs truncate">{sc.title}</span>
                </div>
                <p className={`text-[10px] mt-1 truncate ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {sc.category}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Teacher Prompt Transformation Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-bold uppercase tracking-wider text-gray-700">Teacher Raw Prompt Input</span>
          </div>
          <span className="text-gray-400">Tone: <strong>{currentScenario.tone}</strong></span>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono text-xs text-gray-800 leading-relaxed">
          &ldquo;{currentScenario.prompt}&rdquo;
        </div>
      </div>

      {/* Dual Channel Live Preview Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        {/* Left Frame: HTML Email */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                Channel 1: Official GEMS HTML Email
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">DKIM Authenticated</span>
          </div>
          <div className="flex-1">
            <EmailPreviewFrame recipient={currentScenario.sampleRecipient} />
          </div>
        </div>

        {/* Right Frame: WhatsApp Flash */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-[#25D366]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                Channel 2: Instant WhatsApp Notice
              </h3>
            </div>
            <span className="text-[11px] text-gray-400">Mudslide &bull; 1-to-1 Chat</span>
          </div>
          <div className="flex-1">
            <WhatsAppBubble recipient={currentScenario.sampleRecipient} />
          </div>
        </div>
      </div>
    </div>
  );
}
