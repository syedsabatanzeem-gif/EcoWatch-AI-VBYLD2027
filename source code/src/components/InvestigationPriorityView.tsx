import React, { useState, useEffect } from 'react';
import { InvestigationPriorityItem, Reading } from '../types.ts';
import {
  ClipboardList,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  Eye,
  Activity,
  Layers,
  MapPin,
  Calendar,
  Building2,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

interface InvestigationPriorityViewProps {
  onSelectReading?: (reading: Reading) => void;
  onNavigateToMap?: (stationName: string) => void;
}

export const InvestigationPriorityView: React.FC<InvestigationPriorityViewProps> = ({
  onSelectReading,
  onNavigateToMap,
}) => {
  const [items, setItems] = useState<InvestigationPriorityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchPriorities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/priority');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch priorities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all' && item.priorityCategory !== filterCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.location.toLowerCase().includes(q) ||
        item.stationId.toLowerCase().includes(q) ||
        item.basin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: InvestigationPriorityItem['priorityCategory']) => {
    switch (cat) {
      case 'Review recommended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Review Recommended</span>
          </span>
        );
      case 'Further verification needed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Further Verification Needed</span>
          </span>
        );
      case 'Insufficient data':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Insufficient Data</span>
          </span>
        );
      case 'Nominal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nominal / Routine</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span>Follow-Up Investigation Priorities</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized order of river reaches and monitoring stations that warrant verification, field resampling, or laboratory evaluation
          </p>
        </div>

        <button
          onClick={fetchPriorities}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Methodological Context & Plain Language Criteria Notice */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-2xl text-xs text-indigo-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <HelpCircle className="w-4 h-4 text-indigo-700 shrink-0" />
          <span>Ranking Criteria & Responsible Screening Protocol</span>
        </div>
        <p className="leading-relaxed">
          <strong>Important:</strong> Priority scores reflect empirical ordering criteria based on rule exceedance frequency, multidimensional anomaly scores, and data completeness. <strong>This is not an official health or contamination risk score.</strong> Ordering helps community volunteers and field inspectors prioritize limited physical sampling resources. Recommended next steps include inspecting physical sensor integrity, repeating measurements, or consulting certified environmental testing laboratories.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-500 mr-1">Filter Priority:</span>
          {(
            [
              { id: 'all', label: 'All Locations' },
              { id: 'Review recommended', label: 'Review Recommended' },
              { id: 'Further verification needed', label: 'Further Verification' },
              { id: 'Insufficient data', label: 'Insufficient Data' },
              { id: 'Nominal', label: 'Nominal' },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filterCategory === c.id
                  ? 'bg-indigo-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search location or basin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Priority Ranked Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading prioritized stations...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-slate-800 text-sm">No Stations Match Criteria</p>
            <p>All monitored locations have nominal readings or do not meet this priority category.</p>
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-5 ${
                item.priorityCategory === 'Review recommended'
                  ? 'border-rose-200 bg-rose-50/15'
                  : item.priorityCategory === 'Further verification needed'
                  ? 'border-amber-200 bg-amber-50/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3 flex-1">
                {/* Header row with rank index */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {item.stationId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.location}
                  </h3>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.samplingDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="ml-auto">{getCategoryBadge(item.priorityCategory)}</div>
                </div>

                {/* Basin and Coordinates */}
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.basin}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[11px]">
                    {item.latitude.toFixed(3)}°N, {Math.abs(item.longitude).toFixed(3)}°W
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-800 font-semibold">
                    {item.dataCompletenessPct}% Complete Data Profile
                  </span>
                </div>

                {/* Available Measurements pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1">
                    Telemetry:
                  </span>
                  {item.availableMeasurements.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]"
                    >
                      {m}
                    </span>
                  ))}
                  {item.mlAnomalyDetected && (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[11px] font-semibold border border-purple-200">
                      ML Divergence Tag
                    </span>
                  )}
                </div>

                {/* Triggered Rules or Anomaly Explanation */}
                {item.triggeredRules.length > 0 && (
                  <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                      Triggered Screening Rules:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {item.triggeredRules.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Next Step Callout */}
                <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-950 block">
                      Recommended Action: {item.recommendedActionType}
                    </span>
                    <p className="text-indigo-900 text-[11px] mt-0.5 leading-relaxed">
                      {item.suggestedNextStep}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                {item.latestReading && onSelectReading && (
                  <button
                    onClick={() => onSelectReading(item.latestReading!)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Record</span>
                  </button>
                )}

                {onNavigateToMap && (
                  <button
                    onClick={() => onNavigateToMap(item.location)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Locate on Map</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
