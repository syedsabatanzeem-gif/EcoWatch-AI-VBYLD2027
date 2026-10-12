import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Reading, ThresholdConfig } from '../types.ts';
import {
  Compass,
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Sliders,
  Eye,
  Activity,
  UploadCloud,
  MessageSquarePlus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Info,
  Calendar,
  Database,
  Layers,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

interface GeocodeResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  boundingbox?: [string, string, string, string];
  address?: Record<string, string>;
}

interface StationMarkerData {
  id: string;
  stationCode?: string;
  name: string;
  district?: string;
  waterBody?: string;
  latitude: number;
  longitude: number;
  latestReading: Reading;
  allReadings: Reading[];
  isFlagged: boolean;
  status: Reading['status'];
  flagReasons: string[];
  source: string;
  sampleDate: string;
}

interface WaterPurityMapProps {
  readings: Reading[];
  thresholds?: ThresholdConfig;
  onSelectReading: (reading: Reading) => void;
  onNavigateToTrends?: (location: string) => void;
  onOpenUpload?: () => void;
  onOpenCommunityReport?: () => void;
}

// Calculate Great Circle Distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface MapAction {
  id: number;
  type: 'world' | 'flyTo' | 'fitBounds';
  center?: [number, number];
  zoom?: number;
  bounds?: [[number, number], [number, number]];
}

// Map Controller for safe, non-looping programmatic movements and viewport monitoring
function MapViewController({
  action,
  verifiedStations,
  onVisibleCountChange,
}: {
  action: MapAction | null;
  verifiedStations: StationMarkerData[];
  onVisibleCountChange: (count: number, centerLat: number, centerLng: number) => void;
}) {
  const map = useMap();
  const lastActionIdRef = useRef<number | null>(null);
  const onVisibleCountChangeRef = useRef(onVisibleCountChange);
  onVisibleCountChangeRef.current = onVisibleCountChange;

  const verifiedStationsRef = useRef(verifiedStations);
  verifiedStationsRef.current = verifiedStations;

  // Execute one-time map navigation actions safely
  useEffect(() => {
    if (!action || action.id === lastActionIdRef.current) return;
    lastActionIdRef.current = action.id;

    if (action.type === 'world') {
      map.flyTo([20, 0], 2, { duration: 1.2 });
    } else if (action.type === 'fitBounds' && action.bounds) {
      map.flyToBounds(action.bounds, {
        padding: [50, 50],
        maxZoom: 14,
        duration: 1.2,
      });
    } else if (action.type === 'flyTo' && action.center && action.zoom !== undefined) {
      map.flyTo(action.center, action.zoom, { duration: 1.2 });
    }
  }, [map, action]);

  // Update visible stations count ONLY when movement completely stops
  useMapEvents({
    moveend: () => {
      try {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const stations = verifiedStationsRef.current;
        const count = stations.filter((st) =>
          bounds.contains(new L.LatLng(st.latitude, st.longitude))
        ).length;
        onVisibleCountChangeRef.current(count, center.lat, center.lng);
      } catch (e) {
        // Safe guard against unmounted map
      }
    },
  });

  return null;
}

// Create custom distinct marker icons
function createStationIcon(isFlagged: boolean, isSelected: boolean) {
  if (isFlagged) {
    // Flagged station: Bold warning amber/red with pulsing beacon ring
    return L.divIcon({
      className: 'custom-station-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
          <!-- Pulsing Alert Beacon -->
          <span class="absolute w-10 h-10 -top-1 rounded-full bg-rose-500/30 animate-ping"></span>
          
          <!-- Outer Halo -->
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white shadow-lg border-2 border-white ring-2 ring-rose-400/50 transition-transform duration-200 group-hover:scale-125 ${
            isSelected ? 'scale-125 ring-4 ring-rose-500' : ''
          }">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </div>
          <!-- Pin pointer -->
          <div class="w-2 h-2 bg-rose-600 rotate-45 -mt-1 border-r border-b border-white"></div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -42],
    });
  }

  // Normal / Verified station: Emerald / River blue with calm clean water droplet
  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
        <!-- Calm Halo -->
        <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-sky-700 text-white shadow-md border-2 border-white ring-2 ring-sky-300/40 transition-transform duration-200 group-hover:scale-125 ${
          isSelected ? 'scale-125 ring-4 ring-sky-500 bg-sky-800' : ''
        }">
          <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        <!-- Pin pointer -->
        <div class="w-1.5 h-1.5 bg-sky-700 rotate-45 -mt-0.5 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

