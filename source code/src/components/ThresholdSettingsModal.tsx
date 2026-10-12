import React, { useState } from 'react';
import { ThresholdConfig } from '../types.ts';
import { X, Sliders, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

interface ThresholdSettingsModalProps {
  thresholds: ThresholdConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newThresholds: ThresholdConfig) => Promise<void>;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  thresholds,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<ThresholdConfig>({ ...thresholds });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleResetDefaults = () => {
    setForm({
      ph: { min: 6.5, max: 8.5 },
      turbidity: { max: 5.0 },
      tds: { max: 500 },
      temperature: { min: 5.0, max: 25.0 },
      dissolved_oxygen: { min: 6.0 },
      nitrate: { max: 10.0 },
      zScoreThreshold: 2.5,
      iqrMultiplier: 1.5,
      enableMlDetection: true,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.ph.min >= form.ph.max) {
      setError('pH minimum must be strictly lower than pH maximum.');
      return;
    }
    if (form.turbidity.max <= 0) {
      setError('Turbidity threshold must be positive.');
      return;
    }
    if (form.temperature.min >= form.temperature.max) {
      setError('Temperature minimum must be less than maximum.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update thresholds');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">
              Parametric Threshold Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* pH */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                pH Acceptable Bounds (WHO Standard: 6.5 – 8.5)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500">Min pH</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.ph.min}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ph: { ...form.ph, min: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Max pH</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.ph.max}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ph: { ...form.ph, max: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Turbidity & TDS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Max Turbidity (NTU)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={form.turbidity.max}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      turbidity: { max: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Max TDS (mg/L)
                </label>
                <input
                  type="number"
                  step="10"
                  value={form.tds.max}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tds: { max: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Temperature & Dissolved Oxygen */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Temperature Max (°C)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={form.temperature.max}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      temperature: { ...form.temperature, max: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Min Dissolved O2 (mg/L)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.dissolved_oxygen.min}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dissolved_oxygen: { min: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Nitrate & ML Detection */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Max Nitrate (NO₃-N mg/L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={form.nitrate?.max ?? 10.0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nitrate: { max: parseFloat(e.target.value) || 10.0 },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
                <span className="text-[10px] text-slate-400">WHO / EPA standard: 10.0 mg/L</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Method B: Isolation Forest
                </label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="mlToggle"
                    checked={form.enableMlDetection}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        enableMlDetection: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="mlToggle" className="text-xs text-slate-700 cursor-pointer">
                    Enable ML Anomaly Isolation
                  </label>
                </div>
              </div>
            </div>

            {/* Statistical Settings */}
            <div className="pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700 block mb-2">
                Statistical Outlier Tuning
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500">
                    Z-Score Sensitivity (σ)
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={form.zScoreThreshold}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        zScoreThreshold: parseFloat(e.target.value) || 2.5,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">
                    IQR Multiplier Factor
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={form.iqrMultiplier}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        iqrMultiplier: parseFloat(e.target.value) || 1.5,
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standards</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {saving ? 'Updating...' : 'Save & Recompute'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
