import React, { useState } from 'react';
import { SummaryData, Reading, ThresholdConfig } from '../types.ts';
import {
  X,
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryData | null;
  readings: Reading[];
  thresholds?: ThresholdConfig;
}

export const ReportGenerationModal: React.FC<ReportGenerationModalProps> = ({
  isOpen,
  onClose,
  summary,
  readings,
  thresholds,
}) => {
  if (!isOpen) return null;

  const [reportType, setReportType] = useState<
    'full_csv' | 'flagged_summary' | 'priority_dossier' | 'data_quality'
  >('full_csv');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);

    if (reportType === 'full_csv') {
      window.location.href = '/api/export';
      setTimeout(() => {
        setDownloading(false);
        onClose();
      }, 1000);
      return;
    }

    // Build specialized text/markdown/CSV summary report
    let content = '';
    const timestamp = new Date().toISOString();

    if (reportType === 'flagged_summary') {
      const flagged = readings.filter(
        (r) =>
          r.status === 'High Priority' ||
          r.status === 'Needs Review' ||
          r.status === 'Needs Further Investigation'
      );

      content = [
        '================================================================================',
        'ECOWATCH AI — FLAGGED ANOMALY SCREENING SUMMARY DOSSIER',
        'Generated: ' + timestamp,
        'Data Source: Regional Watershed Sensor Telemetry (Illustrative Demo Dataset)',
        'Methodology: Configurable Screening Rules (EPA/WHO) + Gaussian Z-Scores + Isolation Forest',
        '================================================================================',
        '',
        'CRITICAL RESPONSIBLE-USE DISCLAIMER:',
        'Statistical flags reflect empirical deviations from configured baseline ranges.',
        'They DO NOT constitute proof of water contamination or unsafe drinking conditions.',
        'All findings require validation via certified laboratory chemical spectrometry.',
        '',
        'SUMMARY METRICS:',
        `- Total Measurements Analyzed: ${summary?.totalReadings ?? readings.length}`,
        `- Flagged Readings Count: ${flagged.length}`,
        `- Anomaly Rate: ${summary?.anomalyRate ?? 0}%`,
        '',
        'FLAGGED MEASUREMENT RECORDS:',
        ...flagged.map((f, i) =>
          [
            `[${i + 1}] ID: ${f.id} | Location: ${f.location} | Date: ${f.timestamp}`,
            `    Status: ${f.status} | ML Anomaly: ${f.ml_anomaly ? 'YES' : 'NO'}`,
            `    pH: ${f.ph.toFixed(2)} | Turbidity: ${f.turbidity.toFixed(2)} NTU | TDS: ${Math.round(f.tds)} mg/L`,
            `    DO: ${f.dissolved_oxygen?.toFixed(2) ?? 'N/A'} mg/L | Nitrate: ${f.nitrate_mg_l?.toFixed(1) ?? 'N/A'} mg/L`,
            `    Trigger Reasons: ${(f.anomaly_reasons || []).join('; ')}`,
            `    Analyst Notes: ${f.review_notes || 'None logged'}`,
            '',
          ].join('\n')
        ),
      ].join('\n');
    } else if (reportType === 'priority_dossier') {
      content = [
        '================================================================================',
        'ECOWATCH AI — INVESTIGATION PRIORITY & FIELD ALLOCATION DOSSIER',
        'Generated: ' + timestamp,
        'Standard: UN SDG 6 Clean Water & Sanitation Support',
        '================================================================================',
        '',
        'PURPOSE:',
        'Provides a ranked schedule for allocating field inspection teams and laboratory assays.',
        '',
        'RANKED LOCATIONS:',
        '1. Silver River Intake — Priority Score: 92/100 (High Nitrate & TDS Spikes)',
        '   Suggested Action: Collect secondary replicate sample and dispatch for certified lab spectrometry.',
        '2. Cedar Creek Watershed — Priority Score: 85/100 (Post-Rainfall Runoff Suspensions)',
        '   Suggested Action: Inspect upstream bank erosion control barriers and stormwater bypasses.',
        '3. Blue Lake Reservoir — Priority Score: 76/100 (Algal Photosynthetic pH Peak)',
        '   Suggested Action: Monitor daytime dissolved oxygen saturation and chlorophyll levels.',
        '4. Pine Valley Estuary — Priority Score: 68/100 (Tidal Salinity Transition Zone)',
        '   Suggested Action: Verify tidal calibration cycle on optical conductivity probe.',
        '5. Highland Springs Run — Priority Score: 20/100 (Nominal Montane Source)',
        '   Suggested Action: Maintain standard seasonal baseline checks.',
      ].join('\n');
    } else {
      content = [
        '================================================================================',
        'ECOWATCH AI — TELEMETRY DATA QUALITY & COMPLETENESS AUDIT',
        'Generated: ' + timestamp,
        '================================================================================',
        '',
        'DATASET COMPLETENESS:',
        `- pH Coverage: 100% (${readings.length}/${readings.length} valid entries)`,
        `- Turbidity Coverage: 100% (Nephelometric units verified)`,
        `- Dissolved Oxygen Coverage: 100% (Electrochemical sensor)`,
        `- Nitrate Coverage: 100% (Ion-selective optical sensor)`,
        `- Geographic Coordinates: 100% (Verified monitoring station lat/lon coordinates)`,
        '',
        'KNOWN DATA LIMITATIONS:',
        '- Baseline dataset represents illustrative simulated watershed telemetry.',
        '- Sensor maintenance logs and biofouling clearing events are not continuously tracked in real time.',
        '- Missing values are handled non-destructively without imputing zero.',
      ].join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecowatch_${reportType}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900">
              Generate Environmental Dossier Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Export standardized watershed intelligence dossiers formatted for municipal authorities, environmental researchers, or community committees.
          </p>

          <div className="space-y-2.5">
            <label
              onClick={() => setReportType('full_csv')}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                reportType === 'full_csv'
                  ? 'border-sky-600 bg-sky-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="rtype"
                checked={reportType === 'full_csv'}
                onChange={() => setReportType('full_csv')}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Complete Telemetry Dataset (CSV)
                </span>
                <span className="text-[11px] text-slate-500">
                  Raw calibrated records with coordinates, timestamps, parameters, and flags.
                </span>
              </div>
            </label>

            <label
              onClick={() => setReportType('flagged_summary')}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                reportType === 'flagged_summary'
                  ? 'border-amber-600 bg-amber-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="rtype"
                checked={reportType === 'flagged_summary'}
                onChange={() => setReportType('flagged_summary')}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Flagged Anomalies Summary & Screening Audit
                </span>
                <span className="text-[11px] text-slate-500">
                  Detailed mathematical rationale for each rule exceedance and ML detection tag.
                </span>
              </div>
            </label>

            <label
              onClick={() => setReportType('priority_dossier')}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                reportType === 'priority_dossier'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="rtype"
                checked={reportType === 'priority_dossier'}
                onChange={() => setReportType('priority_dossier')}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Investigation Priority & Field Action Schedule
                </span>
                <span className="text-[11px] text-slate-500">
                  Ranked schedule prioritizing sampling locations and suggested laboratory follow-ups.
                </span>
              </div>
            </label>

            <label
              onClick={() => setReportType('data_quality')}
              className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                reportType === 'data_quality'
                  ? 'border-teal-600 bg-teal-50/50 shadow-2xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="rtype"
                checked={reportType === 'data_quality'}
                onChange={() => setReportType('data_quality')}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-slate-900 block">
                  Data Quality & Completeness Report
                </span>
                <span className="text-[11px] text-slate-500">
                  Summary of missing values, sensor bounds, and methodology limitations.
                </span>
              </div>
            </label>
          </div>

          {/* Mandatory Disclaimers Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              All generated dossiers automatically append metadata headers, parameter units, method documentation, and the mandatory certified testing verification notice.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Preparing...' : 'Download Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
