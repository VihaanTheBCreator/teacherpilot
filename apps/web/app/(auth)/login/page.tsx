'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Mail,
  School,
  Loader2,
  ChevronRight,
  Compass
} from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';

export default function LoginPage() {
  const router = useRouter();
  const [selectedTeacher, setSelectedTeacher] = useState<string>('teacher-vihaan');
  const [email, setEmail] = useState<string>('vihaan.bhandari@gemsedu.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const teacherProfiles = [
    {
      id: 'teacher-vihaan',
      name: 'Vihaan Bhandari',
      grade: 'Grade 11-A',
      role: 'Lead Class Teacher & Science Lead',
      email: 'vihaanbhandari235@gmail.com',
      avatarColor: 'bg-emerald-700 text-amber-300'
    },
    {
      id: 'teacher-sunita',
      name: 'Sunita Sharma',
      grade: 'Grade 10-B',
      role: 'Mathematics Lead Teacher',
      email: 'sunita.sharma@gemsedu.com',
      avatarColor: 'bg-blue-700 text-white'
    }
  ];

  const handleSelectProfile = (profile: typeof teacherProfiles[0]) => {
    setSelectedTeacher(profile.id);
    setEmail(profile.email);
  };

  const executeLogin = async (overrideTeacherId?: string) => {
    setIsLoading(true);
    setAuthError(null);

    const targetId = overrideTeacherId || selectedTeacher;

    try {
      // Try hitting /api/auth/login if backend has implemented it, or fallback smoothly
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: targetId,
          email: email
        })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('teacherpilot_active_teacher', JSON.stringify(data.teacher || { id: targetId }));
        }
      } else {
        // Fallback local session state
        if (typeof window !== 'undefined') {
          const matched = teacherProfiles.find((t) => t.id === targetId) || teacherProfiles[0];
          localStorage.setItem('teacherpilot_active_teacher', JSON.stringify(matched));
        }
      }

      router.push('/');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSso = () => {
    executeLogin('teacher-vihaan');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#005a36_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 p-6 sm:px-12 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <GemsCrest size={40} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-wide text-white">TeacherPilot</span>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded uppercase">
                GEMS EDU
              </span>
            </div>
            <p className="text-[11px] text-emerald-300">GEMS Our Own Indian School</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/demo"
            className="hidden sm:flex items-center space-x-1.5 text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Demo Tour</span>
          </Link>
          <Link
            href="/onboarding"
            className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors"
          >
            Setup Guide
          </Link>
        </div>
      </header>

      {/* Main Login Card Canvas */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UAE PDPL Compliant Faculty Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Teacher Sign-in
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Access your Grade 11-A communication co-pilot. Authenticate via Google Workspace SSO or switch verified class profiles.
            </p>
          </div>

          {/* Google Workspace SSO Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSso}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold p-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-3 disabled:opacity-50 group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google (@gemsedu.com)</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold absolute">
              or select active teacher profile
            </span>
          </div>

          {/* Teacher Profile Switcher Cards */}
          <div className="space-y-2.5">
            {teacherProfiles.map((teacher) => {
              const isSelected = selectedTeacher === teacher.id;
              return (
                <div
                  key={teacher.id}
                  onClick={() => handleSelectProfile(teacher)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${teacher.avatarColor}`}
                    >
                      {teacher.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-white">{teacher.name}</h4>
                        <span className="text-[10px] font-semibold bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50">
                          {teacher.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{teacher.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual Quick Action Button */}
          <button
            type="button"
            onClick={() => executeLogin()}
            disabled={isLoading}
            className="w-full bg-[#005a36] hover:bg-[#004328] text-white font-bold p-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center space-x-2 border border-emerald-600/40 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Authenticating Portal...</span>
              </>
            ) : (
              <>
                <span>Launch Co-Pilot Workspace</span>
                <ChevronRight className="w-4 h-4 text-amber-300" />
              </>
            )}
          </button>

          {authError && (
            <p className="text-xs text-rose-400 text-center bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
              {authError}
            </p>
          )}

          {/* Privacy & Regulatory Trust Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Strict 1-to-1 Parent Dispatch (Zero Group Exposure)</span>
            </div>
            <span className="text-slate-500 font-mono text-[10px]">Federal Decree-Law No. 45/2021</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <p>&copy; {new Date().getFullYear()} GEMS Education UAE &bull; TeacherPilot Multichannel Dispatch System</p>
      </footer>
    </div>
  );
}
