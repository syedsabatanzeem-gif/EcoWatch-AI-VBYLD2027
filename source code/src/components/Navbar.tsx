import React, { useState } from 'react';
import { Logo } from './Logo.tsx';
import {
  Menu,
  X,
  UploadCloud,
  Bell,
  Activity,
  MapPin,
  ClipboardList,
  MessageSquarePlus,
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  onOpenCommunityReport?: () => void;
  flaggedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenUpload,
  onOpenCommunityReport,
  flaggedCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'Purity Map' },
    { id: 'priority', label: 'Investigation Priority' },
    { id: 'explorer', label: 'Analysis' },
    { id: 'trends', label: 'Trends' },
    { id: 'alerts', label: 'Anomaly Flags', badge: flaggedCount > 0 ? flaggedCount : undefined },
    { id: 'community', label: 'Community Reports' },
    { id: 'about', label: 'About & SDGs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Zone */}
        <div className="shrink-0 flex items-center">
          <Logo
            size="md"
            showTagline={false}
            onClick={() => onNavigate('landing')}
          />
        </div>

        {/* Zone 2: Nav Links (Desktop) */}
        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 py-1 ${
                  isActive
                    ? 'text-sky-800 font-semibold border-b-2 border-sky-700 -mb-[2px]'
                    : 'hover:text-slate-900 text-slate-600'
                }`}
              >
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenCommunityReport && (
            <button
              onClick={onOpenCommunityReport}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Report local water quality concern"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Report Concern</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span>Import CSV</span>
          </button>

          {activeView === 'landing' ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Explore Dashboard</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('alerts')}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Review Flags"
              aria-label="Review Flags"
            >
              <Bell className="w-4 h-4" />
              {flaggedCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg max-h-[85vh] overflow-y-auto">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeView === link.id
                  ? 'bg-sky-50 text-sky-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {onOpenCommunityReport && (
              <button
                onClick={() => {
                  onOpenCommunityReport();
                  setMobileMenuOpen(false);
                }}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
              >
                <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                <span>Report Water Concern</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV Telemetry</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
