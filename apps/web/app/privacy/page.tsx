import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock, Database, Clock, EyeOff } from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-slide-up">
      {/* Top Bar */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <Link href="/compose" className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center space-x-2.5">
          <GemsCrest size={32} />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Student Data &amp; Privacy Policy</h1>
            <p className="text-xs text-slate-500">Compliance with UAE Federal Decree-Law No. 45/2021 on Personal Data Protection</p>
          </div>
        </div>
      </div>

      {/* Main Highlights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="saas-card rounded-2xl p-5 border-emerald-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Zero Contact Leakage</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Parents never see each other&apos;s phone numbers, names, or emails. All emails and WhatsApp alerts are strictly 1-to-1 isolated.
          </p>
        </div>

        <div className="saas-card rounded-2xl p-5 border-emerald-100">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Encrypted at Rest</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Student roster data, parent WhatsApp numbers, and email logs are encrypted using AES-256 with role-based teacher access controls.
          </p>
        </div>

        <div className="saas-card rounded-2xl p-5 border-emerald-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">90-Day Retention</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Broadcast message logs are retained for 90 days for school verification, after which message contents are automatically purged.
          </p>
        </div>
      </div>

      {/* Full Policy Body */}
      <div className="saas-card rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. Scope and Applicability</h2>
          <p>
            TeacherPilot is designed exclusively for verified GEMS educators, homeroom instructors, and school transport coordinators.
            The system processes student information solely to facilitate safe, emergency, and academic communication between teachers and parents.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Information We Process</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
            <li><strong>Student Identity:</strong> Student Name, Class Section (e.g. Grade 11-A), Transport Mode, Bus Route, and Designated Bus Stop.</li>
            <li><strong>Parent/Guardian Contacts:</strong> Primary Parent Name, Salutation, Email Address, and WhatsApp Mobile Number.</li>
            <li><strong>Operational Tags:</strong> Stay-back session enrollment, remedial class scheduling, and field trip digital consent status.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">3. Zero Advertising &amp; Third-Party Non-Disclosure</h2>
          <p>
            Under no circumstances is student or guardian data sold, rented, or utilized for advertising, profiling, or commercial marketing.
            Information is strictly transmitted via official school channels (GEMS Google Workspace SMTP and teacher-authenticated WhatsApp channels).
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">4. Teacher Responsibilities</h2>
          <p>
            Teachers are required to authenticate using their verified school credentials. Any change in a student&apos;s primary guardian contact details must be promptly reflected via the Class List manager or school administrative registrar.
          </p>
        </section>
      </div>
    </div>
  );
}
