'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, User, Users, CheckCircle } from 'lucide-react';
import { RecipientItem } from './RecipientPills';

interface StudentSelectorProps {
  recipients: RecipientItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function StudentSelector({
  recipients,
  selectedIndex,
  onSelect
}: StudentSelectorProps) {
  if (!recipients || recipients.length === 0) return null;

  const current = recipients[selectedIndex] || recipients[0];

  const handlePrev = () => {
    if (selectedIndex > 0) {
      onSelect(selectedIndex - 1);
    } else {
      onSelect(recipients.length - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < recipients.length - 1) {
      onSelect(selectedIndex + 1);
    } else {
      onSelect(0);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Left: Summary and Select Dropdown */}
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <div className="w-8 h-8 rounded-lg bg-gems-green/10 text-gems-green flex items-center justify-center font-bold text-xs flex-shrink-0">
          {selectedIndex + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 font-medium">Recipient Preview:</span>
            <span className="text-xs font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">
              {selectedIndex + 1} of {recipients.length}
            </span>
          </div>
          <div className="mt-1">
            <select
              value={selectedIndex}
              onChange={(e) => onSelect(Number(e.target.value))}
              aria-label="Select student recipient"
              className="w-full text-xs font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-gems-green"
            >
              {recipients.map((rec, idx) => (
                <option key={rec.studentId || idx} value={idx}>
                  {rec.studentName} — Parent: {rec.guardianName || 'Guardian'} {rec.busRoute ? `(${rec.busRoute})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center: Active Recipient Highlights */}
      <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600 border-x border-gray-100 px-4">
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Student</span>
          <span className="font-semibold text-gray-900">{current.studentName}</span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px] uppercase font-semibold">Guardian</span>
          <span className="font-semibold text-gray-800">{current.guardianName}</span>
        </div>
        {current.busRoute && (
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Route</span>
            <span className="font-semibold text-amber-700">{current.busRoute}</span>
          </div>
        )}
      </div>

      {/* Right: Prev / Next Navigation Controls */}
      <div className="flex items-center space-x-1 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center space-x-1 text-xs"
          title="Previous Recipient"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors flex items-center space-x-1 text-xs"
          title="Next Recipient"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
