import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { TrendCharts } from './components/TrendCharts.tsx';
import { ReadingsTable } from './components/ReadingsTable.tsx';
import { ReadingDetailModal } from './components/ReadingDetailModal.tsx';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal.tsx';
import { DataUploadModal } from './components/DataUploadModal.tsx';
import { ReportGenerationModal } from './components/ReportGenerationModal.tsx';
import { WaterQualityExplorer } from './components/WaterQualityExplorer.tsx';
import { WaterPurityMap } from './components/WaterPurityMap.tsx';
import { InvestigationPriorityView } from './components/InvestigationPriorityView.tsx';
import { CommunityReportingView } from './components/CommunityReportingView.tsx';
import { AlertsReview } from './components/AlertsReview.tsx';
import { AboutPage } from './components/AboutPage.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import {
  Reading,
  SummaryData,
  TrendPoint,
  LocationComparison,
  ThresholdConfig,
  AlertItem,
} from './types.ts';
import { Sliders, RefreshCw, UploadCloud, RotateCcw, Download, FileText, MessageSquarePlus } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing');

  // Core Data States
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [allReadings, setAllReadings] = useState<Reading[]>([]);
  const [totalReadings, setTotalReadings] = useState<number>(0);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [locationComparisons, setLocationComparisons] = useState<LocationComparison[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdConfig | undefined>(undefined);

  // Filter & Pagination States
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [inspectReading, setInspectReading] = useState<Reading | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState<boolean>(false);

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch Summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error('Failed to fetch summary:', e);
    }
  }, []);

  // Fetch Readings (Paginated)
  const fetchReadings = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchQuery,
        location: selectedLocation,
        status: selectedStatus,
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/readings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReadings(data.readings);
        setTotalReadings(data.total);
        setTotalPages(data.totalPages);
        if (data.locations) setLocations(data.locations);
      }
    } catch (e) {
      console.error('Failed to fetch readings:', e);
    }
  }, [page, searchQuery, selectedLocation, selectedStatus, sortBy, sortOrder]);

  // Fetch All Readings
  const fetchAllReadings = useCallback(async () => {
    try {
      const res = await fetch('/api/readings?limit=1000');
      if (res.ok) {
        const data = await res.json();
        setAllReadings(data.readings);
      }
    } catch (e) {
      console.error('Failed to fetch all readings:', e);
    }
  }, []);

  // Fetch Trends
  const fetchTrends = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLocation && selectedLocation !== 'all') {
        params.append('location', selectedLocation);
      }
      const res = await fetch(`/api/trends?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrendData(data.trends || []);
        setLocationComparisons(data.locationComparisons || []);
      }
    } catch (e) {
      console.error('Failed to fetch trends:', e);
    }
  }, [selectedLocation]);

  // Fetch Alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    }
  }, []);

  // Fetch Thresholds
  const fetchThresholds = useCallback(async () => {
    try {
      const res = await fetch('/api/thresholds');
      if (res.ok) {
        const data = await res.json();
        setThresholds(data);
      }
    } catch (e) {
      console.error('Failed to fetch thresholds:', e);
    }
  }, []);

  // Refresh All Data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchSummary(),
      fetchReadings(),
      fetchAllReadings(),
      fetchTrends(),
      fetchAlerts(),
      fetchThresholds(),
    ]);
    setLoading(false);
  }, [fetchSummary, fetchReadings, fetchAllReadings, fetchTrends, fetchAlerts, fetchThresholds]);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleSelectReading = (r: Reading) => {
    setInspectReading(r);
    setIsDetailModalOpen(true);
  };

  const handleUpdateStatus = async (
    readingId: string,
    status: Reading['status'],
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/alerts/${readingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, review_notes: notes }),
      });
      if (res.ok) {
        await Promise.all([
          fetchSummary(),
          fetchReadings(),
          fetchAllReadings(),
          fetchAlerts(),
        ]);
        if (inspectReading && inspectReading.id === readingId) {
          setInspectReading({
            ...inspectReading,
            status,
            review_notes: notes ?? inspectReading.review_notes,
          });
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleSaveThresholds = async (newThresholds: ThresholdConfig) => {
    const res = await fetch('/api/thresholds', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newThresholds),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update thresholds');
    }
    setThresholds(newThresholds);
    await loadAllData();
  };

  const handleResetSample = async () => {
    if (
      window.confirm(
        'Reset dataset to baseline illustrative sample records with standard WHO/EPA thresholds?'
      )
    ) {
      try {
        const res = await fetch('/api/reset-sample', { method: 'POST' });
        if (res.ok) {
          await loadAllData();
        }
      } catch (e) {
        console.error('Failed to reset sample:', e);
      }
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (selectedLocation !== 'all') params.append('location', selectedLocation);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    window.location.href = `/api/export?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeView={currentView}
        onNavigate={setCurrentView}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenCommunityReport={() => setCurrentView('community')}
        flaggedCount={summary?.flaggedReadings ?? 0}
      />

      {/* Main View Area */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage
            onNavigate={setCurrentView}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onOpenCommunityReport={() => setCurrentView('community')}
          />
        </main>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Dark Navy Sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              currentView={currentView}
              onNavigate={setCurrentView}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenThresholds={() => setIsThresholdModalOpen(true)}
              onOpenCommunityReport={() => setCurrentView('community')}
              onOpenReportsDownload={() => setIsReportsModalOpen(true)}
              onResetSample={handleResetSample}
              flaggedCount={summary?.flaggedReadings ?? 0}
            />
          </div>

          {/* Main Content Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
            {/* Contextual Action Bar for Dashboard */}
            {currentView === 'dashboard' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Operations Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Continuous water-quality monitoring, automated anomaly scoring & multi-station telemetry
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={async () => {
                      setRefreshing(true);
                      await loadAllData();
                      setRefreshing(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    title="Refresh telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={() => setIsReportsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Generate Dossier</span>
                  </button>

                  <button
                    onClick={() => setIsThresholdModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-sky-700" />
                    <span>Threshold Limits</span>
                  </button>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Import CSV</span>
                  </button>
                </div>
              </div>
            )}

            {/* View Switching */}
            {currentView === 'dashboard' && (
              <div className="space-y-6">
                {/* 1. Summary KPI Cards */}
                <SummaryCards
                  summary={summary}
                  loading={loading}
                  onFilterFlagged={() => {
                    setSelectedStatus('Needs Review');
                  }}
                  onOpenMap={() => setCurrentView('map')}
                  onOpenPriority={() => setCurrentView('priority')}
                />

                {/* 2. Interactive Trend & Comparison Charts */}
                <TrendCharts
                  trendData={trendData}
                  locationComparisons={locationComparisons}
                  thresholds={thresholds}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={(loc) => {
                    setSelectedLocation(loc);
                    setPage(1);
                  }}
                />

                {/* 3. Recent Readings Data Table */}
                <ReadingsTable
                  readings={readings}
                  totalReadings={totalReadings}
                  page={page}
                  totalPages={totalPages}
                  locations={locations}
                  searchQuery={searchQuery}
                  selectedLocation={selectedLocation}
                  selectedStatus={selectedStatus}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSearchChange={(q) => {
                    setSearchQuery(q);
                    setPage(1);
                  }}
                  onLocationChange={(loc) => {
                    setSelectedLocation(loc);
                    setPage(1);
                  }}
                  onStatusChange={(st) => {
                    setSelectedStatus(st);
                    setPage(1);
                  }}
                  onSortChange={handleSortChange}
                  onPageChange={setPage}
                  onSelectReading={handleSelectReading}
                  onExportCsv={handleExportCsv}
                />
              </div>
            )}

            {currentView === 'map' && (
              <WaterPurityMap
                readings={allReadings.length > 0 ? allReadings : readings}
                thresholds={thresholds}
                onSelectReading={handleSelectReading}
                onNavigateToTrends={(loc) => {
                  setSelectedLocation(loc);
                  setCurrentView('trends');
                }}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onOpenCommunityReport={() => setCurrentView('community')}
              />
            )}

            {currentView === 'priority' && (
              <InvestigationPriorityView
                onSelectReading={handleSelectReading}
                onNavigateToMap={(loc) => {
                  setCurrentView('map');
                }}
              />
            )}

            {currentView === 'community' && <CommunityReportingView />}

            {currentView === 'explorer' && (
              <WaterQualityExplorer
                readings={allReadings.length > 0 ? allReadings : readings}
                locations={locations}
                thresholds={thresholds}
                onSelectReading={handleSelectReading}
                onExportCsv={handleExportCsv}
              />
            )}

            {currentView === 'trends' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Trends & Analytics Deep Dive
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Multi-temporal parameter dynamics, threshold exceedance envelopes, and station cross-correlations
                    </p>
                  </div>
                </div>

                <TrendCharts
                  trendData={trendData}
                  locationComparisons={locationComparisons}
                  thresholds={thresholds}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={(loc) => {
                    setSelectedLocation(loc);
                    setPage(1);
                  }}
                />
              </div>
            )}

            {currentView === 'alerts' && (
              <AlertsReview
                alerts={alerts}
                thresholds={thresholds}
                onOpenThresholds={() => setIsThresholdModalOpen(true)}
                onSelectReading={handleSelectReading}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={fetchAlerts}
              />
            )}

            {currentView === 'about' && <AboutPage />}
          </main>
        </div>
      )}

      {/* Modals */}
      <ReadingDetailModal
        reading={inspectReading}
        thresholds={thresholds}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
      />

      {thresholds && (
        <ThresholdSettingsModal
          thresholds={thresholds}
          isOpen={isThresholdModalOpen}
          onClose={() => setIsThresholdModalOpen(false)}
          onSave={handleSaveThresholds}
        />
      )}

      <DataUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={loadAllData}
      />

      <ReportGenerationModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        summary={summary}
        readings={allReadings.length > 0 ? allReadings : readings}
        thresholds={thresholds}
      />
    </div>
  );
}
