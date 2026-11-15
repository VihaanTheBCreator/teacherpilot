'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SendHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  User,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface CampaignRecipient {
  id: string;
  guardianId: string;
  emailSubject?: string;
  emailBodyHtml?: string;
  whatsappText?: string;
  emailStatus: string;
  whatsappStatus: string;
  sentAt?: string;
  guardian?: {
    name?: string;
    email?: string;
    whatsappNumber?: string;
    student?: {
      name?: string;
      busRoute?: string;
    };
  };
}

interface Campaign {
  id: string;
  createdAt: string;
  scenario: string;
  tone: string;
  prompt: string;
  status: string;
  totalRecipients: number;
  emailSentCount: number;
  whatsappSentCount: number;
  emailFailedCount: number;
  whatsappFailedCount: number;
  recipients: CampaignRecipient[];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_UNDO':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 mr-1 animate-spin" /> In 10s Grace Window
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancelled (Undone)
          </span>
        );
      case 'SENT':
      case 'COMPLETED':
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Dispatched
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'DISPATCHED' && c.status !== 'SENT' && c.status !== 'COMPLETED' && c.status !== 'DISPATCHED') {
        return false;
      }
      if (filterStatus === 'WAITING_UNDO' && c.status !== 'WAITING_UNDO') {
        return false;
      }
      if (filterStatus === 'CANCELLED' && c.status !== 'CANCELLED') {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchPrompt = c.prompt?.toLowerCase().includes(q);
      const matchScenario = c.scenario?.toLowerCase().includes(q);
      const matchId = c.id?.toLowerCase().includes(q);
      return matchPrompt || matchScenario || matchId;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Campaign Dispatch Audit Log</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gems-green/10 text-gems-green">
              {campaigns.length} Recorded
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Complete compliance trail of all parent broadcasts, verification timestamps, and per-channel delivery receipts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={fetchCampaigns}
            className="p-2 text-gray-500 hover:text-gray-800 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            title="Refresh Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/compose"
            className="bg-gems-green hover:bg-gems-green-dark text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>New Broadcast</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Broadcasts ({campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('DISPATCHED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'DISPATCHED'
                ? 'bg-gems-green text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Dispatched ({campaigns.filter((c) => c.status === 'SENT' || c.status === 'COMPLETED' || c.status === 'DISPATCHED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('WAITING_UNDO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'WAITING_UNDO'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            In Grace Period ({campaigns.filter((c) => c.status === 'WAITING_UNDO').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('CANCELLED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'CANCELLED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Cancelled ({campaigns.filter((c) => c.status === 'CANCELLED').length})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by keyword or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gems-green focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gems-green mb-2" />
            <span>Loading campaign records...</span>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <SendHorizontal className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No campaigns found</p>
            <p className="text-xs text-gray-400 mt-1">Dispatches appear here immediately upon sending</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-10"></th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Scenario / Intent</th>
                  <th className="py-3 px-4">Tone</th>
                  <th className="py-3 px-4">Recipients</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4 text-right">Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampaigns.map((c) => {
                  const isExpanded = expandedId === c.id;
                  return (
                    <React.Fragment key={c.id}>
                      <tr
                        onClick={() => toggleExpand(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-emerald-50/40' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gems-green" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {new Date(c.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 capitalize">
                            {c.scenario?.replace(/_/g, ' ') || 'Broadcast'}
                          </div>
                          <p className="text-gray-500 text-[11px] truncate max-w-sm">
                            {c.prompt}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                            {c.tone || 'Warm'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-800">{c.totalRecipients} Guardians</div>
                          <div className="text-[10px] text-gray-400 space-x-1.5 mt-0.5">
                            <span className="text-emerald-700 font-medium">✉ {c.emailSentCount || c.totalRecipients} Email</span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-medium">💬 {c.whatsappSentCount || c.totalRecipients} WA</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(c.id);
                            }}
                            className="text-gems-green font-semibold hover:underline"
                          >
                            {isExpanded ? 'Hide' : 'Inspect'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Per-Parent Breakdown */}
                      {isExpanded && (
                        <tr className="bg-slate-50 border-y border-emerald-100">
                          <td colSpan={7} className="p-4 sm:p-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center space-x-2">
                                  <span>Per-Parent Recipient Audit Trail</span>
                                  <span className="font-mono text-gray-400 font-normal">({c.id})</span>
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {c.recipients?.length || 0} Delivered Recipients
                                </span>
                              </div>

                              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold border-b border-gray-200">
                                    <tr>
                                      <th className="py-2.5 px-3">Parent Name</th>
                                      <th className="py-2.5 px-3">Email Channel</th>
                                      <th className="py-2.5 px-3">WhatsApp Channel</th>
                                      <th className="py-2.5 px-3">Subject Snippet</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 text-[11px]">
                                    {c.recipients && c.recipients.length > 0 ? (
                                      c.recipients.map((rec, rIdx) => (
                                        <tr key={rec.id || rIdx} className="hover:bg-gray-50/50">
                                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                                            {rec.guardian?.name || `Guardian ${rIdx + 1}`}
                                            {rec.guardian?.student?.name && (
                                              <span className="text-gray-400 font-normal ml-1">
                                                (Ward: {rec.guardian.student.name})
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-medium ${
                                              rec.emailStatus === 'FAILED'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                              <Mail className="w-3 h-3" />
                                              <span>{rec.emailStatus || 'SENT'}</span>
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full font-medium ${
                                              rec.whatsappStatus === 'FAILED'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                              <MessageSquare className="w-3 h-3" />
                                              <span>{rec.whatsappStatus || 'SENT'}</span>
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-gray-600 truncate max-w-xs font-mono text-[10px]">
                                            {rec.emailSubject || c.prompt}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-400">
                                          No individual recipient records available for this entry.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
