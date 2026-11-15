'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  SendHorizontal,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Bus,
  Award,
  ChevronRight,
  TrendingUp,
  Mail,
  MessageSquare
} from 'lucide-react';

interface CampaignSummary {
  id: string;
  createdAt: string;
  scenario: string;
  tone: string;
  prompt: string;
  status: string;
  totalRecipients: number;
  emailSentCount: number;
  whatsappSentCount: number;
}

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [pendingConsents, setPendingConsents] = useState<number>(0);
  const [remedialCount, setRemedialCount] = useState<number>(0);
  const [stayBackCount, setStayBackCount] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rosterRes, campRes] = await Promise.all([
          fetch('/api/roster').then((r) => r.json()).catch(() => ({ students: [] })),
          fetch('/api/campaigns').then((r) => r.json()).catch(() => ({ campaigns: [] }))
        ]);

        const students = rosterRes.students || [];
        setTotalStudents(students.length);
        setPendingConsents(students.filter((s: any) => s.consentStatus === 'PENDING' || !s.consentStatus).length);
        setRemedialCount(students.filter((s: any) => s.remedial).length);
        setStayBackCount(students.filter((s: any) => s.stayBack).length);

        setCampaigns(campRes.campaigns || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCampaigns = campaigns.length;
  const recentCampaigns = campaigns.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_UNDO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 mr-1 animate-spin" /> In 10s Grace Window
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled (Undone)
          </span>
        );
      case 'SENT':
      case 'COMPLETED':
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Dispatched
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const getScenarioLabel = (key: string) => {
    const map: Record<string, string> = {
      stayback_cancel: 'Stay-back Cancel',
      bus_delay: 'Bus Delay',
      remedial_class: 'Remedial Class',
      consent_chase: 'Consent Chase',
      star_praise: 'Star Praise'
    };
    return map[key] || key || 'Custom Dispatch';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#005a36] via-[#046c43] to-[#004328] text-white p-6 sm:p-8 shadow-lg border border-emerald-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multichannel Communication Co-Pilot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Mr. Vihaan Bhandari
          </h2>
          <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
            Grade 11-A class communications are running seamlessly. Broadcast personalized alerts across GEMS official HTML emails and instant WhatsApp flash messages with automated safety guardrails.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/compose"
              className="bg-[#f5a623] hover:bg-[#d48810] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Compose New Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/roster"
              className="bg-white/15 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/20 flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Manage Student Roster</span>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 opacity-10 hidden lg:block">
          <span className="font-serif font-black text-[180px] leading-none text-white select-none">G</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : totalStudents}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Grade 11-A Class Roster</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-gems-green flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaigns Sent</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? '...' : totalCampaigns}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Dispatched to parents</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <SendHorizontal className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Consents</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {loading ? '...' : pendingConsents}
            </h3>
            <p className="text-xs text-rose-500 font-medium mt-1">Awaiting guardian sign-off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remedial Focus</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {loading ? '...' : remedialCount}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Active support track</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 5 Scenario Shortcuts Quick Launcher */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Instant Scenario Launchers</h3>
            <p className="text-xs text-gray-500">Pick a routine communication pattern to auto-populate the composer</p>
          </div>
          <Link href="/compose" className="text-xs font-semibold text-gems-green hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            href="/compose?scenario=stayback_cancel"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-gems-green hover:bg-gems-green/5 transition-all text-left flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Stay-back Cancel</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Alert parents of early dismissal & bus boarding</p>
            </div>
            <span className="text-[11px] font-semibold text-gems-green mt-3 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Launch &rarr;
            </span>
          </Link>

          <Link
            href="/compose?scenario=bus_delay"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-gems-green hover:bg-gems-green/5 transition-all text-left flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                <Bus className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Bus Delay</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Broadcast ETA updates for congested routes</p>
            </div>
            <span className="text-[11px] font-semibold text-gems-green mt-3 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Launch &rarr;
            </span>
          </Link>

          <Link
            href="/compose?scenario=remedial_class"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-gems-green hover:bg-gems-green/5 transition-all text-left flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Remedial Class</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Schedule academic support session for students</p>
            </div>
            <span className="text-[11px] font-semibold text-gems-green mt-3 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Launch &rarr;
            </span>
          </Link>

          <Link
            href="/compose?scenario=consent_chase"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-gems-green hover:bg-gems-green/5 transition-all text-left flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center mb-2.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Consent Chase</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Urgent reminders for outstanding slips</p>
            </div>
            <span className="text-[11px] font-semibold text-gems-green mt-3 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Launch &rarr;
            </span>
          </Link>

          <Link
            href="/compose?scenario=star_praise"
            className="p-3.5 rounded-xl border border-gray-200 hover:border-gems-green hover:bg-gems-green/5 transition-all text-left flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Star Praise</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Celebrate exemplary student achievements</p>
            </div>
            <span className="text-[11px] font-semibold text-gems-green mt-3 group-hover:translate-x-0.5 transition-transform inline-flex items-center">
              Launch &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Campaign Log */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Communication Campaigns</h3>
            <p className="text-xs text-gray-500">Live delivery statuses across Email and WhatsApp</p>
          </div>
          <Link href="/campaigns" className="text-xs font-semibold text-gems-green hover:underline flex items-center space-x-1">
            <span>View Full Audit Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading campaign history...</div>
        ) : recentCampaigns.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <SendHorizontal className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No campaigns dispatched yet</p>
            <p className="text-xs text-gray-400 mt-1">Start by composing your first communication</p>
            <Link
              href="/compose"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-gems-green mt-3 hover:underline"
            >
              <span>Compose now</span> &rarr;
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{getScenarioLabel(c.scenario)}</span>
                      <p className="text-gray-400 text-[11px] truncate max-w-xs">{c.prompt}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-gray-800">{c.totalRecipients} parents</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/campaigns`}
                        className="text-gems-green font-semibold hover:underline"
                      >
                        Inspect &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
