export interface Reading {
  id: string;
  station_id?: string;
  location: string;
  country?: string;
  district?: string;
  water_body?: string;
  main_basin?: string;
  station_type?: string;
  state?: string;
  timestamp: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  dissolved_oxygen?: number;
  nitrate_mg_l?: number;
  bod_mg_l?: number;
  conductivity_us_cm?: number;
  salinity_ppt?: number;
  elevation?: number;
  latitude?: number;
  longitude?: number;
  data_quality?: string;
  reporting_agency?: string;
  source?: string;
  status: 'Normal' | 'Needs Review' | 'High Priority' | 'Reviewed' | 'Needs Further Investigation';
  review_notes?: string;
  anomaly_reasons?: string[];
  z_scores?: Record<string, number>;
  ml_anomaly?: boolean;
  ml_anomaly_score?: number;
  is_illustrative?: boolean;
}

export interface ThresholdConfig {
  ph: { min: number; max: number };
  turbidity: { max: number };
  tds: { max: number };
  temperature: { min: number; max: number };
  dissolved_oxygen: { min: number };
  nitrate: { max: number };
  zScoreThreshold: number;
  iqrMultiplier: number;
  enableMlDetection: boolean;
}

export interface ParameterStat {
  avg: number;
  min: number;
  max: number;
}

export interface CountryStatItem {
  country: string;
  count: number;
  stationsCount: number;
}

export interface SummaryData {
  totalReadings: number;
  totalStations: number;
  totalCountries?: number;
  locationsMonitored: number;
  locationsList: string[];
  countriesList?: CountryStatItem[];
  parametersList?: string[];
  latestObservationDate?: string;
  districtsCount?: number;
  riversCount?: number;
  dataSourceName?: string;
  stateName?: string;
  flaggedReadings: number;
  highPriorityCount: number;
  reviewedCount: number;
  normalCount: number;
  anomalyRate: number;
  locationsRequiringFollowUp: number;
  latestMeasurement: Reading | null;
  parameterStats: {
    ph: ParameterStat;
    turbidity: ParameterStat;
    tds: ParameterStat;
    temperature: ParameterStat;
    dissolved_oxygen: ParameterStat;
    nitrate?: ParameterStat;
    conductivity?: ParameterStat;
    bod?: ParameterStat;
  };
  isIllustrativeData: boolean;
  gemstatInfo?: {
    title: string;
    doi: string;
    archiveVersion: string;
    license: string;
    attribution: string;
    portalUrl: string;
  };
}

export interface TrendPoint {
  id: string;
  timestamp: string;
  date: string;
  dateTime: string;
  location: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  dissolved_oxygen: number | null;
  nitrate_mg_l: number | null;
  status: string;
}

export interface LocationComparison {
  location: string;
  avgPh: number;
  avgTurbidity: number;
  avgTds: number;
  avgTemp: number;
  avgDo: number | null;
  avgNitrate: number | null;
  readingsCount: number;
}

export interface AlertItem {
  id: string;
  location: string;
  timestamp: string;
  status: 'Normal' | 'Needs Review' | 'High Priority' | 'Reviewed' | 'Needs Further Investigation';
  reasons: string[];
  z_scores: Record<string, number>;
  review_notes: string;
  reading: Reading;
}

export interface StationGeoInfo {
  id: string;
  name: string;
  basin: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  environmentType: 'River Intake' | 'Upland Creek' | 'Deep Reservoir' | 'Tidal Estuary' | 'Headwater Spring' | 'Monitoring Station';
  latestReading?: Reading;
  purityScore: number; // 0-100 Water Quality Index (WQI)
  purityTier: 'Pristine' | 'Good' | 'Moderate' | 'Impaired';
  status: 'Normal' | 'Needs Review' | 'High Priority' | 'Reviewed' | 'Needs Further Investigation';
  readingsCount: number;
  avgPh: number;
  avgTurbidity: number;
  avgTds: number;
  avgTemp: number;
  avgDo: number | null;
  avgNitrate?: number | null;
}

export interface InvestigationPriorityItem {
  id: string;
  location: string;
  stationId: string;
  latitude: number;
  longitude: number;
  basin: string;
  priorityCategory: 'Review recommended' | 'Further verification needed' | 'Insufficient data' | 'Nominal';
  priorityScore: number; // 1-100 (higher = more urgent)
  samplingDate: string;
  availableMeasurements: string[];
  dataCompletenessPct: number;
  triggeredRules: string[];
  mlAnomalyDetected: boolean;
  suggestedNextStep: string;
  recommendedActionType: 'Check source records' | 'Repeat field measurement' | 'Consult certified environmental laboratory' | 'Calibrate probe sensor';
  latestReading?: Reading;
}

export interface CommunityReport {
  id: string;
  location: string;
  typeOfConcern: 'Discoloration' | 'Unusual Odor' | 'Dead Fish / Wildlife' | 'Foam / Chemical Sheen' | 'Suspicious Runoff' | 'Other';
  observationDate: string;
  description: string;
  waterBodyName?: string;
  status: 'Pending Verification' | 'Under Local Review' | 'Triaged';
  submittedAt: string;
  isVerified: false;
}

