import { Reading, StationGeoInfo } from '../types.ts';

// Standard station geographic catalog
export const KNOWN_STATIONS_GEO: Record<
  string,
  {
    basin: string;
    latitude: number;
    longitude: number;
    elevationMeters: number;
    environmentType: StationGeoInfo['environmentType'];
  }
> = {
  'Silver River Intake': {
    basin: 'Willamette-Columbia River Confluence Basin',
    latitude: 45.492,
    longitude: -122.653,
    elevationMeters: 42,
    environmentType: 'River Intake',
  },
  'Cedar Creek Watershed': {
    basin: 'Cedar River Forested Sub-Basin',
    latitude: 45.545,
    longitude: -122.482,
    elevationMeters: 195,
    environmentType: 'Upland Creek',
  },
  'Blue Lake Reservoir': {
    basin: 'Cascade Foothills Hydrological Catchment',
    latitude: 45.558,
    longitude: -122.441,
    elevationMeters: 310,
    environmentType: 'Deep Reservoir',
  },
  'Pine Valley Estuary': {
    basin: 'Lower Valley Tidal Transition Zone',
    latitude: 45.362,
    longitude: -122.812,
    elevationMeters: 14,
    environmentType: 'Tidal Estuary',
  },
  'Highland Springs Run': {
    basin: 'Alpine Headwaters Protected Sanctuary',
    latitude: 45.62,
    longitude: -122.38,
    elevationMeters: 680,
    environmentType: 'Headwater Spring',
  },
};

/**
 * Calculates a standard 0–100 Water Quality Index (WQI) based on EPA & NSF guidelines.
 */
export function calculateWQI(reading: Partial<Reading>): {
  score: number;
  tier: StationGeoInfo['purityTier'];
  label: string;
  color: string;
  breakdown: Record<string, number>;
} {
  const ph = reading.ph ?? 7.0;
  const turb = reading.turbidity ?? 1.0;
  const tds = reading.tds ?? 200;
  const temp = reading.temperature ?? 15.0;
  const doVal = reading.dissolved_oxygen ?? 8.5;

  // 1. pH Sub-index (Optimal 7.0 - 7.6)
  let qPh = 100;
  const phDelta = Math.abs(ph - 7.3);
  if (phDelta <= 0.3) qPh = 100;
  else if (phDelta <= 0.8) qPh = 85;
  else if (phDelta <= 1.2) qPh = 65;
  else if (phDelta <= 1.8) qPh = 40;
  else qPh = 15;

  // 2. Turbidity Sub-index (NTU)
  let qTurb = 100;
  if (turb <= 1.0) qTurb = 100;
  else if (turb <= 3.0) qTurb = 88;
  else if (turb <= 5.0) qTurb = 72;
  else if (turb <= 8.0) qTurb = 48;
  else if (turb <= 15.0) qTurb = 25;
  else qTurb = 10;

  // 3. Dissolved Oxygen Sub-index (mg/L)
  let qDo = 100;
  if (doVal >= 9.0) qDo = 100;
  else if (doVal >= 7.5) qDo = 90;
  else if (doVal >= 6.0) qDo = 75;
  else if (doVal >= 4.5) qDo = 45;
  else qDo = 20;

  // 4. TDS Sub-index (mg/L)
  let qTds = 100;
  if (tds <= 200) qTds = 100;
  else if (tds <= 350) qTds = 85;
  else if (tds <= 500) qTds = 70;
  else if (tds <= 700) qTds = 45;
  else qTds = 20;

  // 5. Temperature Sub-index (°C)
  let qTemp = 100;
  if (temp >= 10 && temp <= 18) qTemp = 100;
  else if (temp < 10 && temp >= 6) qTemp = 90;
  else if (temp > 18 && temp <= 22) qTemp = 82;
  else if (temp > 22 && temp <= 26) qTemp = 60;
  else qTemp = 40;

  // Weights sum to 1.0 (DO 0.30, Turbidity 0.25, pH 0.20, TDS 0.15, Temp 0.10)
  const compositeScore = Math.round(
    qDo * 0.3 + qTurb * 0.25 + qPh * 0.2 + qTds * 0.15 + qTemp * 0.1
  );

  let tier: StationGeoInfo['purityTier'] = 'Pristine';
  let label = 'Pristine Purity';
  let color = '#10B981'; // Emerald

  if (compositeScore >= 90) {
    tier = 'Pristine';
    label = 'Pristine Water Quality';
    color = '#10B981';
  } else if (compositeScore >= 75) {
    tier = 'Good';
    label = 'Good / Potable Baseline';
    color = '#0B6FB8';
  } else if (compositeScore >= 60) {
    tier = 'Moderate';
    label = 'Moderate Caution / Non-Critical';
    color = '#F59E0B';
  } else {
    tier = 'Impaired';
    label = 'Impaired / High Priority';
    color = '#EF4444';
  }

  return {
    score: compositeScore,
    tier,
    label,
    color,
    breakdown: {
      dissolvedOxygenScore: qDo,
      turbidityScore: qTurb,
      phScore: qPh,
      tdsScore: qTds,
      temperatureScore: qTemp,
    },
  };
}

/**
 * Builds the list of StationGeoInfo from readings and geographic catalog.
 */
export function buildStationGeoList(readings: Reading[]): StationGeoInfo[] {
  const stationMap: Record<string, Reading[]> = {};
  readings.forEach((r) => {
    if (!stationMap[r.location]) stationMap[r.location] = [];
    stationMap[r.location].push(r);
  });

  return Object.entries(stationMap).map(([name, records], idx) => {
    // Sort latest first
    const sorted = [...records].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const latest = sorted[0];

    const known = KNOWN_STATIONS_GEO[name] || {
      basin: `Basin Catchment Sector ${idx + 1}`,
      latitude: 45.40 + (idx * 0.05),
      longitude: -122.60 - (idx * 0.04),
      elevationMeters: 50 + idx * 80,
      environmentType: 'Monitoring Station' as const,
    };

    const wqi = calculateWQI(latest);

    const count = records.length;
    const avgPh = Number((records.reduce((s, r) => s + r.ph, 0) / count).toFixed(2));
    const avgTurb = Number((records.reduce((s, r) => s + r.turbidity, 0) / count).toFixed(2));
    const avgTds = Number((records.reduce((s, r) => s + r.tds, 0) / count).toFixed(0));
    const avgTemp = Number((records.reduce((s, r) => s + r.temperature, 0) / count).toFixed(1));

    const doRecords = records.filter((r) => typeof r.dissolved_oxygen === 'number');
    const avgDo =
      doRecords.length > 0
        ? Number((doRecords.reduce((s, r) => s + (r.dissolved_oxygen || 0), 0) / doRecords.length).toFixed(2))
        : null;

    return {
      id: `STN-${100 + idx}`,
      name,
      basin: known.basin,
      latitude: known.latitude,
      longitude: known.longitude,
      elevationMeters: known.elevationMeters,
      environmentType: known.environmentType,
      latestReading: latest,
      purityScore: wqi.score,
      purityTier: wqi.tier,
      status: latest.status,
      readingsCount: count,
      avgPh,
      avgTurbidity: avgTurb,
      avgTds: avgTds,
      avgTemp,
      avgDo,
    };
  });
}
