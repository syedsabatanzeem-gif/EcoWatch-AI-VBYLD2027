import React, { useState, useMemo } from 'react';
import { TrendPoint, LocationComparison, ThresholdConfig } from '../types.ts';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SlidersHorizontal, BarChart3, TrendingUp, Layers } from 'lucide-react';

interface TrendChartsProps {
  trendData: TrendPoint[];
  locationComparisons: LocationComparison[];
  thresholds?: ThresholdConfig;
  locations: string[];
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({
  trendData,
  locationComparisons,
  thresholds,
  locations,
  selectedLocation,
  onLocationChange,
}) => {
  const [selectedParameter, setSelectedParameter] = useState<
    'ph' | 'turbidity' | 'tds' | 'temperature' | 'dissolved_oxygen' | 'nitrate' | 'all'
  >('ph');
  const [chartViewMode, setChartViewMode] = useState<'trends' | 'comparison' | 'distribution'>('trends');

  const parameterMeta = {
    ph: {
      name: 'pH Level',
      unit: '',
      color: '#0B6FB8',
      refMin: thresholds?.ph.min ?? 6.5,
      refMax: thresholds?.ph.max ?? 8.5,
    },
    turbidity: {
      name: 'Turbidity',
      unit: 'NTU',
      color: '#F59E0B',
      refMax: thresholds?.turbidity.max ?? 5.0,
    },
    tds: {
      name: 'Total Dissolved Solids (TDS)',
      unit: 'mg/L',
      color: '#8B5CF6',
      refMax: thresholds?.tds.max ?? 500,
    },
    temperature: {
      name: 'Water Temperature',
      unit: '°C',
      color: '#EC4899',
      refMin: thresholds?.temperature.min ?? 5.0,
      refMax: thresholds?.temperature.max ?? 25.0,
    },
    dissolved_oxygen: {
      name: 'Dissolved Oxygen (DO)',
      unit: 'mg/L',
      color: '#10B981',
      refMin: thresholds?.dissolved_oxygen.min ?? 6.0,
    },
    nitrate: {
      name: 'Nitrate (NO₃-N)',
      unit: 'mg/L',
      color: '#3B82F6',
      refMax: thresholds?.nitrate?.max ?? 10.0,
    },
  };

  // Filter trend points by selected location
  const filteredTrends = useMemo(() => {
    if (!selectedLocation || selectedLocation === 'all') {
      return trendData;
    }
    return trendData.filter(
      (t) => t.location.toLowerCase() === selectedLocation.toLowerCase()
    );
  }, [trendData, selectedLocation]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
      {/* Chart Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-700" />
            <span>Water Quality Dynamics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal fluctuation & cross-station comparative telemetry
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setChartViewMode('trends')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartViewMode === 'trends'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Time Trends
            </button>
            <button
              onClick={() => setChartViewMode('comparison')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartViewMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Station Averages
            </button>
            <button
              onClick={() => setChartViewMode('distribution')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                chartViewMode === 'distribution'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Metric Overview
            </button>
          </div>

          {/* Location filter dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="station-select" className="text-xs text-slate-500 whitespace-nowrap">
              Station:
            </label>
            <select
              id="station-select"
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Monitoring Stations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Parameter selector (when in trends mode) */}
      {chartViewMode === 'trends' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1">
            Parameter:
          </span>
          {(
            [
              'ph',
              'turbidity',
              'tds',
              'temperature',
              'dissolved_oxygen',
              'nitrate',
              'all',
            ] as const
          ).map((param) => {
            const isSelected = selectedParameter === param;
            const label =
              param === 'all'
                ? 'All Metrics (Normalized)'
                : parameterMeta[param]?.name;
            return (
              <button
                key={param}
                onClick={() => setSelectedParameter(param)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* View 1: Time Series Line Chart */}
      {chartViewMode === 'trends' && (
        <div className="h-72 w-full pt-2">
          {filteredTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No trend data available for current selection.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredTrends}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  domain={
                    selectedParameter === 'ph'
                      ? [5.0, 10.0]
                      : selectedParameter === 'turbidity'
                      ? [0, 'auto']
                      : ['auto', 'auto']
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TrendPoint;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-lg space-y-1 backdrop-blur-sm border border-slate-700">
                          <p className="font-semibold text-slate-200">
                            {data.location}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {data.dateTime}
                          </p>
                          <div className="pt-1.5 border-t border-slate-700/80 space-y-0.5 font-mono">
                            <p className="text-sky-300">pH: {data.ph.toFixed(2)}</p>
                            <p className="text-amber-300">
                              Turbidity: {data.turbidity.toFixed(2)} NTU
                            </p>
                            <p className="text-purple-300">
                              TDS: {Math.round(data.tds)} mg/L
                            </p>
                            <p className="text-pink-300">
                              Temp: {data.temperature.toFixed(1)}°C
                            </p>
                            {data.dissolved_oxygen !== null && (
                              <p className="text-emerald-300">
                                DO: {data.dissolved_oxygen.toFixed(2)} mg/L
                              </p>
                            )}
                          </div>
                          {data.status !== 'Normal' && (
                            <p className="pt-1 text-amber-400 font-sans text-[11px]">
                              Status: {data.status}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  iconType="circle"
                />

                {/* Specific Parameter Line */}
                {selectedParameter === 'ph' && (
                  <>
                    <ReferenceLine
                      y={thresholds?.ph.max ?? 8.5}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Max pH 8.5',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <ReferenceLine
                      y={thresholds?.ph.min ?? 6.5}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Min pH 6.5',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ph"
                      name="pH Level"
                      stroke="#0B6FB8"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#0B6FB8' }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}

                {selectedParameter === 'turbidity' && (
                  <>
                    <ReferenceLine
                      y={thresholds?.turbidity.max ?? 5.0}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Threshold 5.0 NTU',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="turbidity"
                      name="Turbidity (NTU)"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#F59E0B' }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}

                {selectedParameter === 'tds' && (
                  <>
                    <ReferenceLine
                      y={thresholds?.tds.max ?? 500}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Threshold 500 mg/L',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tds"
                      name="Total Dissolved Solids (mg/L)"
                      stroke="#8B5CF6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#8B5CF6' }}
                    />
                  </>
                )}

                {selectedParameter === 'temperature' && (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°C)"
                    stroke="#EC4899"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#EC4899' }}
                  />
                )}

                {selectedParameter === 'dissolved_oxygen' && (
                  <>
                    <ReferenceLine
                      y={thresholds?.dissolved_oxygen.min ?? 6.0}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Min DO 6.0 mg/L',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="dissolved_oxygen"
                      name="Dissolved Oxygen (mg/L)"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10B981' }}
                    />
                  </>
                )}

                {selectedParameter === 'nitrate' && (
                  <>
                    <ReferenceLine
                      y={thresholds?.nitrate?.max ?? 10.0}
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Max Nitrate 10.0 mg/L',
                        fill: '#EF4444',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nitrate_mg_l"
                      name="Nitrate (mg/L NO₃-N)"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#3B82F6' }}
                    />
                  </>
                )}

                {selectedParameter === 'all' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="ph"
                      name="pH"
                      stroke="#0B6FB8"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="turbidity"
                      name="Turbidity (NTU)"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="dissolved_oxygen"
                      name="DO (mg/L)"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* View 2: Cross-Station Bar Chart Comparison */}
      {chartViewMode === 'comparison' && (
        <div className="h-72 w-full pt-2">
          {locationComparisons.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No comparison data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationComparisons}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="location"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as LocationComparison;
                      return (
                        <div className="bg-slate-900/95 text-white p-3 rounded-lg text-xs shadow-lg space-y-1 border border-slate-700">
                          <p className="font-semibold">{data.location}</p>
                          <p className="text-[11px] text-slate-400">
                            {data.readingsCount} records recorded
                          </p>
                          <div className="pt-1.5 border-t border-slate-700 font-mono space-y-0.5">
                            <p className="text-sky-300">Mean pH: {data.avgPh}</p>
                            <p className="text-amber-300">
                              Mean Turbidity: {data.avgTurbidity} NTU
                            </p>
                            <p className="text-purple-300">Mean TDS: {data.avgTds} mg/L</p>
                            <p className="text-emerald-300">
                              Mean DO: {data.avgDo ?? 'N/A'} mg/L
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="avgPh" name="Avg pH" fill="#0B6FB8" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="avgTurbidity"
                  name="Avg Turbidity (NTU)"
                  fill="#14B8A6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="avgDo"
                  name="Avg Dissolved O2 (mg/L)"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* View 3: Multi-Metric Station Grid Overview */}
      {chartViewMode === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">pH Range Standard</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>EPA / WHO Target</span>
                <span className="font-mono font-medium">6.50 – 8.50</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Configured Floor</span>
                <span className="font-mono text-rose-600 font-medium">
                  {thresholds?.ph.min ?? 6.5}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Configured Ceiling</span>
                <span className="font-mono text-rose-600 font-medium">
                  {thresholds?.ph.max ?? 8.5}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Turbidity Thresholds
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Drinking Water Goal</span>
                <span className="font-mono font-medium">&lt; 1.0 NTU</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Watershed Alert Level</span>
                <span className="font-mono text-amber-600 font-medium">
                  {thresholds?.turbidity.max ?? 5.0} NTU
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Z-score Multiplier</span>
                <span className="font-mono text-sky-700 font-medium">
                  ±{thresholds?.zScoreThreshold ?? 2.5}σ
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Dissolved Oxygen Index
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Healthy Aquatic Baseline</span>
                <span className="font-mono font-medium">&gt; 6.5 mg/L</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hypoxia Warning Trigger</span>
                <span className="font-mono text-rose-600 font-medium">
                  &lt; {thresholds?.dissolved_oxygen.min ?? 6.0} mg/L
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IQR Multiplier</span>
                <span className="font-mono text-sky-700 font-medium">
                  {thresholds?.iqrMultiplier ?? 1.5}× IQR
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
