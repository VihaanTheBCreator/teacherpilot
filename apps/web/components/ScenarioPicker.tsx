'use client';

import React from 'react';
import { Clock, Bus, BookOpen, AlertCircle, Award } from 'lucide-react';

export interface ScenarioPreset {
  id: string;
  name: string;
  scenarioKey: string;
  icon: React.ReactNode;
  prompt: string;
  suggestedTone: 'Warm' | 'Firm' | 'Institutional';
  description: string;
  badge: string;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'stayback_cancel',
    name: 'Stay-back Cancel',
    scenarioKey: 'stayback_cancel',
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    prompt: 'Stay-back cancelled today due to unexpected weather. All students will take regular 2:15 PM buses home.',
    suggestedTone: 'Warm',
    description: 'Alert parents of students staying back about early departure.',
    badge: 'Weather & Safety'
  },
  {
    id: 'bus_delay',
    name: 'Bus Delay',
    scenarioKey: 'bus_delay',
    icon: <Bus className="w-5 h-5 text-emerald-600" />,
    prompt: 'Bus 14 is experiencing a 25-minute delay due to heavy congestion along Al Khail Road. ETA updated to 3:45 PM.',
    suggestedTone: 'Firm',
    description: 'Notify parents whose children commute on Bus 14 route.',
    badge: 'Transport Alert'
  },
  {
    id: 'remedial_class',
    name: 'Remedial Class',
    scenarioKey: 'remedial_class',
    icon: <BookOpen className="w-5 h-5 text-blue-600" />,
    prompt: 'Mandatory remedial support session for Mathematics this Thursday from 2:30 PM to 3:30 PM in Room 204.',
    suggestedTone: 'Institutional',
    description: 'Targeted academic intervention for students needing extra practice.',
    badge: 'Academic Support'
  },
  {
    id: 'consent_chase',
    name: 'Consent Chase',
    scenarioKey: 'consent_chase',
    icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
    prompt: 'Urgent reminder: Field trip consent forms for Dubai Science Park visit are due by tomorrow morning 8:00 AM.',
    suggestedTone: 'Firm',
    description: 'Follow-up with guardians who have pending or overdue consents.',
    badge: 'Action Required'
  },
  {
    id: 'star_praise',
    name: 'Star Praise',
    scenarioKey: 'star_praise',
    icon: <Award className="w-5 h-5 text-amber-500" />,
    prompt: 'Delighted to share that your child received the Star Student of the Week commendation for exemplary leadership!',
    suggestedTone: 'Warm',
    description: 'Positive behavioral and academic recognition sent directly to proud parents.',
    badge: 'Commendation'
  }
];

interface ScenarioPickerProps {
  selectedId?: string;
  onSelect: (preset: ScenarioPreset) => void;
}

export default function ScenarioPicker({ selectedId, onSelect }: ScenarioPickerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">
          Preset Scenario Shortcuts
        </label>
        <span className="text-xs text-gray-500">Click to autofill prompt & tone</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SCENARIO_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between h-full group ${
                isSelected
                  ? 'border-gems-green bg-gems-green/5 shadow-sm ring-1 ring-gems-green'
                  : 'border-gray-200 bg-white hover:border-gems-green/50 hover:bg-gray-50/80 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-gems-green/10' : 'bg-gray-100 group-hover:bg-gems-green/10'}`}>
                    {preset.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {preset.badge}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{preset.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{preset.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Tone: <strong className="text-gray-700">{preset.suggestedTone}</strong></span>
                <span className="text-gems-green font-medium group-hover:translate-x-0.5 transition-transform">Use &rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
