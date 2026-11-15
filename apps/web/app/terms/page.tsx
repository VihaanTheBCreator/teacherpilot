import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-slide-up">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <Link href="/compose" className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center space-x-2.5">
          <GemsCrest size={32} />
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Terms of Educational Service</h1>
            <p className="text-xs text-slate-500">Official Terms of Use for GEMS Education Teachers &amp; Staff</p>
          </div>
        </div>
      </div>

      <div className="saas-card rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. Acceptable Educational Use</h2>
          <p>
            TeacherPilot is provided to accelerate classroom and transportation logistics. Teachers agree to utilize the platform in adherence to GEMS Professional Conduct Guidelines and KHDA educator standards.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Situation-Behavior-Impact (SBI) Safeguards</h2>
          <p>
            Communications generated via the platform are automatically reviewed to ensure objective, constructive language. Accusatory, emotive, or defamatory phrasing is strictly filtered to foster respectful home-school partnerships.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">3. 10-Second Undo Window</h2>
          <p>
            Every broadcast includes a mandatory 10-second grace cancellation window. Teachers are strongly encouraged to inspect the preview screen before final dispatch.
          </p>
        </section>
      </div>
    </div>
  );
}
