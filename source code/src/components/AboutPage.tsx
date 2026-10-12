import React from 'react';
import { Logo } from './Logo.tsx';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  BookOpen,
  Scale,
  Award,
  Layers,
  Activity,
  FileSpreadsheet,
  Globe,
  Trees,
  Users,
  Compass,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <Logo size="lg" showTagline={true} className="justify-center" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4">
          Understand Water. Protect Tomorrow.
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          EcoWatch AI bridges continuous physical environmental sensing with explainable mathematical data science to protect freshwater watersheds, municipal intakes, and coastal ecosystems.
        </p>
      </div>

      {/* UN Sustainable Development Goals (SDGs) Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-emerald-700" />
          <h3 className="text-base font-bold text-slate-900">
            UN Sustainable Development Goals (SDGs) Alignment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl space-y-2">
            <span className="font-mono font-bold text-sky-800 text-sm">SDG 6</span>
            <h4 className="font-bold text-slate-900">Clean Water & Sanitation</h4>
            <p className="text-slate-600 leading-relaxed">
              Target 6.3: Improving water quality by reducing pollution and minimizing release of hazardous chemicals.<br/>
              Target 6.b: Supporting local community participation in water and sanitation management.
            </p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl space-y-2">
            <span className="font-mono font-bold text-amber-800 text-sm">SDG 11</span>
            <h4 className="font-bold text-slate-900">Sustainable Communities</h4>
            <p className="text-slate-600 leading-relaxed">
              Enhancing inclusive municipal planning and protecting community watershed infrastructure from unmonitored point-source discharges.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2">
            <span className="font-mono font-bold text-emerald-800 text-sm">SDG 15</span>
            <h4 className="font-bold text-slate-900">Life on Land & Watersheds</h4>
            <p className="text-slate-600 leading-relaxed">
              Target 15.1: Conserving inland freshwater ecosystems, preventing agricultural eutrophication, and protecting endangered riparian wildlife.
            </p>
          </div>
        </div>
      </div>

      {/* Target Beneficiaries */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Users className="w-5 h-5 text-indigo-700" />
          <h3 className="text-base font-bold text-slate-900">
            Target Beneficiaries & Social Impact
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Rural & Underserved Communities</h4>
            <p>
              Provides understandable water quality metrics without requiring professional laboratory chemistry backgrounds, enabling grassroots advocacy.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Farmers & Agricultural Producers</h4>
            <p>
              Enables real-time tracking of runoff nitrates and total dissolved solids, protecting irrigation supplies and minimizing downstream impact.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Environmental Volunteers & NGOs</h4>
            <p>
              Provides standardized CSV data ingestion tools, automated outlier screening, and downloadable report dossiers for regional conservation.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">Local Environmental Authorities</h4>
            <p>
              Ranks monitoring reaches to help inspectors allocate scarce field-sampling budgets to locations with the highest verification urgency.
            </p>
          </div>
        </div>
      </div>

      {/* Core Environmental Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-sky-700" />
          <h3 className="text-base font-bold text-slate-900">
            Water Quality Parameter Reference & Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">pH Level</span>
              <span className="font-mono text-sky-700 font-semibold">6.50 – 8.50</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Measures hydrogen ion concentration. Natural freshwater typically ranges between 6.5 and 8.5. Values below 6.5 indicate potential acid deposition, while values exceeding 8.5 often reflect algal photosynthetic blooms.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Turbidity</span>
              <span className="font-mono text-amber-700 font-semibold">&le; 5.0 NTU</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Measures water clarity using optical nephelometry. Elevated turbidity indicates suspended particulates, erosion runoff, or microorganisms that impede UV disinfection.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Dissolved Oxygen (DO)</span>
              <span className="font-mono text-emerald-700 font-semibold">&ge; 6.0 mg/L</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The oxygen available to sustain aquatic organisms. Values beneath 4.0 mg/L constitute acute hypoxia, endangering benthic life and marking eutrophic collapse.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Nitrate (NO₃-N)</span>
              <span className="font-mono text-blue-700 font-semibold">&le; 10.0 mg/L</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Key indicator of fertilizer runoff, feedlot drainage, or septic leachate. Values exceeding 10 mg/L violate drinking water standards and spur toxic cyanobacteria.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Anomaly Detection Methods (Method A & Method B) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900">
            Dual Anomaly Detection Methodology
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900">Method A: Transparent Screening Rules</h4>
              <p>
                Strict, auditable parametric checks comparing measurements directly against EPA and WHO drinking/ecological standards, paired with Gaussian Z-scores (|Z| &gt; 2.5σ) and Interquartile Range (IQR) limits.
              </p>
            </div>

            <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900">Method B: Isolation Forest Machine Learning</h4>
              <p>
                Unsupervised ensemble Isolation Forest modeling that isolates unusual multi-parameter combinations across normalized vectors [pH, Turbidity, DO, Nitrate, TDS, Temp] that escape single-variable threshold rules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Responsible-Use Policy */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3 text-amber-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
          <span>Responsible-Use Protocol & Regulatory Validation Disclaimer</span>
        </div>
        <p className="text-xs leading-relaxed">
          EcoWatch AI is intentionally designed to support environmental screening and rapid situational awareness. <strong>Anomalous measurements or statistical flags generated by the software must never be represented as definitive legal proof of water toxicity or regulatory non-compliance.</strong> Physical sensor drift, biofouling, and probe detachment can produce artificial outliers. All flagged readings must be cross-referenced with field probe recalibration and confirmatory analytical testing performed by certified environmental testing laboratories.
        </p>
      </div>
    </div>
  );
};
