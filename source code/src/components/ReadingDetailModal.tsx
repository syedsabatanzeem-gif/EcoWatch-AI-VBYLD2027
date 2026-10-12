import React, { useState } from 'react';
import { Reading, ThresholdConfig } from '../types.ts';
import {
  X,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  ShieldAlert,
  Send,
  HelpCircle,
} from 'lucide-react';

interface ReadingDetailModalProps {
  reading: Reading | null;
  thresholds?: ThresholdConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (readingId: string, status: Reading['status'], notes?: string) => Promise<void>;
}

export const ReadingDetailModal: React.FC<ReadingDetailModalProps> = ({
  reading,
  thresholds,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  if (!isOpen || !reading) return null;

  const [notes, setNotes] = useState(reading.review_notes || '');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleStatusChange = async (newStatus: Reading['status']) => {
    setUpdating(true);
    try {
      await onUpdateStatus(reading.id, newStatus, notes);
      setSuccessMsg(`Status updated to "${newStatus}"`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const formattedTime = new Date(reading.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded">
                {reading.id}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Water Sensor Inspection Report
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {reading.location}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formattedTime}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Scientific Disclaimer Banner */}
          <div className="p-3.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold">Environmental Advisory:</strong> Statistical flags indicate measurements outside empirical historical bounds or sensor ranges. These flags do not certify water contamination or potability without confirmatory certified laboratory spectrometry testing.
            </p>
          </div>

          {/* Anomaly reasons if present */}
          {reading.anomaly_reasons && reading.anomaly_reasons.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Detection Triggers & Statistical Justification</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-amber-800">
                {reading.anomaly_reasons.map((reason, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Measured Parameters Grid */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Physicochemical Telemetry Values
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* pH */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">pH Level</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {reading.ph.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  EPA Target: 6.5 – 8.5
                </div>
              </div>

              {/* Turbidity */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">Turbidity</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {reading.turbidity.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500">NTU</span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Threshold: &le; 5.0 NTU
                </div>
              </div>

              {/* TDS */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">TDS</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {Math.round(reading.tds)}
                  </span>
                  <span className="text-xs text-slate-500">mg/L</span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Threshold: &le; 500 mg/L
                </div>
              </div>

              {/* Temperature */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">Temperature</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {reading.temperature.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500">°C</span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Standard: 5.0°C – 25.0°C
                </div>
              </div>

              {/* Dissolved Oxygen */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">Dissolved Oxygen</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                    {reading.dissolved_oxygen !== undefined
                      ? reading.dissolved_oxygen.toFixed(2)
                      : '—'}
                  </span>
                  <span className="text-xs text-slate-500">mg/L</span>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400">
                  Threshold: &ge; 6.0 mg/L
                </div>
              </div>

              {/* Current Status */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-medium text-slate-500">Current Status</span>
                <div className="mt-1 font-semibold text-sm text-slate-900">
                  {reading.status}
                </div>
                <div className="mt-1.5 text-[11px] text-slate-400 font-mono">
                  {reading.anomaly_reasons?.length || 0} trigger(s)
                </div>
              </div>
            </div>
          </div>

          {/* Review Status & Notes Form */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Analyst Review Action
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Investigation Notes & Field Observations
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document site verification, rainfall conditions, or laboratory escalation ticket..."
                rows={2}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {successMsg && (
              <p className="text-xs text-emerald-600 font-medium">{successMsg}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Reviewed')}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                Mark as Reviewed
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Needs Further Investigation')}
                className="px-3.5 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
              >
                Escalate for Lab Investigation
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Normal')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset to Normal
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
