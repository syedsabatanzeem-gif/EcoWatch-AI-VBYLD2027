import React, { useState } from 'react';
import { AlertItem, Reading, ThresholdConfig } from '../types.ts';
import {
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  HelpCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface AlertsReviewProps {
  alerts: AlertItem[];
  thresholds?: ThresholdConfig;
  onOpenThresholds: () => void;
  onSelectReading: (reading: Reading) => void;
  onUpdateStatus: (id: string, status: Reading['status'], notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export const AlertsReview: React.FC<AlertsReviewProps> = ({
  alerts,
  thresholds,
  onOpenThresholds,
  onSelectReading,
  onUpdateStatus,
  onRefresh,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'review'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'high') return a.status === 'High Priority';
    if (filterSeverity === 'review') return a.status === 'Needs Review';
    return true;
  });

  const highPriorityCount = alerts.filter((a) => a.status === 'High Priority').length;
  const needsReviewCount = alerts.filter((a) => a.status === 'Needs Review').length;
  const reviewedCount = alerts.filter((a) => a.status === 'Reviewed').length;

  const handleQuickAction = async (id: string, status: Reading['status']) => {
    setActionInProgress(id);
    try {
      await onUpdateStatus(id, status);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Water Quality Anomaly & Triage Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Explainable deviations flagged via parametric bounds, IQR interquartile spans, and Z-scores
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenThresholds}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-700" />
            <span>Configure Parametric Thresholds</span>
          </button>
        </div>
      </div>

      {/* Scientific Context Banner */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold">
          <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Notice on Anomaly Classification & Compliance</span>
        </div>
        <p className="leading-relaxed pl-6">
          Measurements flagged below highlight statistical deviations (Z-score &gt; ±{thresholds?.zScoreThreshold ?? 2.5}σ or values outside calibrated regulatory thresholds). An alert does <em>not</em> constitute conclusive proof of biological or chemical contamination. Always verify physical probe sensors and conduct certified lab testing before issuing public advisories.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-xs">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterSeverity === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Flagged Items ({alerts.length})
        </button>
        <button
          onClick={() => setFilterSeverity('high')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterSeverity === 'high'
              ? 'bg-rose-600 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>High Priority</span>
          <span className="font-mono text-[11px] font-bold">({highPriorityCount})</span>
        </button>
        <button
          onClick={() => setFilterSeverity('review')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterSeverity === 'review'
              ? 'bg-amber-600 text-white font-semibold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Needs Review</span>
          <span className="font-mono text-[11px] font-bold">({needsReviewCount})</span>
        </button>
      </div>

      {/* Alerts Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">
              No Pending Anomalies
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All monitored water quality measurements conform to configured baseline parameters and statistical limits.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.status === 'High Priority';
            const isReviewed = alert.status === 'Reviewed';
            const isFurther = alert.status === 'Needs Further Investigation';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  isHigh ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {alert.id}
                    </span>
                    <span className="font-semibold text-sm text-slate-900">
                      {alert.location}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(alert.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isReviewed
                          ? 'bg-sky-100 text-sky-800'
                          : isFurther
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  {/* Reasons list */}
                  <div className="space-y-1 pl-1">
                    {alert.reasons.map((r, i) => (
                      <div key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Parameter metrics bar */}
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-600">
                    <span>pH: {alert.reading.ph.toFixed(2)}</span>
                    <span>Turb: {alert.reading.turbidity.toFixed(2)} NTU</span>
                    <span>TDS: {Math.round(alert.reading.tds)} mg/L</span>
                    <span>Temp: {alert.reading.temperature.toFixed(1)}°C</span>
                    {alert.reading.dissolved_oxygen !== undefined && (
                      <span>DO: {alert.reading.dissolved_oxygen.toFixed(2)} mg/L</span>
                    )}
                  </div>

                  {alert.review_notes && (
                    <div className="text-xs text-slate-500 italic pt-1">
                      Note: {alert.review_notes}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => onSelectReading(alert.reading)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>

                  <button
                    disabled={actionInProgress === alert.id}
                    onClick={() => handleQuickAction(alert.id, 'Reviewed')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Reviewed</span>
                  </button>

                  <button
                    disabled={actionInProgress === alert.id}
                    onClick={() =>
                      handleQuickAction(alert.id, 'Needs Further Investigation')
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Escalate Lab</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