function createSearchLocationIcon() {
  return L.divIcon({
    className: 'custom-search-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full">
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white shadow-xl border-2 border-white ring-4 ring-indigo-300/50 animate-bounce">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
        <div class="w-2 h-2 bg-indigo-600 rotate-45 -mt-1 border-r border-b border-white"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

export const WaterPurityMap: React.FC<WaterPurityMapProps> = ({
  readings,
  thresholds,
  onSelectReading,
  onNavigateToTrends,
  onOpenUpload,
  onOpenCommunityReport,
}) => {
  // Map Action Command State
  const [mapAction, setMapAction] = useState<MapAction | null>(null);

  // Selected station
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Search & Geocoding State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [selectedSearchPlace, setSelectedSearchPlace] = useState<GeocodeResult | null>(null);

  // Viewport tracking for empty-state detection (initial: all verified stations visible on world view)
  const [visibleStationCount, setVisibleStationCount] = useState<number>(() => {
    return readings.filter(
      (r) =>
        typeof r.latitude === 'number' &&
        !isNaN(r.latitude) &&
        typeof r.longitude === 'number' &&
        !isNaN(r.longitude)
    ).length;
  });
  const [mapCenterCoords, setMapCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: 20,
    lng: 0,
  });

  // Tile layer style selection
  const [tileStyle, setTileStyle] = useState<'osm' | 'terrain' | 'voyager'>('osm');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Build verified station list strictly from actual dataset latitude & longitude
  const verifiedStations = useMemo<StationMarkerData[]>(() => {
    const stationMap: Record<string, Reading[]> = {};
    readings.forEach((r) => {
      // Must have valid numeric coordinates from dataset
      if (
        typeof r.latitude === 'number' &&
        !isNaN(r.latitude) &&
        typeof r.longitude === 'number' &&
        !isNaN(r.longitude)
      ) {
        if (!stationMap[r.location]) stationMap[r.location] = [];
        stationMap[r.location].push(r);
      }
    });

    return Object.entries(stationMap).map(([name, records]) => {
      const sorted = [...records].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const latest = sorted[0];

      const isFlagged =
        latest.status === 'High Priority' ||
        latest.status === 'Needs Review' ||
        latest.status === 'Needs Further Investigation' ||
        Boolean(latest.anomaly_reasons && latest.anomaly_reasons.length > 0);

      const reasons = latest.anomaly_reasons || [];

      return {
        id: latest.station_id || latest.id,
        stationCode: latest.station_id || latest.id,
        name,
        district: latest.district,
        waterBody: latest.water_body,
        latitude: latest.latitude!,
        longitude: latest.longitude!,
        latestReading: latest,
        allReadings: records,
        isFlagged,
        status: latest.status,
        flagReasons: reasons,
        source: latest.source || 'CPCB - NWMP / APPCB',
        sampleDate: latest.timestamp,
      };
    });
  }, [readings]);

  // Selected station object
  const activeStation = useMemo(() => {
    return verifiedStations.find((s) => s.id === selectedStationId) || null;
  }, [verifiedStations, selectedStationId]);

  // Nearest verified station to current map center or searched place
  const nearestStationInfo = useMemo(() => {
    if (verifiedStations.length === 0) return null;
    const refLat = selectedSearchPlace
      ? parseFloat(selectedSearchPlace.lat)
      : mapCenterCoords.lat;
    const refLon = selectedSearchPlace
      ? parseFloat(selectedSearchPlace.lon)
      : mapCenterCoords.lng;

    let minDistance = Infinity;
    let closestStation: StationMarkerData = verifiedStations[0];

    verifiedStations.forEach((st) => {
      const d = calculateDistanceKm(refLat, refLon, st.latitude, st.longitude);
      if (d < minDistance) {
        minDistance = d;
        closestStation = st;
      }
    });

    return {
      station: closestStation,
      distanceKm: minDistance,
    };
  }, [verifiedStations, selectedSearchPlace, mapCenterCoords]);

  // Catalog search, filters and pagination states
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogDistrict, setCatalogDistrict] = useState('all');
  const [catalogRiver, setCatalogRiver] = useState('all');
  const [catalogStatus, setCatalogStatus] = useState('all');
  const [catalogPage, setCatalogPage] = useState(1);
  const catalogPageSize = 8;

  // Extract unique districts and rivers from verified stations
  const availableDistricts = useMemo(() => {
    return Array.from(
      new Set(verifiedStations.map((s) => s.district).filter((d): d is string => Boolean(d)))
    ).sort();
  }, [verifiedStations]);

  const availableRivers = useMemo(() => {
    return Array.from(
      new Set(verifiedStations.map((s) => s.waterBody).filter((w): w is string => Boolean(w)))
    ).sort();
  }, [verifiedStations]);

  // Filtered stations for catalog
  const filteredCatalogStations = useMemo(() => {
    return verifiedStations.filter((s) => {
      if (catalogSearch) {
        const q = catalogSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCode = (s.stationCode || s.id).toLowerCase().includes(q);
        const matchesDistrict = (s.district || '').toLowerCase().includes(q);
        const matchesRiver = (s.waterBody || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDistrict && !matchesRiver) return false;
      }
      if (catalogDistrict !== 'all' && s.district?.toLowerCase() !== catalogDistrict.toLowerCase()) {
        return false;
      }
      if (catalogRiver !== 'all' && s.waterBody?.toLowerCase() !== catalogRiver.toLowerCase()) {
        return false;
      }
      if (catalogStatus !== 'all') {
        if (catalogStatus === 'flagged' && !s.isFlagged) return false;
        if (catalogStatus === 'normal' && s.isFlagged) return false;
      }
      return true;
    });
  }, [verifiedStations, catalogSearch, catalogDistrict, catalogRiver, catalogStatus]);

  const catalogTotalPages = Math.max(1, Math.ceil(filteredCatalogStations.length / catalogPageSize));
  const paginatedCatalogStations = useMemo(() => {
    const start = (catalogPage - 1) * catalogPageSize;
    return filteredCatalogStations.slice(start, start + catalogPageSize);
  }, [filteredCatalogStations, catalogPage, catalogPageSize]);

  // Safe viewport change handler that updates state only when values truly change
  const handleVisibleCountChange = useCallback(
    (count: number, centerLat: number, centerLng: number) => {
      setVisibleStationCount((prev) => (prev !== count ? count : prev));
      setMapCenterCoords((prev) => {
        if (
          Math.abs(prev.lat - centerLat) > 0.05 ||
          Math.abs(prev.lng - centerLng) > 0.05
        ) {
          return { lat: centerLat, lng: centerLng };
        }
        return prev;
      });
    },
    []
  );

  // Perform geocoding via /api/geocode proxy (which rate-limits and uses compliant headers)
  const performGeocode = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setGeocodingError(null);
      return;
    }

    setIsSearching(true);
    setGeocodingError(null);

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        throw new Error(`Geocoding server error (${res.status})`);
      }
      const data = await res.json();
      if (data.error) {
        setGeocodingError(data.error);
        setSearchResults([]);
      } else if (Array.isArray(data.results)) {
        setSearchResults(data.results);
        setIsDropdownOpen(true);
        if (data.results.length === 0) {
          setGeocodingError('No geographical locations matched your search query.');
        }
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      console.warn('Geocoding query error:', err);
      // Fallback directly to client fetch if proxy fails
      try {
        const directRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query.trim()
          )}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (directRes.ok) {
          const directData = await directRes.json();
          setSearchResults(directData);
          setIsDropdownOpen(true);
          return;
        }
      } catch (fallbackErr) {
        // Ignored
      }
      setGeocodingError('Unable to reach geocoding service. Please check your network.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle typing in search input (debounced by 850ms to respect rate limits)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setGeocodingError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performGeocode(val);
      }, 850);
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (searchQuery.trim().length >= 2) {
      performGeocode(searchQuery);
    }
  };

  // User selects a location from the Nominatim geocoding results
  const handleSelectGeocodePlace = (place: GeocodeResult) => {
    setSelectedSearchPlace(place);
    setIsDropdownOpen(false);
    setSearchQuery(place.display_name);

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    if (isNaN(lat) || isNaN(lon)) return;

    if (place.boundingbox && place.boundingbox.length === 4) {
      const minLat = parseFloat(place.boundingbox[0]);
      const maxLat = parseFloat(place.boundingbox[1]);
      const minLon = parseFloat(place.boundingbox[2]);
      const maxLon = parseFloat(place.boundingbox[3]);

      if (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLon) && !isNaN(maxLon)) {
        setMapAction({
          id: Date.now(),
          type: 'fitBounds',
          bounds: [
            [minLat, minLon],
            [maxLat, maxLon],
          ],
        });
        return;
      }
    }

    // Determine zoom by category / place type
    let zoom = 12;
    const type = (place.type || '').toLowerCase();
    const category = (place.category || '').toLowerCase();

    if (type === 'country' || category === 'country') zoom = 5;
    else if (type === 'state' || type === 'province' || type === 'region') zoom = 7;
    else if (type === 'county' || type === 'district') zoom = 9;
    else if (type === 'city' || type === 'town') zoom = 11;
    else if (type === 'village' || type === 'suburb') zoom = 13;
    else if (type === 'road' || type === 'street' || type === 'building' || type === 'house') zoom = 16;

    setMapAction({
      id: Date.now(),
      type: 'flyTo',
      center: [lat, lon],
      zoom,
    });
  };

  // Reset to Whole World view
  const handleResetWorldView = () => {
    setSelectedSearchPlace(null);
    setMapAction({
      id: Date.now(),
      type: 'world',
    });
  };

  // Zoom directly to verified stations bounding box
  const handleFocusVerifiedStations = () => {
    if (verifiedStations.length === 0) return;
    const lats = verifiedStations.map((s) => s.latitude);
    const lons = verifiedStations.map((s) => s.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    setSelectedSearchPlace(null);
    setMapAction({
      id: Date.now(),
      type: 'fitBounds',
      bounds: [
        [minLat - 0.05, minLon - 0.05],
        [maxLat + 0.05, maxLon + 0.05],
      ],
    });
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & World Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
              <Globe className="w-5 h-5" />
            </div>
            <span>Global GIS Reach & Watershed Telemetry Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Global OpenStreetMap GIS integration • Telemetry marker screening • Verified sampling stations
          </p>
        </div>

        {/* Quick Map Controls & Layers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setTileStyle('osm')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tileStyle === 'osm'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OSM Standard
            </button>
            <button
              onClick={() => setTileStyle('voyager')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tileStyle === 'voyager'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Voyager Clear
            </button>
            <button
              onClick={() => setTileStyle('terrain')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                tileStyle === 'terrain'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hydrology Topo
            </button>
          </div>

          <button
            onClick={handleResetWorldView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Show the whole world"
          >
            <Globe className="w-3.5 h-3.5 text-sky-700" />
            <span>Whole World</span>
          </button>

          <button
            onClick={handleFocusVerifiedStations}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Zoom to verified telemetry stations"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Focus Verified Stations ({verifiedStations.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Place Search Bar (Nominatim) */}
      <div ref={searchContainerRef} className="relative z-30">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all">
            <div className="pl-3.5 pr-2 text-slate-400">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search any country, state, city, district, village, or address (e.g. 'Kenya', 'Tokyo', 'Willamette River', 'Paris', 'Rio de Janeiro')..."
              className="w-full py-2.5 px-1 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsDropdownOpen(false);
                  setSelectedSearchPlace(null);
                }}
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Search OSM
            </button>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
            <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>OpenStreetMap Nominatim Places ({searchResults.length})</span>
              <span className="text-[10px] text-slate-400">Rate-limited & compliant</span>
            </div>
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelectGeocodePlace(item)}
                className="w-full text-left p-3 hover:bg-sky-50/70 transition-colors flex items-start gap-3 cursor-pointer group"
              >
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {item.display_name}
                  </div>
                </div>
                {item.type && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                    {item.type.replace('_', ' ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Geocoding Error / Notice Banner */}
        {geocodingError && (
          <div className="mt-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{geocodingError}</span>
            </div>
            <button
              onClick={() => setGeocodingError(null)}
              className="text-amber-600 hover:text-amber-800 text-[11px] font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Suggestion Chips for Fast Global Exploration */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600 shrink-0">Explore Regions:</span>
          {[
            { label: 'Oregon Watershed (Data)', query: 'Willamette River, Oregon' },
            { label: 'Tokyo, Japan', query: 'Tokyo, Japan' },
            { label: 'Nairobi, Kenya', query: 'Nairobi, Kenya' },
            { label: 'Rhine River, Germany', query: 'Rhine River, Germany' },
            { label: 'Amazon Basin, Brazil', query: 'Manaus, Brazil' },
            { label: 'Ganges Basin, India', query: 'Varanasi, India' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => {
                setSearchQuery(chip.query);
                performGeocode(chip.query);
              }}
              className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main GIS Map Viewport & Station Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Map Viewport Area (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Map Status Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-700 font-semibold">
                  Verified Stations in View:{' '}
                  <span className="font-mono text-slate-900">{visibleStationCount}</span> /{' '}
                  <span className="font-mono text-slate-500">{verifiedStations.length}</span>
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3 text-slate-500">
                <span>Center:</span>
                <span className="font-mono text-[11px]">
                  {mapCenterCoords.lat.toFixed(2)}°, {mapCenterCoords.lng.toFixed(2)}°
                </span>
              </div>
            </div>

            {/* Marker Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium">
              <div className="flex items-center gap-1.5 text-sky-800">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-700 border border-white shadow-2xs"></span>
                <span>Normal Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shadow-2xs animate-pulse"></span>
                <span>Flagged for Review</span>
              </div>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="relative w-full h-[520px] sm:h-[580px] bg-slate-100">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={18}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              {/* Tile Layer Based on Style Selection */}
              {tileStyle === 'osm' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              )}
              {tileStyle === 'voyager' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
              )}
              {tileStyle === 'terrain' && (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, Tiles &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  maxZoom={17}
                />
              )}

              {/* View Controller */}
              <MapViewController
                action={mapAction}
                verifiedStations={verifiedStations}
                onVisibleCountChange={handleVisibleCountChange}
              />

              {/* Searched Location Marker */}
              {selectedSearchPlace && (
                <Marker
                  position={[
                    parseFloat(selectedSearchPlace.lat),
                    parseFloat(selectedSearchPlace.lon),
                  ]}
                  icon={createSearchLocationIcon()}
                >
                  <Popup>
                    <div className="p-3 min-w-[220px] space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Searched Location</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {selectedSearchPlace.display_name.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        {selectedSearchPlace.display_name}
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px]">
                        {visibleStationCount === 0 ? (
                          <div className="text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                            No physical water stations in this area. EcoWatch AI does not infer unverified data.
                          </div>
                        ) : (
                          <div className="text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                            {visibleStationCount} verified water station(s) nearby in view.
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Verified Water Monitoring Stations */}
              {verifiedStations.map((station) => {
                const isSelected = selectedStationId === station.id;
                const icon = createStationIcon(station.isFlagged, isSelected);

                return (
                  <Marker
                    key={station.id}
                    position={[station.latitude, station.longitude]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedStationId(station.id);
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-3.5 min-w-[260px] max-w-[320px] space-y-2.5">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                              {station.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {station.name}
                            </h4>
                          </div>

                          <div
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              station.isFlagged
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {station.status}
                          </div>
                        </div>

                        {/* Telemetry Snapshot Grid */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-lg font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px]">pH</span>
                            <span className="font-bold text-slate-800">
                              {station.latestReading.ph.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">TURBIDITY</span>
                            <span className="font-bold text-slate-800">
                              {station.latestReading.turbidity.toFixed(2)} NTU
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">DISSOLVED O₂</span>
                            <span className="font-bold text-slate-800">
                              {station.latestReading.dissolved_oxygen?.toFixed(2) ?? '—'} mg/L
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">TDS</span>
                            <span className="font-bold text-slate-800">
                              {Math.round(station.latestReading.tds)} mg/L
                            </span>
                          </div>
                        </div>

                        {/* Sampling Date & Source */}
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <div>
                            <span className="font-semibold text-slate-600">Sample Date:</span>{' '}
                            {formatDate(station.sampleDate)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-600">Data Source:</span>{' '}
                            {station.source}
                          </div>
                        </div>

                        {/* Explanation of Any Screening Flag */}
                        {station.isFlagged && station.flagReasons.length > 0 && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900 leading-snug">
                            <span className="font-bold text-rose-800 block mb-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Triggered Screening Rule:
                            </span>
                            {station.flagReasons[0]}
                          </div>
                        )}

                        {!station.isFlagged && (
                          <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[10px] text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>No screening rules triggered. Normal nominal parameters.</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-1 flex gap-1.5">
                          <button
                            onClick={() => onSelectReading(station.latestReading)}
                            className="flex-1 py-1 px-2 bg-sky-700 hover:bg-sky-800 text-white rounded text-[11px] font-semibold text-center transition-colors cursor-pointer"
                          >
                            Inspect Raw Telemetry
                          </button>
                          {onNavigateToTrends && (
                            <button
                              onClick={() => onNavigateToTrends(station.name)}
                              className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium text-center transition-colors cursor-pointer"
                            >
                              Trends
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* 4. Empty State Floating Overlay When No Data Exists in Visible Area */}
            {visibleStationCount === 0 && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-[1000] bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-amber-200 shadow-xl space-y-3 pointer-events-auto">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      No Verified Monitoring Stations in this Viewport
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      EcoWatch AI visualizes only genuine physical sensor telemetry. No stations,
                      measurements, or coverage estimates are fabricated or interpolated.
                    </p>
                  </div>
                </div>

                {nearestStationInfo && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-medium flex items-center justify-between">
                    <span>
                      Nearest verified station:{' '}
                      <strong className="text-slate-900">{nearestStationInfo.station.name}</strong>
                    </span>
                    <span className="font-mono font-bold text-sky-800">
                      ~{nearestStationInfo.distanceKm.toLocaleString()} km away
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={handleFocusVerifiedStations}
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Go to Verified Stations</span>
                  </button>

                  {onOpenUpload && (
                    <button
                      onClick={onOpenUpload}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Upload CSV for this region"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload CSV</span>
                    </button>
                  )}

                  {onOpenCommunityReport && (
                    <button
                      onClick={onOpenCommunityReport}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                      title="Report water concern"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />
                      <span>Report Concern</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Station Inspector & Directory Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Station Card */}
          {activeStation ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {activeStation.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeStation.isFlagged
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {activeStation.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {activeStation.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeStation.source}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedStationId(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Coordinates & Sample Timestamp */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-50 rounded-xl font-mono text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[9px]">LATITUDE / LONGITUDE</span>
                  {activeStation.latitude.toFixed(4)}°, {activeStation.longitude.toFixed(4)}°
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">SAMPLING TIMESTAMP</span>
                  {formatDate(activeStation.sampleDate)}
                </div>
              </div>

              {/* Measured Live Telemetry Grid */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Verified Chemical & Physical Readings
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">pH Balance</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {activeStation.latestReading.ph.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Turbidity</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {activeStation.latestReading.turbidity.toFixed(2)} NTU
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Total Dissolved Solids</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {Math.round(activeStation.latestReading.tds)} mg/L
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Dissolved Oxygen</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {activeStation.latestReading.dissolved_oxygen?.toFixed(2) ?? '—'} mg/L
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Temperature</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {activeStation.latestReading.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 text-[11px]">Nitrate (NO₃-N)</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {activeStation.latestReading.nitrate_mg_l !== undefined
                        ? `${activeStation.latestReading.nitrate_mg_l.toFixed(1)} mg/L`
                        : '—'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status or Anomaly Flag Explanation */}
              {activeStation.isFlagged ? (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Screening Rule Advisory</span>
                  </div>
                  <ul className="text-[11px] list-disc list-inside space-y-1 text-rose-800 leading-relaxed">
                    {activeStation.flagReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-600 pt-1">
                    Rule triggered for environmental triage; not an authoritative potable determination.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>All Screening Rules Clear</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    Measured water telemetry is within standard EPA and WHO drinking water baseline ranges.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onSelectReading(activeStation.latestReading)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Complete Sensor Record</span>
                </button>

                {onNavigateToTrends && (
                  <button
                    onClick={() => onNavigateToTrends(activeStation.name)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Historical Temporal Trends</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Select a Station Marker</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click any water monitoring marker on the map to inspect its chemical parameters, sampling date,
                data source, and screening explanations.
              </p>
            </div>
          )}

          {/* Verified Stations Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                  Verified Stations Catalog
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  <strong className="text-slate-800">{verifiedStations.length}</strong> Stations ·{' '}
                  <strong className="text-slate-800">{readings.length}</strong> Reports Analyzed
                </p>
              </div>
              <span className="text-[10px] bg-teal-50 text-teal-800 font-mono font-semibold px-2 py-0.5 rounded border border-teal-200/70">
                CPCB · APPCB Network
              </span>
            </div>

            {/* Safety Distinction Notice */}
            <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-100 text-[11px] text-slate-600 space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-sky-900">
                <Info className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span>Verified Source vs Drinking Safety</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Published measurements reflect official state agency screening samples. An official station record does not independently certify drinking water safety.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2 pt-0.5">
              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => {
                    setCatalogSearch(e.target.value);
                    setCatalogPage(1);
                  }}
                  placeholder="Search station, district, river, code..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white"
                />
                {catalogSearch && (
                  <button
                    onClick={() => {
                      setCatalogSearch('');
                      setCatalogPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* District & River Filters */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">District</label>
                  <select
                    value={catalogDistrict}
                    onChange={(e) => {
                      setCatalogDistrict(e.target.value);
                      setCatalogPage(1);
                    }}
                    className="w-full py-1 px-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 truncate"
                  >
                    <option value="all">All Districts ({availableDistricts.length})</option>
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Water Body</label>
                  <select
                    value={catalogRiver}
                    onChange={(e) => {
                      setCatalogRiver(e.target.value);
                      setCatalogPage(1);
                    }}
                    className="w-full py-1 px-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 truncate"
                  >
                    <option value="all">All Water Bodies ({availableRivers.length})</option>
                    {availableRivers.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 text-[11px] pt-0.5">
                <button
                  onClick={() => {
                    setCatalogStatus('all');
                    setCatalogPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    catalogStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({filteredCatalogStations.length})
                </button>
                <button
                  onClick={() => {
                    setCatalogStatus('flagged');
                    setCatalogPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    catalogStatus === 'flagged'
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Flagged ({verifiedStations.filter((s) => s.isFlagged).length})
                </button>
                <button
                  onClick={() => {
                    setCatalogStatus('normal');
                    setCatalogPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    catalogStatus === 'normal'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Normal ({verifiedStations.filter((s) => !s.isFlagged).length})
                </button>
              </div>
            </div>

            {/* Station List or Empty State */}
            {filteredCatalogStations.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">No matching stations found</p>
                <p className="text-[11px] text-slate-500">
                  Try adjusting the district filter or search query.
                </p>
                <button
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogDistrict('all');
                    setCatalogRiver('all');
                    setCatalogStatus('all');
                    setCatalogPage(1);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                {paginatedCatalogStations.map((st) => {
                  const isSelected = selectedStationId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStationId(st.id);
                        setMapAction({
                          id: Date.now(),
                          type: 'flyTo',
                          center: [st.latitude, st.longitude],
                          zoom: 14,
                        });
                      }}
                      className={`p-2.5 rounded-lg flex flex-col gap-1 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50/90 border border-sky-300 font-semibold shadow-2xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                              st.isFlagged ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600'
                            }`}
                          />
                          <div className="truncate text-xs">
                            <div className="text-slate-900 font-medium truncate" title={st.name}>
                              {st.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                              {st.stationCode && (
                                <span className="font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {st.stationCode}
                                </span>
                              )}
                              {st.district && (
                                <span className="text-teal-700 font-medium">{st.district}</span>
                              )}
                              {st.waterBody && (
                                <span className="text-slate-400">· {st.waterBody}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              st.isFlagged
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {st.status}
                          </span>
                        </div>
                      </div>

                      {/* Coordinates and parameter summary */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pl-4">
                        <span>
                          {st.latitude.toFixed(3)}°N, {st.longitude.toFixed(3)}°E
                        </span>
                        <span className="text-slate-400">
                          pH {st.latestReading.ph.toFixed(1)} · Turb {st.latestReading.turbidity.toFixed(1)} NTU
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredCatalogStations.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Showing {(catalogPage - 1) * catalogPageSize + 1}–
                  {Math.min(catalogPage * catalogPageSize, filteredCatalogStations.length)} of{' '}
                  {filteredCatalogStations.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    disabled={catalogPage <= 1}
                    onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-medium px-1">
                    {catalogPage} / {catalogTotalPages}
                  </span>
                  <button
                    disabled={catalogPage >= catalogTotalPages}
                    onClick={() => setCatalogPage((p) => Math.min(catalogTotalPages, p + 1))}
                    className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
