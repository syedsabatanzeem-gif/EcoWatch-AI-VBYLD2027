import React from 'react';
import { Logo } from './Logo.tsx';
import {
  LayoutDashboard,
  Map,
  Compass,
  LineChart,
  AlertTriangle,
  UploadCloud,
  Info,
  Sliders,
  RotateCcw,
  ClipboardList,
  MessageSquarePlus,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  onOpenThresholds: () => void;
  onOpenCommunityReport?: () => void;
  onOpenReportsDownload?: () => void;
  onResetSample: () => void;
  flaggedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenUpload,
  onOpenThresholds,
  onOpenCommunityReport,
  onOpenReportsDownload,
  onResetSample,
  flaggedCount = 0,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'GIS Water Purity Map', icon: Map },
    { id: 'priority', label: 'Investigation Priority', icon: ClipboardList },
    { id: 'explorer', label: 'Water Quality Analysis', icon: Compass },
    { id: 'trends', label: 'Trends & Variance', icon: LineChart },
    {
      id: 'alerts',
      label: 'Anomaly Flags & Review',
      icon: AlertTriangle,
      badge: flaggedCount > 0 ? flaggedCount : undefined,
    },
    { id: 'community', label: 'Community Reports', icon: MessageSquarePlus },
    { id: 'about', label: 'About & SDGs', icon: Info },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#082B49] text-slate-100 flex flex-col justify-between border-r border-slate-800 shadow-xl min-h-[calc(100vh-4rem)]">
      {/* Top Section */}
      <div className="p-5">
        <div className="pb-5 border-b border-white/10">
          <Logo size="md" showTagline={true} inverted={true} onClick={() => onNavigate('dashboard')} />
        </div>

        {/* Primary Menu */}
        <div className="mt-5 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Platform Views
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600/90 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono tabular-nums px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white text-sky-900 font-bold'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Operations & Utilities */}
        <div className="mt-6 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Data Tools
          </p>
          <button
            onClick={onOpenUpload}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Import CSV Dataset</span>
          </button>
          {onOpenReportsDownload && (
            <button
              onClick={onOpenReportsDownload}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Generate Dossier Report</span>
            </button>
          )}
          <button
            onClick={onOpenThresholds}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Screening Thresholds</span>
          </button>
          <button
            onClick={onResetSample}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors cursor-pointer"
            title="Reset dataset to baseline illustrative sample"
          >
            <RotateCcw className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Restore Demo Baseline</span>
          </button>
        </div>
      </div>

      {/* Bottom SDG Alignment Strip */}
      <div className="p-4 border-t border-white/10 bg-black/25">
        <div className="text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>UN SDGs Impact</span>
            <span className="text-[10px] font-mono text-teal-400">SDG 6 · 11 · 15</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Designed for rural watershed stewards, community NGOs & environmental health officers.
          </p>
        </div>
      </div>
    </aside>
  );
};
