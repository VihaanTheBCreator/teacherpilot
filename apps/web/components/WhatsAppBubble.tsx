'use client';

import React, { useState } from 'react';
import { CheckCheck, Phone, Video, MoreVertical, Paperclip, Mic, Smile, Send, Check, Copy } from 'lucide-react';
import { RecipientItem } from './RecipientPills';
import GemsCrest from './GemsCrest';

interface WhatsAppBubbleProps {
  recipient?: RecipientItem;
  senderName?: string;
}

export default function WhatsAppBubble({
  recipient,
  senderName = 'GEMS OOIS Alert • Mr. Vihaan'
}: WhatsAppBubbleProps) {
  const [copied, setCopied] = useState(false);

  if (!recipient) {
    return (
      <div className="h-full min-h-[460px] flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-400">
        <div>
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCheck className="w-6 h-6" />
          </div>
          <p className="font-medium text-gray-600">No WhatsApp preview</p>
          <p className="text-xs text-gray-400 mt-1">Select a recipient to inspect WhatsApp text</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    if (recipient.whatsappText) {
      navigator.clipboard.writeText(recipient.whatsappText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Format WhatsApp message text: convert *bold* to <strong>, newlines to <br/>
  const formatWhatsAppText = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // replace *text* with strong
      const parts = line.split(/(\*[^*]+\*)/g);
      return (
        <span key={idx} className="block min-h-[1.2em]">
          {parts.map((p, pIdx) => {
            if (p.startsWith('*') && p.endsWith('*')) {
              return <strong key={pIdx} className="font-bold text-gray-900">{p.slice(1, -1)}</strong>;
            }
            return p;
          })}
        </span>
      );
    });
  };

  return (
    <div className="bg-[#EFEAE2] border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* WhatsApp Chat Header */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center p-1 border border-emerald-600">
              <GemsCrest size={30} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#075E54]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-sm leading-tight text-white">{senderName}</span>
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 bg-emerald-400 text-[#075E54] rounded-full text-[9px] font-bold">
                ✓
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 leading-none mt-0.5">
              To: {recipient.guardianName || 'Parent'} ({recipient.whatsappNumber || '+971 50 ***'})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-emerald-100">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-emerald-700/60 transition-colors text-xs flex items-center space-x-1"
            title="Copy WhatsApp text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
          <Video className="w-4 h-4 cursor-pointer hover:text-white" />
          <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Chat Messages Canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end bg-[radial-gradient(#e5ddd5_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Date Stamp Pill */}
        <div className="flex justify-center my-1">
          <span className="bg-white/90 text-gray-600 text-[10px] font-semibold uppercase px-3 py-1 rounded-lg shadow-2xs border border-gray-200/50">
            Today
          </span>
        </div>

        {/* Security / Encryption Notice */}
        <div className="bg-[#FFF8DF] text-[#7A6A40] text-[10px] p-2 rounded-lg text-center max-w-sm mx-auto shadow-2xs border border-[#F4EAC7]">
          🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
        </div>

        {/* Outgoing WhatsApp Bubble */}
        <div className="flex justify-end">
          <div className="relative max-w-[85%] sm:max-w-[78%] bg-[#DCF8C6] rounded-2xl rounded-tr-none px-3.5 py-2.5 shadow-sm border border-emerald-200/60 text-gray-900 text-xs leading-relaxed group">
            {/* Message Body */}
            <div className="whatsapp-body pr-2">
              {formatWhatsAppText(recipient.whatsappText || '')}
            </div>

            {/* Bubble Tail & Metadata */}
            <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-gray-500">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline-block" />
            </div>

            {/* Subtle tail SVG */}
            <div className="absolute top-0 -right-2 w-2 h-3 overflow-hidden">
              <div className="w-3 h-3 bg-[#DCF8C6] border-t border-r border-emerald-200/60 transform rotate-45 -translate-x-1.5 translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Input Mock Bar */}
      <div className="bg-[#F0F2F5] px-3 py-2 border-t border-gray-200 flex items-center space-x-2">
        <Smile className="w-5 h-5 text-gray-500 cursor-pointer" />
        <Paperclip className="w-5 h-5 text-gray-500 cursor-pointer" />
        <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-xs text-gray-400 border border-gray-200">
          Message to {recipient.studentName}&apos;s parent...
        </div>
        <div className="w-8 h-8 rounded-full bg-[#128C7E] text-white flex items-center justify-center">
          <Mic className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
