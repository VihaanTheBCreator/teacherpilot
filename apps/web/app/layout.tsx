'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import {
  Send,
  Users,
  Clock,
  Sparkles,
  Settings,
  Menu,
  X,
  Compass,
  ShieldCheck,
  ChevronRight,
  LogOut,
  HelpCircle
} from 'lucide-react';
import GemsCrest from '@/components/GemsCrest';
import PwaInstallBanner from '@/components/PwaInstallBanner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render clean standalone layout
  const isLoginPage = pathname === '/login';

  // 3 Primary High-Level Actions for Teachers
  const primaryTabs = [
    { name: 'Send Alert', href: '/compose', icon: Send, description: 'Message all parents in 1 tap' },
    { name: 'My Class', href: '/roster', icon: Users, description: 'Students, buses & contacts' },
    { name: 'History', href: '/campaigns', icon: Clock, description: 'Delivery & read receipts' },
  ];

  const secondaryTabs = [
    { name: 'Quick Demo', href: '/demo', icon: Compass },
    { name: 'Setup Guide', href: '/onboarding', icon: Sparkles },
    { name: 'Settings & WhatsApp', href: '/settings', icon: Settings },
  ];

  return (
    <html lang="en">
      <head>
        <title>TeacherPilot — One-Tap Parent Alerts</title>
        <meta name="description" content="AI Communication Co-pilot for GEMS Teachers" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#005a36" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TeacherPilot" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col md:flex-row">
        {isLoginPage ? (
          <main className="w-full min-h-screen">{children}</main>
        ) : (
          <>
            {/* Mobile Header */}
            <header className="md:hidden bg-[#005a36] text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-emerald-950/40 shadow-sm">
              <Link href="/compose" className="flex items-center space-x-2.5">
                <GemsCrest size={32} />
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white block">TeacherPilot</span>
                  <span className="text-[10px] text-emerald-200/90 font-medium block">GEMS Our Own Indian School</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all saas-button"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </header>

            {/* Desktop Left Sidebar (High-End SaaS Navigation) */}
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#005a36] text-white flex flex-col justify-between transform transition-transform duration-300 ease-out md:translate-x-0 md:static md:w-72 md:min-h-screen shadow-xl ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex flex-col h-full justify-between p-5">
                {/* Brand Header */}
                <div>
                  <Link
                    href="/compose"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 pb-5 border-b border-emerald-800/60 group"
                  >
                    <GemsCrest size={40} />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-base tracking-tight text-white">TeacherPilot</span>
                        <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          GEMS
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-200/90 font-medium truncate">Grade 11-A Official Portal</p>
                    </div>
                  </Link>

                  {/* Active Teacher Badge */}
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-700/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow-inner">
                        VB
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">Vihaan Bhandari</p>
                        <p className="text-[10px] text-emerald-300 truncate">Class Teacher &bull; 11-A</p>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="text-[10px] text-emerald-300 hover:text-white underline"
                      title="Switch teacher account"
                    >
                      Switch
                    </Link>
                  </div>

                  {/* Primary Action Tabs */}
                  <div className="mt-6">
                    <p className="text-[10px] font-bold tracking-wider text-emerald-300/80 uppercase px-3 mb-2">
                      Main Actions
                    </p>
                    <nav className="space-y-1.5">
                      {primaryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href || (tab.href === '/compose' && pathname === '/');
                        return (
                          <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all saas-button ${
                              isActive
                                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 translate-x-1'
                                : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  isActive ? 'bg-slate-950/10 text-slate-950' : 'bg-white/10 text-emerald-200'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="block text-xs font-bold leading-tight">{tab.name}</span>
                                <span
                                  className={`block text-[10px] font-normal leading-tight mt-0.5 ${
                                    isActive ? 'text-slate-800' : 'text-emerald-300/70'
                                  }`}
                                >
                                  {tab.description}
                                </span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-emerald-400/50'}`}
                            />
                          </Link>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Secondary Resources */}
                  <div className="mt-6 pt-5 border-t border-emerald-800/60">
                    <p className="text-[10px] font-bold tracking-wider text-emerald-300/80 uppercase px-3 mb-2">
                      Tools & Guide
                    </p>
                    <nav className="space-y-1">
                      {secondaryTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;
                        return (
                          <Link
                            key={tab.name}
                            href={tab.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                              isActive ? 'bg-white/15 text-white font-bold' : 'text-emerald-200/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-emerald-300" />
                            <span>{tab.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Footer Security Badge & Privacy */}
                <div className="pt-4 border-t border-emerald-800/60 space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-emerald-300/80 px-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>UAE PDPL Private Mode (No CC/BCC)</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-400/60 px-1">
                    <Link href="/privacy" className="hover:text-emerald-200 underline">Privacy Policy</Link>
                    <span>&bull;</span>
                    <Link href="/terms" className="hover:text-emerald-200 underline">Terms</Link>
                    <span>&bull;</span>
                    <span>v2.4 Prod</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile backdrop */}
            {mobileMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}

            {/* Main Application Canvas */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
              {/* Top Banner Alert for Mobile Install */}
              <PwaInstallBanner />

              <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
                {children}
              </div>
            </main>
          </>
        )}
      </body>
    </html>
  );
}
