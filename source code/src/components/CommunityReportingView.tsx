import React, { useState, useEffect } from 'react';
import { CommunityReport } from '../types.ts';
import {
  MessageSquarePlus,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';

export const CommunityReportingView: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [location, setLocation] = useState('');
  const [waterBodyName, setWaterBodyName] = useState('');
  const [typeOfConcern, setTypeOfConcern] = useState<CommunityReport['typeOfConcern']>('Discoloration');
  const [observationDate, setObservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoSelected, setPhotoSelected] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      setErrorMsg('Please specify general location and description of your observation.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: location.trim(),
          waterBodyName: waterBodyName.trim() || undefined,
          typeOfConcern,
          observationDate,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccessMsg(data.message || 'Report logged successfully for screening.');
      setLocation('');
      setWaterBodyName('');
      setDescription('');
      setPhotoSelected(null);
      await fetchReports();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <span>Community Water Quality Observation Desk</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Crowdsourced environmental awareness channel for rural residents, agriculturalists, and watershed volunteers
        </p>
      </div>

      {/* Strict Privacy & Scientific Disclaimer Banner */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-900">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Notice on Community-Reported Observations</span>
        </div>
        <p className="leading-relaxed">
          Community reports serve strictly as <strong>early-warning qualitative screening pointers</strong> to identify where physical field sensor checks may be needed. Submissions are <strong>unverified observations</strong> and are never treated as certified chemical evidence or legal proof of pollution. We protect citizen privacy: no sensitive personal addresses, contact numbers, or identities are recorded or published.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>Log an Environmental Observation</span>
          </h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                General Location / Landmark <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., East Fork bridge crossing, Milepost 4"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Do not provide private residential addresses.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Water Body Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Cedar Creek, Silver River"
                value={waterBodyName}
                onChange={(e) => setWaterBodyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Type of Concern <span className="text-rose-500">*</span>
                </label>
                <select
                  value={typeOfConcern}
                  onChange={(e) => setTypeOfConcern(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Discoloration">Discoloration</option>
                  <option value="Unusual Odor">Unusual Odor</option>
                  <option value="Dead Fish / Wildlife">Dead Fish / Wildlife</option>
                  <option value="Foam / Chemical Sheen">Foam / Chemical Sheen</option>
                  <option value="Suspicious Runoff">Suspicious Runoff</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={observationDate}
                  onChange={(e) => setObservationDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe clarity, flow conditions, odor characteristics, or recent weather..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Simulated Photo Attachment */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Field Photo Attachment (Optional)
              </label>
              <label className="border border-dashed border-slate-300 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors text-slate-600">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">
                  {photoSelected ? photoSelected : 'Click to attach JPEG/PNG observation photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoSelected(e.target.files[0].name);
                    }
                  }}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Unverified Observation'}</span>
            </button>
          </form>
        </div>

        {/* Existing Community Reports List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Logged Community Observations Queue ({reports.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Transparent citizen records awaiting localized environmental screening
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
              Public Ledger
            </span>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {rep.id}
                    </span>
                    <span className="font-semibold text-xs text-slate-900">
                      {rep.location}
                    </span>
                    {rep.waterBodyName && (
                      <span className="text-[11px] text-slate-500 italic">
                        ({rep.waterBodyName})
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {rep.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    {rep.typeOfConcern}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Observed: {rep.observationDate}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  {rep.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Logged via Community Portal</span>
                  <span>Unverified Field Observation</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
