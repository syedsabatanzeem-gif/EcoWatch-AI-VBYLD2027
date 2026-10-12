import React from 'react';
import { SummaryData } from '../types.ts';
import {
  Database,
  MapPin,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryData | null;
  loading?: boolean;
  onFilterFlagged?: () => void;
  onOpenMap?: () => void;
  onOpenPriority?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  loading = false,
  onFilterFlagged,
  onOpenMap,
  onOpenPriority,
}) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-slate-200 bg-white p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-8 bg-slate-100 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Verified CPCB / APPCB Dataset & Responsible-Use Banner */}
      <div className="p-2.5 px-3.5 bg-teal-50/90 border border-teal-200 rounded-xl text-xs text-teal-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            <strong className="font-semibold text-teal-900">Verified Public Dataset:</strong>{' '}
            Central Pollution Control Board (CPCB) NWMP & Andhra Pradesh Pollution Control Board (APPCB). Published screening values reflect official field records and do not independently certify drinking water safety.
          </span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-100/80 text-teal-900 font-semibold shrink-0">
          SDG 6 · Andhra Pradesh
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Number of Unique Verified Monitoring Stations */}
        <div
          onClick={onOpenMap}
          className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all ${
            onOpenMap
              ? 'cursor-pointer hover:border-teal-300 hover:bg-teal-50/20'
              : 'hover:shadow-sm'
          }`}
          title={onOpenMap ? 'Open GIS Water Purity Map' : undefined}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verified Stations
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalStations || summary.locationsMonitored}
            </span>
            <span className="text-xs text-slate-500">unique stations</span>
          </div>
          <div className="mt-2 text-xs text-teal-700 font-medium flex items-center justify-between">
            <span className="truncate">
              {summary.districtsCount ? `${summary.districtsCount} Districts · ` : ''}
              {summary.riversCount ? `${summary.riversCount} Water Bodies` : 'Andhra Pradesh'}
            </span>
            {onOpenMap && (
              <span className="text-[11px] underline shrink-0 ml-1">View GIS Map →</span>
            )}
          </div>
        </div>

        {/* 2. Number of Measurement Records Analyzed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Measurement Records
            </span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {summary.totalReadings}
            </span>
            <span className="text-xs text-slate-500">sampling reports</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-medium">{summary.normalCount} baseline</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-700 font-medium">{summary.flaggedReadings} screened</span>
          </div>
        </div>

        {/* 3. Number of Readings Flagged for Review */}
        <div
          onClick={onFilterFlagged}
          className={`bg-white rounded-xl border p-5 shadow-xs transition-all cursor-pointer ${
            summary.flaggedReadings > 0
              ? 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/20'
              : 'border-slate-200 hover:shadow-sm'
          }`}
          title="Filter flagged readings"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Readings Flagged
            </span>
            <div
              className={`p-2 rounded-lg ${
                summary.flaggedReadings > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {summary.flaggedReadings > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                summary.flaggedReadings > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {summary.flaggedReadings}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({summary.anomalyRate}% anomaly rate)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-rose-600 font-medium">
              {summary.highPriorityCount} high priority
            </span>
            <span aria-hidden="true">·</span>
            <span>Click to review flags</span>
          </div>
        </div>

        {/* 4. Number of Locations Requiring Follow-Up */}
        <div
          onClick={onOpenPriority}
          className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
            onOpenPriority
              ? 'cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/20'
              : 'hover:shadow-sm'
          } border-slate-200`}
          title={onOpenPriority ? 'Open Investigation Priority Queue' : undefined}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Locations for Follow-Up
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-indigo-900">
              {summary.locationsRequiringFollowUp ?? 2}
            </span>
            <span className="text-xs text-slate-500">prioritized stations</span>
          </div>
          <div className="mt-2 text-xs text-indigo-700 font-medium flex items-center justify-between">
            <span>Ranked by severity & completeness</span>
            {onOpenPriority && <span className="text-[11px] underline">Review Queue →</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
