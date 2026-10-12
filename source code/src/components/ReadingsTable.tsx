import React, { useState } from 'react';
import { Reading } from '../types.ts';
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';

interface ReadingsTableProps {
  readings: Reading[];
  totalReadings: number;
  totalStations?: number;
  page: number;
  totalPages: number;
  locations: string[];
  districts?: string[];
  rivers?: string[];
  selectedLocation: string;
  selectedDistrict?: string;
  selectedRiver?: string;
  selectedStatus: string;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSearchChange: (q: string) => void;
  onLocationChange: (loc: string) => void;
  onDistrictChange?: (district: string) => void;
  onRiverChange?: (river: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (field: string) => void;
  onPageChange: (newPage: number) => void;
  onSelectReading: (reading: Reading) => void;
  onExportCsv: () => void;
  onDownloadApDataset?: () => void;
}

export const ReadingsTable: React.FC<ReadingsTableProps> = ({
  readings,
  totalReadings,
  totalStations,
  page,
  totalPages,
  locations,
  districts = [],
  rivers = [],
  searchQuery,
  selectedLocation,
  selectedDistrict = 'all',
  selectedRiver = 'all',
  selectedStatus,
  sortBy,
  sortOrder,
  onSearchChange,
  onLocationChange,
  onDistrictChange,
  onRiverChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onSelectReading,
  onExportCsv,
  onDownloadApDataset,
}) => {
  const getStatusBadge = (status: Reading['status']) => {
    switch (status) {
      case 'Normal':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Normal</span>
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Needs Review</span>
          </span>
        );
      case 'High Priority':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>High Priority</span>
          </span>
        );
      case 'Reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
            <span>Reviewed</span>
          </span>
        );
      case 'Needs Further Investigation':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Further Inv.</span>
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Water Quality Measurement Records
              </h3>
              <span className="text-[10px] bg-teal-50 text-teal-800 font-mono font-semibold px-2 py-0.5 rounded border border-teal-200/70">
                Andhra Pradesh CPCB Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Displaying <strong className="text-slate-800">{readings.length}</strong> of{' '}
              <strong className="text-slate-800">{totalReadings}</strong> measurement records across{' '}
              <strong className="text-slate-800">{totalStations || locations.length}</strong> unique verified stations
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <a
              href="/api/export-ap-dataset"
              download="cpcb_andhra_pradesh_water_quality.csv"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
              title="Download the complete verified CPCB Andhra Pradesh dataset as CSV"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Download AP Dataset (CSV)</span>
            </a>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Filtered</span>
            </button>
          </div>
        </div>

        {/* Filter bar: Search, District, Water Body, Station, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, district, notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* District filter */}
          {onDistrictChange && districts.length > 0 && (
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 truncate"
              >
                <option value="all">All Districts ({districts.length})</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* River / Water Body filter */}
          {onRiverChange && rivers.length > 0 && (
            <div>
              <select
                value={selectedRiver}
                onChange={(e) => onRiverChange(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 truncate"
              >
                <option value="all">All Water Bodies ({rivers.length})</option>
                {rivers.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Station location filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500 truncate"
            >
              <option value="all">All Stations ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Needs Review">Needs Review</option>
              <option value="High Priority">High Priority</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Needs Further Investigation">Needs Further Investigation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th
                onClick={() => onSortChange('id')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Reading ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('location')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Location</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('timestamp')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1">
                  <span>Date & Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('ph')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>pH</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('turbidity')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Turb (NTU)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('tds')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>TDS (mg/L)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('temperature')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Temp (°C)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('dissolved_oxygen')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>DO (mg/L)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => onSortChange('nitrate_mg_l')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Nitrate (mg/L)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {readings.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 text-xs">
                  No readings match the current filter criteria. Try resetting filters or search terms.
                </td>
              </tr>
            ) : (
              readings.map((reading) => {
                const formattedDate = new Date(reading.timestamp).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                );

                const hasAnomaly = reading.status !== 'Normal' && reading.status !== 'Reviewed';

                return (
                  <tr
                    key={reading.id}
                    onClick={() => onSelectReading(reading)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${
                      hasAnomaly ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {reading.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {reading.location}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums ${
                        reading.ph < 6.5 || reading.ph > 8.5
                          ? 'text-rose-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {reading.ph.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums ${
                        reading.turbidity > 5.0
                          ? 'text-amber-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {reading.turbidity.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums ${
                        reading.tds > 500
                          ? 'text-amber-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {Math.round(reading.tds)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {reading.temperature.toFixed(1)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums ${
                        reading.dissolved_oxygen !== undefined && reading.dissolved_oxygen < 6.0
                          ? 'text-rose-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {reading.dissolved_oxygen !== undefined
                        ? reading.dissolved_oxygen.toFixed(2)
                        : '—'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono tabular-nums ${
                        reading.nitrate_mg_l !== undefined && reading.nitrate_mg_l > 10.0
                          ? 'text-rose-600 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {reading.nitrate_mg_l !== undefined
                        ? reading.nitrate_mg_l.toFixed(1)
                        : '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(reading.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReading(reading);
                        }}
                        className="p-1 rounded text-slate-400 group-hover:text-sky-700 hover:bg-slate-200 transition-colors"
                        title="Inspect Reading"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Page <span className="font-semibold text-slate-900 font-mono">{page}</span> of{' '}
            <span className="font-semibold text-slate-900 font-mono">{totalPages || 1}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>{totalReadings} total readings</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
