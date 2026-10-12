import React, { useState, useMemo } from 'react';
import { Reading, ThresholdConfig } from '../types.ts';
import {
  Compass,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowUpDown,
  Search,
  Eye,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WaterQualityExplorerProps {
  readings: Reading[];
  locations: string[];
  thresholds?: ThresholdConfig;
  onSelectReading: (reading: Reading) => void;
  onExportCsv: () => void;
}

export const WaterQualityExplorer: React.FC<WaterQualityExplorerProps> = ({
  readings,
  locations,
  thresholds,
  onSelectReading,
  onExportCsv,
}) => {
  const [selectedParam, setSelectedParam] = useState<
    'ph' | 'turbidity' | 'tds' | 'temperature' | 'dissolved_oxygen' | 'nitrate_mg_l'
  >('ph');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const paramConfig = {
    ph: { name: 'pH Level', unit: '', benchmark: '6.50 – 8.50' },
    turbidity: { name: 'Turbidity', unit: 'NTU', benchmark: '< 5.0 NTU' },
    tds: { name: 'Total Dissolved Solids', unit: 'mg/L', benchmark: '< 500 mg/L' },
    temperature: { name: 'Temperature', unit: '°C', benchmark: '5.0°C – 25.0°C' },
    dissolved_oxygen: { name: 'Dissolved Oxygen', unit: 'mg/L', benchmark: '> 6.0 mg/L' },
    nitrate_mg_l: { name: 'Nitrate (NO₃-N)', unit: 'mg/L', benchmark: '< 10.0 mg/L' },
  };

  // Filtered readings
  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      if (selectedLocation !== 'all' && r.location.toLowerCase() !== selectedLocation.toLowerCase()) {
        return false;
      }
      if (startDate && new Date(r.timestamp).getTime() < new Date(startDate).getTime()) {
        return false;
      }
      if (endDate && new Date(r.timestamp).getTime() > new Date(endDate).getTime()) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.id.toLowerCase().includes(q) &&
          !r.location.toLowerCase().includes(q) &&
          (!r.review_notes || !r.review_notes.toLowerCase().includes(q))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [readings, selectedLocation, startDate, endDate, search]);

  // Statistics for currently selected parameter
  const stats = useMemo(() => {
    const values = filteredReadings
      .map((r) => r[selectedParam])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, latest: 0, count: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // Latest
    const sorted = [...filteredReadings].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const latestVal = sorted[0]?.[selectedParam] ?? 0;

    return {
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      avg: Number(avg.toFixed(2)),
      latest: typeof latestVal === 'number' ? Number(latestVal.toFixed(2)) : 0,
      count: values.length,
    };
  }, [filteredReadings, selectedParam]);

  // Station Comparison for this parameter
  const stationAverages = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    filteredReadings.forEach((r) => {
      const val = r[selectedParam];
      if (typeof val === 'number' && !isNaN(val)) {
        if (!map[r.location]) map[r.location] = { sum: 0, count: 0 };
        map[r.location].sum += val;
        map[r.location].count += 1;
      }
    });

    return Object.entries(map).map(([loc, d]) => ({
      location: loc,
      value: Number((d.sum / d.count).toFixed(2)),
      count: d.count,
    }));
  }, [filteredReadings, selectedParam]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-700" />
            <span>Water Quality Explorer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep-dive into parametric measurements, comparative variances, and observational records
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter and Parameter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
        {/* Parameter Selector Buttons */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Primary Parameter Focused Analysis
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                'ph',
                'turbidity',
                'tds',
                'temperature',
                'dissolved_oxygen',
                'nitrate_mg_l',
              ] as const
            ).map((p) => {
              const isActive = selectedParam === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedParam(p)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-700 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{paramConfig[p].name}</span>
                  {paramConfig[p].unit && (
                    <span className="ml-1 opacity-80 text-[11px] font-mono">
                      ({paramConfig[p].unit})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">
              Filter by Station
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">All Stations ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">
              Search Text
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ID, notes, site..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Metric Cards: Min, Max, Avg, Latest */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Minimum Observed
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.min}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {paramConfig[selectedParam].unit}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {stats.count} filtered readings
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Average (Mean)
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-sky-700">
              {stats.avg}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {paramConfig[selectedParam].unit}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Target benchmark: {paramConfig[selectedParam].benchmark}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Maximum Observed
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {stats.max}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {paramConfig[selectedParam].unit}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Highest recorded datum
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Most Recent Reading
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-700">
              {stats.latest}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {paramConfig[selectedParam].unit}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Latest probe transmission
          </span>
        </div>
      </div>

      {/* Station Comparison Bar Chart for Selected Parameter */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Comparative Variance: {paramConfig[selectedParam].name} by Monitoring Station
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Station-averaged values for {paramConfig[selectedParam].name}
        </p>
        <div className="h-64 w-full">
          {stationAverages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No station data available for current selection.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stationAverages}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="location"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs font-mono shadow-md">
                          <p className="font-sans font-bold text-slate-200">
                            {item.location}
                          </p>
                          <p className="text-sky-300 mt-1">
                            {paramConfig[selectedParam].name}: {item.value}{' '}
                            {paramConfig[selectedParam].unit}
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            {item.count} samples
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#0B6FB8"
                  radius={[4, 4, 0, 0]}
                  name={paramConfig[selectedParam].name}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filtered Data List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">
            Explorer Readings Table ({filteredReadings.length} matching rows)
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Click row to view inspector panel
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] sticky top-0 border-b border-slate-200">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Station</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">
                  {paramConfig[selectedParam].name} ({paramConfig[selectedParam].unit || 'Value'})
                </th>
                <th className="p-3 text-right">pH</th>
                <th className="p-3 text-right">Turbidity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReadings.slice(0, 50).map((r) => {
                const paramValue = r[selectedParam];
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectReading(r)}
                    className="hover:bg-slate-50 cursor-pointer font-mono text-slate-700"
                  >
                    <td className="p-3 font-semibold text-slate-900">{r.id}</td>
                    <td className="p-3 font-sans font-medium text-slate-800">
                      {r.location}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(r.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-right font-bold text-sky-800 tabular-nums">
                      {typeof paramValue === 'number' ? paramValue.toFixed(2) : '—'}
                    </td>
                    <td className="p-3 text-right tabular-nums">{r.ph.toFixed(2)}</td>
                    <td className="p-3 text-right tabular-nums">
                      {r.turbidity.toFixed(2)}
                    </td>
                    <td className="p-3 font-sans text-[11px]">
                      <span
                        className={
                          r.status === 'Normal'
                            ? 'text-emerald-700 font-medium'
                            : r.status === 'High Priority'
                            ? 'text-rose-700 font-bold'
                            : 'text-amber-700 font-medium'
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReading(r);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-sky-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
