'use client';

import React, { useState } from 'react';
import { Users, X, ChevronDown, ChevronUp, UserCheck, Mail, Phone, Bus } from 'lucide-react';

export interface RecipientItem {
  studentId?: string;
  studentName: string;
  gender?: string;
  transport?: string;
  busRoute?: string;
  busStop?: string;
  stayBack?: boolean;
  remedial?: boolean;
  consentStatus?: string;
  guardianId?: string;
  guardianName?: string;
  guardianSalutation?: string;
  email?: string;
  whatsappNumber?: string;
  emailSubject?: string;
  emailBodyHtml?: string;
  whatsappText?: string;
}

interface RecipientPillsProps {
  recipients: RecipientItem[];
  onRemove?: (index: number) => void;
  title?: string;
  subtext?: string;
}

export default function RecipientPills({
  recipients,
  onRemove,
  title = 'Matched Recipients',
  subtext
}: RecipientPillsProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const filteredRecipients = recipients.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.guardianName?.toLowerCase().includes(q) ||
      r.busRoute?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q)
    );
  });

  if (!recipients || recipients.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
        <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm font-medium">No recipients selected yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Type a prompt or choose a preset scenario to auto-target students
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-gems-green/10 flex items-center justify-center text-gems-green">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gems-green text-white">
                {recipients.length} Parents
              </span>
            </div>
            {subtext && <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {recipients.length > 5 && (
            <input
              type="text"
              placeholder="Filter recipients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gems-green"
            />
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pt-1 pr-1">
          {filteredRecipients.map((rec, idx) => {
            return (
              <div
                key={rec.studentId || idx}
                className="inline-flex items-center space-x-2 bg-gems-green-subtle/60 border border-gems-green/20 text-gray-800 text-xs px-3 py-1.5 rounded-full hover:bg-gems-green-subtle transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-gems-green flex-shrink-0" />
                <span className="font-medium text-gray-900">{rec.studentName}</span>
                <span className="text-gray-400 text-[11px]">&bull;</span>
                <span className="text-gray-600 text-[11px]">{rec.guardianName || 'Guardian'}</span>

                {rec.busRoute && (
                  <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                    <Bus className="w-2.5 h-2.5 mr-0.5" /> {rec.busRoute}
                  </span>
                )}

                {rec.stayBack && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                    Stay-back
                  </span>
                )}

                {rec.remedial && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                    Remedial
                  </span>
                )}

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="ml-1 text-gray-400 hover:text-rose-500 rounded-full p-0.5 hover:bg-rose-50 transition-colors"
                    title={`Remove ${rec.studentName}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
