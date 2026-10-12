import React from 'react';
import { Logo } from './Logo.tsx';
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  ArrowRight,
  Database,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  MapPin,
  Users,
  Compass,
  FileCheck,
  Globe,
  Trees,
  Droplets,
  HeartHandshake,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenUpload: () => void;
  onOpenCommunityReport?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenUpload,
  onOpenCommunityReport,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline and Call-to-actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>SDG 6 · Community Environmental Intelligence Platform</span>
              </div>

              {/* Exact Hero Heading Requested */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Understand Water.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B3D3B] via-[#168AAD] to-[#56A66A]">
                  Protect Tomorrow.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                EcoWatch AI provides an accessible, community-grounded platform that unites water-quality data, interactive GIS reach mapping, explainable screening anomaly detection, and prioritized field investigation queues for rural communities, local authorities, and watershed volunteers.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Activity className="w-4 h-4" />
                  <span>Explore Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </button>

                {onOpenCommunityReport && (
                  <button
                    onClick={onOpenCommunityReport}
                    className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Droplets className="w-4 h-4 text-emerald-600" />
                    <span>Report Local Concern</span>
                  </button>
                )}
              </div>

              {/* Trust & SDG Indicators */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-lg font-mono">
                    UN SDG 6
                  </div>
                  <div className="text-slate-500">Clean Water & Sanitation</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-lg font-mono">
                    UN SDG 11
                  </div>
                  <div className="text-slate-500">Sustainable Communities</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-lg font-mono">
                    UN SDG 15
                  </div>
                  <div className="text-slate-500">Life on Land & Watersheds</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 aspect-16/10 sm:aspect-4/3 group">
                <img
                  src="/src/assets/images/hero_water_landscape_1791733620596.jpg"
                  alt="Pristine mountain river catchment ecosystem monitored by EcoWatch AI"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span>Continuous Catchment Awareness</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    Empowering rural watersheds and civic monitors with verified geospatial reaches, screening rules, and laboratory triage priority.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Beneficiaries Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Social Impact Focus
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Built for Community Stewards & Water Protectors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Bridging complex technical chemical reports with accessible, community-ready insights for decision makers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="p-2 w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Rural Communities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent, plain-language interpretations for areas reliant on local groundwater wells and community streams.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="p-2 w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Trees className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Farmers & Agriculturalists</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track nitrate and salinity fluctuations, protecting irrigation sources and managing seasonal fertilizer runoff.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="p-2 w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Volunteers & NGOs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empower citizen-science water testing initiatives with standardized CSV ingestion and report dossiers.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="p-2 w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Researchers & Students</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore time-series trends across multi-year parameters, evaluate baseline shifts, and export clean research tables.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="p-2 w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Local Authorities</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Target limited field-sampling budgets with prioritized follow-up schedules based on data completeness and severity.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Core Technological Capabilities
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Built from the ground up for transparent environmental screening and rigorous mathematical explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Water Quality Monitoring
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track critical indicators including pH, turbidity, dissolved oxygen, nitrate, TDS, and temperature with clear unit labels and data source notes.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-5 text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore live stations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                GIS Reach Mapping
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive catchment maps with verified station coordinates, purity indices (0–100 WQI), topography reaches, and accessible list views.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="mt-5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View geospatial map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                AI-Assisted Anomaly Detection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent screening rules (Method A) paired with optional Isolation Forest multi-parameter divergence (Method B) with plain-language reasons.
              </p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="mt-5 text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Review anomaly flags</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Investigation Priority
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ranked order of river reaches needing follow-up: Review Recommended, Further Verification, or Insufficient Data with concrete next steps.
              </p>
            </div>
            <button
              onClick={() => onNavigate('priority')}
              className="mt-5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect priority queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* UN Sustainable Development Goals (SDG) Alignment Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Globe className="w-3.5 h-3.5" />
              <span>United Nations 2030 Agenda Alignment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Advancing Sustainable Development Goals
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              EcoWatch AI directly supports three core Sustainable Development Goals by making environmental data accessible to local communities, civil society, and municipal stewards:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                <span className="font-mono font-bold text-sky-400 text-sm">SDG 6</span>
                <h4 className="font-bold text-sm">Clean Water & Sanitation</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Support Target 6.3 (improving water quality by eliminating dumping and minimizing release of hazardous chemicals) and 6.b (supporting local community participation).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                <span className="font-mono font-bold text-amber-400 text-sm">SDG 11</span>
                <h4 className="font-bold text-sm">Sustainable Communities</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enhance inclusive community environmental governance and protect municipal water reservoirs from unmonitored point-source discharges.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1.5">
                <span className="font-mono font-bold text-emerald-400 text-sm">SDG 15</span>
                <h4 className="font-bold text-sm">Life on Land & Ecosystems</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Conserve inland freshwater aquatic ecosystems, mitigate agricultural eutrophication, and safeguard biodiversity in vulnerable river basins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section with 3 Steps */}
      <section id="how-it-works-section" className="bg-slate-100/70 border-y border-slate-200 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How EcoWatch AI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              A transparent, reliable 3-stage pipeline connecting field data to actionable community priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-sky-800 text-white flex items-center justify-center font-bold text-xs mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Upload & Ingest Data
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Import CSV measurements with validation of coordinate bounds, parameter ranges, and units. Never discards rows silently; provides clear validation reports.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Multi-Method Screening
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies transparent threshold checks (Method A) and optional Isolation Forest machine learning (Method B) to identify statistical outliers without black-box confusion.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Prioritize & Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rank stations into Review Recommended, Further Verification, or Insufficient Data. Download tailored dossiers and log community field observations.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Launch Operations Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Logo size="md" showTagline={true} />
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed mt-2">
              EcoWatch AI provides water quality data intelligence, GIS reach exploration, and explainable anomaly screening for rural watersheds, farmers, and community organizations.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Operations Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  GIS Water Purity Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('priority')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Investigation Priority Queue
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('community')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Community Observation Desk
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-3">
              Data & Verification
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={onOpenUpload}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  CSV Data Importer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-sky-700 transition-colors cursor-pointer"
                >
                  About & Methodology
                </button>
              </li>
              <li>
                <a
                  href="/api/sample-csv"
                  className="hover:text-sky-700 transition-colors"
                >
                  Download Sample CSV
                </a>
              </li>
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-sky-700 transition-colors"
                >
                  System Health (REST API)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Responsible-Use Disclaimer Required by Prompt */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-2">
          <p>
            <strong>Responsible-Use Environmental Disclaimer:</strong> EcoWatch AI is an informational screening and environmental awareness tool. <strong>It does not certify that water is safe to drink or legally prove water pollution.</strong> Statistical and ML anomaly flags indicate empirical deviations from baseline ranges or expected multi-parameter correlations. All flagged measurements must be verified against certified laboratory spectrophotometric testing and applicable municipal standards before taking health or legal actions.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-400 pt-2">
            <span>© 2026 EcoWatch AI. Understand Water. Protect Tomorrow.</span>
            <span>UN SDGs 6 · 11 · 15 Alignment Standard</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
