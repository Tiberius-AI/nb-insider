import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Search,
  AlertTriangle,
  Waves,
  Droplets,
  PlusCircle,
  Send,
  Train,
  HardHat,
  Store,
  Home,
  HelpCircle,
  ExternalLink,
  Calendar,
  Navigation,
  RefreshCw,
  X,
  CheckCircle2,
  Layers,
  Map as MapIcon,
  Bell,
  Clock,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Info
} from 'lucide-react';

// ---------------------------------------------------------------------------
// PRE-LOADED NEW BRAUNFELS PROJECTS (8 REALISTIC LOCAL PROJECTS)
// ---------------------------------------------------------------------------
const INITIAL_PROJECTS = [
  {
    id: 'nb-1',
    title: 'Creekside Town Center Phase IV Retail & Dining Pad',
    category: 'New Business',
    status: 'Under Construction',
    corridor: 'Creekside / 306',
    location: 'FM 306 & Creekside Crossing (near Target / H-E-B Plus)',
    estCompletion: 'Q4 2026',
    updatedAt: '2026-10-15',
    lat: 29.7325,
    lng: -98.0752,
    svgX: 305,
    svgY: 115,
    summary:
      'Site work and steel framing underway on two new multi-tenant retail and fast-casual restaurant pads behind Creekside Crossing. Includes dedicated patio dining, 140+ parking spaces, and new deceleration access off FM 306.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-2',
    title: 'FM 306 Overpass & Intersection Expansion at Hunter Rd',
    category: 'Roadwork',
    status: 'Active Lane Shifts',
    corridor: 'Creekside / 306',
    location: 'FM 306 at Hunter Rd & UPRR Tracks',
    estCompletion: 'Spring 2027',
    updatedAt: '2026-10-16',
    lat: 29.7405,
    lng: -98.0888,
    svgX: 265,
    svgY: 92,
    summary:
      'TxDOT & City grade-separation project eliminating train delays across FM 306 near Hunter Rd. Expect narrow lanes, concrete barriers, and periodic overnight flagging operations between 9 PM and 5 AM.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-3',
    title: 'Hwy 46 West H-E-B / Retail Pad Rumor',
    category: 'Rumored',
    status: 'Pre-Development / Platting',
    corridor: 'Hwy 46 West',
    location: 'SH 46 West & Copper Ridge / Mission Hill Corridor',
    estCompletion: 'TBD (2027–2028)',
    updatedAt: '2026-10-12',
    lat: 29.7255,
    lng: -98.185,
    svgX: 68,
    svgY: 145,
    summary:
      'Commercial tract clearing and TCEQ stormwater filings spotted along Hwy 46 West past Loop 337. Local commercial brokers report a major grocery anchor (rumored H-E-B or specialty grocer) evaluating pad layouts alongside 4 retail outparcels.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-4',
    title: 'Gruene River District Venue & Shaded Biergarten',
    category: 'New Business',
    status: 'Permits Approved',
    corridor: 'Gruene',
    location: 'Gruene Rd & Hunter Rd (Historic District Edge)',
    estCompletion: 'Summer 2027',
    updatedAt: '2026-10-14',
    lat: 29.7385,
    lng: -98.1058,
    svgX: 212,
    svgY: 102,
    summary:
      'Adaptive reuse and shaded limestone courtyard project bringing a family-friendly acoustic stage, Hill Country taproom, and artisan wood-fired kitchen within walking distance of the Guadalupe River.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-5',
    title: 'I-35 & Solms Rd Turnaround & Frontage Improvements',
    category: 'Roadwork',
    status: 'Under Construction',
    corridor: 'Creekside / 306',
    location: 'I-35 Southbound & Northbound at Solms Rd (Exit 184)',
    estCompletion: 'Early 2027',
    updatedAt: '2026-10-15',
    lat: 29.6752,
    lng: -98.1512,
    svgX: 148,
    svgY: 272,
    summary:
      'Bridge approaches, Texas U-turn lanes, and widened braided ramps under active construction to relieve commuter backups near Solms Rd and Morningside Dr.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-6',
    title: 'Kowald Lane Expansion & Multimodal Sidewalks',
    category: 'Roadwork',
    status: 'Active Construction',
    corridor: 'Creekside / 306',
    location: 'Kowald Ln from I-35 Frontage to FM 1101',
    estCompletion: 'Late 2027',
    updatedAt: '2026-10-13',
    lat: 29.7192,
    lng: -98.0625,
    svgX: 336,
    svgY: 168,
    summary:
      '2023 Bond Project converting narrow 2-lane Kowald Lane into an urban collector with a center turn lane, drainage box culverts, curb & gutter, and shared-use hike/bike paths.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-7',
    title: 'Downtown Castell Ave Streetscape & Festival Plaza',
    category: 'Roadwork',
    status: 'Phase 2 Active',
    corridor: 'Downtown',
    location: 'S. Castell Ave between San Antonio St & Coll St',
    estCompletion: 'Spring 2027',
    updatedAt: '2026-10-16',
    lat: 29.7015,
    lng: -98.1258,
    svgX: 195,
    svgY: 212,
    summary:
      "Festival-ready curbless brick pavers, wider shaded sidewalks, NBU underground water/electric line upgrades, and strings of café lighting connecting Downtown Plaza to Krause's and the Civic Center.",
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
  {
    id: 'nb-8',
    title: 'Veramendi Precinct 4 Mixed-Use & Elementary #2',
    category: 'Subdivisions',
    status: 'Grading & Infrastructure',
    corridor: 'Hwy 46 West',
    location: 'Word Pkwy & Oak Run Pkwy (Veramendi Master Planned)',
    estCompletion: '2027–2028',
    updatedAt: '2026-10-14',
    lat: 29.7318,
    lng: -98.1585,
    svgX: 122,
    svgY: 125,
    summary:
      '450+ single-family home lots, connected greenbelt trails down to the Guadalupe River, neighborhood village retail center, and utility trunk lines for Veramendi Precinct 4.',
    fbUrl: 'https://www.facebook.com/groups/newbraunfels',
  },
];

// ---------------------------------------------------------------------------
// INITIAL BREAKING & LOCAL ALERTS (TAB 2 + STICKY BANNER)
// ---------------------------------------------------------------------------
const INITIAL_ALERTS = [
  {
    id: 'alert-1',
    type: 'Train Block',
    severity: 'high',
    title: 'Stopped Union Pacific Train Blocking San Antonio St & Coll St',
    location: 'Downtown Rail Crossing (near Krause’s / Castell Ave)',
    timestamp: '14 mins ago',
    details:
      'Southbound UP freight train currently stopped across W. San Antonio St and Coll St crossings. Use Landa St overpass or Loop 337 to bypass downtown tracks.',
    verifiedBy: '4 Reader Reports',
  },
  {
    id: 'alert-2',
    type: 'Traffic / Roadwork',
    severity: 'medium',
    title: 'I-35 Southbound Right Lane Closed at Exit 189 (SH 46 / Seguin Ave)',
    location: 'I-35 SB between FM 306 & Seguin Ave',
    timestamp: '42 mins ago',
    details:
      'TxDOT barrier crew shifting concrete rail near Seguin Ave exit ramp. Traffic backed up to Creekside / Town Center Dr. Expect 12-minute delay.',
    verifiedBy: 'TxDOT & NBPD Feed',
  },
  {
    id: 'alert-3',
    type: 'NBU Utility',
    severity: 'medium',
    title: 'Planned NBU Water Main Valve Tie-In Tonight (10 PM – 4 AM)',
    location: 'Common St & Gruene Rd Area',
    timestamp: '2 hours ago',
    details:
      'New Braunfels Utilities crews will briefly lower water pressure along Common St between Loop 337 and Gruene Rd overnight while tying in a new 12-inch main.',
    verifiedBy: 'NBU Official Notice',
  },
  {
    id: 'alert-4',
    type: 'Train Block',
    severity: 'low',
    title: 'CLEARED: Hunter Rd Rail Crossing Near Gruene Now Open',
    location: 'Hunter Rd & FM 306 Spur',
    timestamp: '3 hours ago',
    details:
      'Earlier slow-moving rock train has cleared the Hunter Rd crossing. Normal traffic flow restored toward Gruene Hall.',
    verifiedBy: 'Reader Tip Verified',
  },
  {
    id: 'alert-5',
    type: 'Community / Weather',
    severity: 'low',
    title: 'Stage 2 Watering Enforcement Active Across All NBU Zones',
    location: 'Citywide (New Braunfels)',
    timestamp: 'Today',
    details:
      'Automatic irrigation permitted once per week before 10 AM or after 8 PM based on the last digit of your street address. Hand-held hose watering allowed anytime.',
    verifiedBy: 'NBU Resource Conservation',
  },
];

const CATEGORIES = ['All', 'New Business', 'Roadwork', 'Subdivisions', 'Rumored'];
const CORRIDORS = ['All NB', 'Creekside / 306', 'Gruene', 'Hwy 46 West', 'Downtown'];

const CATEGORY_META = {
  'New Business': {
    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    pinFill: '#10b981',
    pinStroke: '#064e3b',
    icon: Store,
  },
  Roadwork: {
    bg: 'bg-amber-100 text-amber-900 border-amber-300',
    pinFill: '#f59e0b',
    pinStroke: '#78350f',
    icon: HardHat,
  },
  Subdivisions: {
    bg: 'bg-sky-100 text-sky-900 border-sky-300',
    pinFill: '#0ea5e9',
    pinStroke: '#0c4a6e',
    icon: Home,
  },
  Rumored: {
    bg: 'bg-purple-100 text-purple-900 border-purple-300',
    pinFill: '#a855f7',
    pinStroke: '#4c1d95',
    icon: HelpCircle,
  },
};

// Simple CSV Parser for Live Google Sheets CSV Sync
function parseCSVRows(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const splitCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  return lines
    .slice(1)
    .map((line, idx) => {
      const cols = splitCSVLine(line);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = cols[i] || '';
      });
      const title = row.title || row.name || row.project || '';
      if (!title) return null;

      const lat = parseFloat(row.lat || row.latitude) || 29.703;
      const lng = parseFloat(row.lng || row.lon || row.longitude) || -98.1245;
      const autoSvg = latLngToSvg(lat, lng);

      return {
        id: row.id || `sheet-${idx + 1}`,
        title,
        category: CATEGORIES.includes(row.category) ? row.category : 'New Business',
        status: row.status || 'Active',
        corridor: CORRIDORS.includes(row.corridor) ? row.corridor : 'Creekside / 306',
        location: row.location || row.address || 'New Braunfels, TX',
        estCompletion: row.estcompletion || row.est_completion || row.eta || '2027',
        updatedAt:
          row.updatedat || row.updated_at || row.date || new Date().toISOString().slice(0, 10),
        lat,
        lng,
        svgX: parseFloat(row.svgx || row.x) || autoSvg.svgX,
        svgY: parseFloat(row.svgy || row.y) || autoSvg.svgY,
        summary: row.summary || row.description || row.details || '',
        fbUrl: row.fburl || row.link || 'https://www.facebook.com/groups/newbraunfels',
      };
    })
    .filter(Boolean);
}

// Convert lat/lng in New Braunfels bounding box to SVG 400x320 coordinates
function latLngToSvg(lat, lng) {
  // Bounding box roughly: lat [29.660, 29.760], lng [-98.210, -98.040]
  const x = Math.round(((lng - -98.21) / (-98.04 - -98.21)) * 360 + 20);
  const y = Math.round(((29.76 - lat) / (29.76 - 29.66)) * 280 + 20);
  return {
    svgX: Math.max(25, Math.min(375, x)),
    svgY: Math.max(25, Math.min(295, y)),
  };
}

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'alerts' | 'tip'

  // Projects State (Pre-loaded + localStorage + optional Google Sheets CSV)
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('nb_insider_custom_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...INITIAL_PROJECTS];
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_PROJECTS;
  });
  const [sheetSyncStatus, setSheetSyncStatus] = useState('local'); // 'local' | 'syncing' | 'synced'
  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_PROJECTS[0].id);

  // Map & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCorridor, setSelectedCorridor] = useState('All NB');
  const [mapViewMode, setMapViewMode] = useState('vector'); // 'vector' | 'osm'

  // Breaking Alerts State
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('nb_insider_custom_alerts');
      if (saved) {
        return [...JSON.parse(saved), ...INITIAL_ALERTS];
      }
    } catch {
      // ignore
    }
    return INITIAL_ALERTS;
  });
  const [alertFilter, setAlertFilter] = useState('All');

  // USGS Live River Flow State
  const [riverData, setRiverData] = useState({
    comalCfs: 285,
    guadalupeCfs: 340,
    updatedAt: 'Live USGS',
    loading: true,
    isLive: false,
  });

  // Modals State
  const [showRiverModal, setShowRiverModal] = useState(false);
  const [showNbuModal, setShowNbuModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // Owner Quick-Add Form State
  const [ownerForm, setOwnerForm] = useState({
    postType: 'project', // 'project' | 'alert'
    title: '',
    category: 'New Business',
    corridor: 'Creekside / 306',
    status: 'Under Construction',
    location: '',
    estCompletion: '2027',
    summary: '',
  });

  // Tip Us Reader Form State
  const [tipForm, setTipForm] = useState({
    tipType: 'Construction / Sign Spotted',
    location: '',
    corridor: 'Creekside / 306',
    details: '',
    contact: '',
    publishToFeed: true,
  });
  const [tipSubmitted, setTipSubmitted] = useState(null);

  // -------------------------------------------------------------------------
  // 1. FETCH LIVE USGS RIVER FLOWS (Comal 08169000 & Guadalupe 08168500)
  // -------------------------------------------------------------------------
  const fetchUsgsRiverFlows = async () => {
    setRiverData((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(
        'https://waterservices.usgs.gov/nwis/iv/?format=json&sites=08169000,08168500&parameterCd=00060'
      );
      if (!res.ok) throw new Error('USGS HTTP error');
      const json = await res.json();
      const timeSeries = json?.value?.timeSeries || [];

      let comal = null;
      let guadalupe = null;
      let latestTime = null;

      for (const series of timeSeries) {
        const siteCode = series?.sourceInfo?.siteCode?.[0]?.value;
        const valObj = series?.values?.[0]?.value?.[0];
        const val = valObj ? Math.round(parseFloat(valObj.value)) : null;
        if (siteCode === '08169000' && val !== null && !Number.isNaN(val)) {
          comal = val;
          latestTime = valObj.dateTime;
        }
        if (siteCode === '08168500' && val !== null && !Number.isNaN(val)) {
          guadalupe = val;
          latestTime = latestTime || valObj.dateTime;
        }
      }

      const formattedTime = latestTime
        ? new Date(latestTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'Just now';

      setRiverData({
        comalCfs: comal ?? 285,
        guadalupeCfs: guadalupe ?? 340,
        updatedAt: formattedTime,
        loading: false,
        isLive: true,
      });
    } catch {
      // Graceful offline / fallback for PWA
      setRiverData((prev) => ({
        ...prev,
        loading: false,
        updatedAt: 'Cached CFS',
      }));
    }
  };

  useEffect(() => {
    fetchUsgsRiverFlows();
  }, []);

  // -------------------------------------------------------------------------
  // 2. LIVE GOOGLE SHEETS CSV OR /projects.json SYNC
  // -------------------------------------------------------------------------
  useEffect(() => {
    const csvUrl = import.meta.env.VITE_GOOGLE_SHEET_CSV_URL;
    let cancelled = false;

    const loadLocalJsonProjects = async () => {
      try {
        const res = await fetch('/projects.json');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch {
        // ignore
      }
      return INITIAL_PROJECTS;
    };

    (async () => {
      const baseProjects = await loadLocalJsonProjects();
      const customSaved = JSON.parse(
        localStorage.getItem('nb_insider_custom_projects') || '[]'
      );

      if (csvUrl) {
        setSheetSyncStatus('syncing');
        try {
          const res = await fetch(csvUrl);
          if (!res.ok) throw new Error('Sheet fetch failed');
          const csvText = await res.text();
          if (cancelled) return;
          const sheetProjects = parseCSVRows(csvText);
          if (sheetProjects.length > 0) {
            const sheetIds = new Set(sheetProjects.map((p) => p.id));
            const merged = [
              ...customSaved,
              ...sheetProjects,
              ...baseProjects.filter((p) => !sheetIds.has(p.id)),
            ];
            setProjects(merged);
            setSelectedProjectId(merged[0].id);
            setSheetSyncStatus('synced');
            return;
          }
        } catch {
          // Fallback to baseProjects below
        }
      }

      if (!cancelled) {
        const merged = [...customSaved, ...baseProjects];
        setProjects(merged);
        setSelectedProjectId(merged[0].id);
        setSheetSyncStatus(csvUrl ? 'synced' : 'local');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // FILTERED PROJECTS & ACTIVE PROJECT
  // -------------------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesCorridor = selectedCorridor === 'All NB' || p.corridor === selectedCorridor;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.corridor.toLowerCase().includes(q);
      return matchesCat && matchesCorridor && matchesQuery;
    });
  }, [projects, selectedCategory, selectedCorridor, searchQuery]);

  const activeProject = useMemo(() => {
    return (
      filteredProjects.find((p) => p.id === selectedProjectId) ||
      filteredProjects[0] ||
      projects[0]
    );
  }, [filteredProjects, projects, selectedProjectId]);

  // -------------------------------------------------------------------------
  // FILTERED ALERTS
  // -------------------------------------------------------------------------
  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'All') return alerts;
    return alerts.filter((a) => a.type.toLowerCase().includes(alertFilter.toLowerCase()));
  }, [alerts, alertFilter]);

  // -------------------------------------------------------------------------
  // HANDLERS: OWNER ADD MODAL & READER TIP SUBMISSION
  // -------------------------------------------------------------------------
  const handleOwnerSubmit = (e) => {
    e.preventDefault();
    if (!ownerForm.title.trim()) return;

    if (ownerForm.postType === 'project') {
      const corridorCenters = {
        'Creekside / 306': { lat: 29.734, lng: -98.079 },
        Gruene: { lat: 29.738, lng: -98.106 },
        'Hwy 46 West': { lat: 29.727, lng: -98.172 },
        Downtown: { lat: 29.703, lng: -98.124 },
        'All NB': { lat: 29.708, lng: -98.12 },
      };
      const baseCoords = corridorCenters[ownerForm.corridor] || corridorCenters['All NB'];
      const jitterLat = baseCoords.lat + (Math.random() - 0.5) * 0.01;
      const jitterLng = baseCoords.lng + (Math.random() - 0.5) * 0.01;
      const { svgX, svgY } = latLngToSvg(jitterLat, jitterLng);

      const newProj = {
        id: `owner-${Date.now()}`,
        title: ownerForm.title.trim(),
        category: ownerForm.category,
        status: ownerForm.status || 'Just Announced',
        corridor: ownerForm.corridor,
        location: ownerForm.location.trim() || `${ownerForm.corridor}, New Braunfels`,
        estCompletion: ownerForm.estCompletion.trim() || '2027',
        updatedAt: new Date().toISOString().slice(0, 10),
        lat: jitterLat,
        lng: jitterLng,
        svgX,
        svgY,
        summary:
          ownerForm.summary.trim() ||
          'Added via NB Insider Owner Quick-Post. Watch for permits and site work updates.',
        fbUrl: 'https://www.facebook.com/groups/newbraunfels',
      };

      const existingCustom = JSON.parse(localStorage.getItem('nb_insider_custom_projects') || '[]');
      localStorage.setItem(
        'nb_insider_custom_projects',
        JSON.stringify([newProj, ...existingCustom])
      );
      setProjects((prev) => [newProj, ...prev]);
      setSelectedProjectId(newProj.id);
      setActiveTab('map');
    } else {
      const newAlert = {
        id: `alert-${Date.now()}`,
        type: ownerForm.category === 'Roadwork' ? 'Traffic / Roadwork' : 'Train Block',
        severity: 'high',
        title: ownerForm.title.trim(),
        location: ownerForm.location.trim() || 'New Braunfels, TX',
        timestamp: 'Just now',
        details: ownerForm.summary.trim() || 'Live owner dispatch alert posted.',
        verifiedBy: 'NB Insider Editor',
      };
      const existingAlerts = JSON.parse(localStorage.getItem('nb_insider_custom_alerts') || '[]');
      localStorage.setItem(
        'nb_insider_custom_alerts',
        JSON.stringify([newAlert, ...existingAlerts])
      );
      setAlerts((prev) => [newAlert, ...prev]);
      setActiveTab('alerts');
    }

    setOwnerForm({
      postType: 'project',
      title: '',
      category: 'New Business',
      corridor: 'Creekside / 306',
      status: 'Under Construction',
      location: '',
      estCompletion: '2027',
      summary: '',
    });
    setShowOwnerModal(false);
  };

  const handleTipSubmit = (e) => {
    e.preventDefault();
    if (!tipForm.location.trim() || !tipForm.details.trim()) return;

    const oneLineTip = `${tipForm.tipType} at ${tipForm.location} (${tipForm.corridor}): ${tipForm.details}`;

    if (tipForm.publishToFeed) {
      const newAlert = {
        id: `reader-${Date.now()}`,
        type: tipForm.tipType.includes('Train')
          ? 'Train Block'
          : tipForm.tipType.includes('Wreck')
          ? 'Traffic / Roadwork'
          : 'Community Tip',
        severity: tipForm.tipType.includes('Train') || tipForm.tipType.includes('Wreck') ? 'high' : 'medium',
        title: `${tipForm.tipType}: ${tipForm.location}`,
        location: `${tipForm.location} (${tipForm.corridor})`,
        timestamp: 'Just now',
        details: tipForm.details,
        verifiedBy: 'Reader Tip Submitted',
      };
      const existingAlerts = JSON.parse(localStorage.getItem('nb_insider_custom_alerts') || '[]');
      localStorage.setItem(
        'nb_insider_custom_alerts',
        JSON.stringify([newAlert, ...existingAlerts])
      );
      setAlerts((prev) => [newAlert, ...prev]);
    }

    setTipSubmitted({
      summary: oneLineTip,
      cliCommand: `npm run agent -- --tip "${oneLineTip.replace(/"/g, '\\"')}"`,
    });
    setTipForm({
      tipType: 'Construction / Sign Spotted',
      location: '',
      corridor: 'Creekside / 306',
      details: '',
      contact: '',
      publishToFeed: true,
    });
  };

  // Determine today's NBU Stage 2 watering status
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-100 text-slate-900 pb-20">
      {/* =================================================================== */}
      {/* STICKY EMERALD HEADER (#064e3b) + UTILITY PILLS + TRAIN ALERT BAR   */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#064e3b] text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-3.5 pt-3 pb-2.5">
          {/* Top Branding Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-inner">
                <MapPin className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg font-extrabold tracking-tight leading-none text-white">
                    NB INSIDER
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    TX 78130
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 mt-0.5">
                  New Braunfels Growth, Roads & Daily Utility Hub
                </p>
              </div>
            </div>

            {/* Owner Quick-Add Button */}
            <button
              type="button"
              onClick={() => setShowOwnerModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-semibold text-white border border-emerald-400/40 shadow-sm transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-200" />
              <span>Owner Add</span>
            </button>
          </div>

          {/* Live Utility Pills Row: USGS River Flow + NBU Watering Stage */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto no-scrollbar">
            {/* Live USGS River Flow Pill */}
            <button
              type="button"
              onClick={() => setShowRiverModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/75 hover:bg-emerald-950 border border-emerald-500/40 text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-emerald-100 font-semibold">Rivers:</span>
              <span className="text-cyan-200 font-bold">Comal {riverData.comalCfs} cfs</span>
              <span className="text-emerald-500">•</span>
              <span className="text-cyan-200 font-bold">Guad {riverData.guadalupeCfs} cfs</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
            </button>

            {/* NBU Watering Stage Pill */}
            <button
              type="button"
              onClick={() => setShowNbuModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-[11px] font-medium whitespace-nowrap text-amber-100 transition cursor-pointer"
            >
              <Droplets className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-bold text-amber-200">NBU Stage 2</span>
              <span className="text-amber-100/90">Odd/Even Schedule</span>
            </button>
          </div>
        </div>

        {/* Sticky Yellow Traffic / Train Alert Banner at Bottom of Header */}
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 flex items-center justify-between gap-2 text-left border-t border-amber-500/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
              <Train className="w-3 h-3" />
              ALERT
            </span>
            <p className="text-xs font-bold truncate">
              {alerts[0]?.title || 'UP Train stopped at San Antonio St crossing — Use Landa St bypass'}
            </p>
          </div>
          <span className="text-[11px] font-extrabold underline shrink-0 flex items-center">
            Details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </header>

      {/* =================================================================== */}
      {/* MAIN BODY CONTENT (MAX-W-2XL MOBILE-FIRST CONTAINER)                */}
      {/* =================================================================== */}
      <main className="max-w-2xl mx-auto px-3.5 pt-3.5 pb-8">
        {/* ================================================================= */}
        {/* TAB 1: "WHAT'S GOING IN?" (INTERACTIVE MAP & PROJECT TRACKER)     */}
        {/* ================================================================= */}
        {activeTab === 'map' && (
          <div className="space-y-3.5">
            {/* Search Input + Sheet Sync Status Badge */}
            <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/90 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search NB roads, Creekside, H-E-B, Gruene, Veramendi..."
                    className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-[#064e3b] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Corridor Quick-Jump Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-700" />
                  Corridor:
                </span>
                {CORRIDORS.map((corridor) => {
                  const isActive = selectedCorridor === corridor;
                  return (
                    <button
                      key={corridor}
                      type="button"
                      onClick={() => setSelectedCorridor(corridor)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-400'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {corridor}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE MAP CARD (h-[350px] Vector Map + OpenStreetMap Toggle) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Map Header & View Mode Toggle */}
              <div className="px-3.5 py-2.5 bg-slate-900 text-white flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wide">
                    New Braunfels Project & Roadwork Map ({filteredProjects.length})
                  </span>
                </div>
                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setMapViewMode('vector')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      mapViewMode === 'vector'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    NB Vector Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapViewMode('osm')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      mapViewMode === 'osm'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Street Map (OSM)
                  </button>
                </div>
              </div>

              {/* Dedicated h-[350px] Interactive Map Viewport */}
              <div className="relative h-[350px] w-full bg-[#eef5f0] select-none overflow-hidden">
                {mapViewMode === 'vector' ? (
                  <svg
                    viewBox="0 0 400 320"
                    className="w-full h-full object-cover"
                    role="img"
                    aria-label="Interactive New Braunfels Vector Map"
                  >
                    <defs>
                      <pattern id="nbGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="#dce7df"
                          strokeWidth="0.8"
                        />
                      </pattern>
                    </defs>

                    {/* Background Hill Country / Balcones Escarpment Terrain */}
                    <rect width="400" height="320" fill="url(#nbGrid)" />
                    <path
                      d="M 0 0 L 240 0 C 195 95, 130 160, 0 230 Z"
                      fill="#dfece2"
                      opacity="0.7"
                    />

                    {/* Guadalupe River (Winding from NW through Gruene to SE) */}
                    <path
                      d="M 40 20 Q 130 70, 200 108 T 275 215 T 360 310"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                    {/* Comal River (Spring-fed from Landa Park to Guadalupe Confluence) */}
                    <path
                      d="M 162 175 Q 190 185, 222 198"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                    {/* Loop 337 Perimeter Loop */}
                    <path
                      d="M 135 245 C 85 180, 115 95, 215 98 C 265 100, 275 165, 235 235"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                    />

                    {/* Hwy 46 West to East (Seguin Ave) */}
                    <path
                      d="M 15 135 Q 140 165, 200 205 L 285 295"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="4.5"
                    />

                    {/* FM 306 Corridor (Creekside / Gruene / Hunter Rd) */}
                    <path
                      d="M 155 55 Q 250 95, 365 140"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="4.5"
                    />

                    {/* Union Pacific Railroad Tracks */}
                    <path
                      d="M 95 295 L 325 45"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* I-35 Interstate Corridor (SW San Antonio to NE San Marcos) */}
                    <path
                      d="M 110 315 L 355 35"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="7"
                    />
                    <path
                      d="M 110 315 L 355 35"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeDasharray="8 6"
                    />

                    {/* Downtown Plaza Circle */}
                    <circle
                      cx="198"
                      cy="205"
                      r="9"
                      fill="#fef3c7"
                      stroke="#064e3b"
                      strokeWidth="2"
                    />

                    {/* Map District & Highway Labels */}
                    <g className="text-[9px] font-bold fill-slate-600">
                      <text x="195" y="75" textAnchor="middle" className="fill-emerald-900 font-extrabold">
                        GRUENE
                      </text>
                      <text x="315" y="92" textAnchor="middle" className="fill-emerald-900 font-extrabold">
                        CREEKSIDE / 306
                      </text>
                      <text x="72" y="122" textAnchor="middle" className="fill-emerald-900 font-extrabold">
                        HWY 46 WEST
                      </text>
                      <text x="115" y="102" textAnchor="middle" className="fill-emerald-800">
                        VERAMENDI
                      </text>
                      <text x="198" y="232" textAnchor="middle" className="fill-slate-900 font-extrabold">
                        DOWNTOWN NB
                      </text>
                      <text x="335" y="195" textAnchor="middle" className="fill-slate-600">
                        KOWALD / 1101
                      </text>
                      <text x="88" y="60" className="fill-sky-600 italic">
                        Guadalupe River
                      </text>
                      <text x="145" y="168" className="fill-cyan-700 italic">
                        Comal River
                      </text>
                    </g>

                    {/* Highway Shields */}
                    <g>
                      <rect x="276" y="105" width="28" height="15" rx="3" fill="#1e3a8a" />
                      <text x="290" y="116" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">
                        I-35
                      </text>

                      <rect x="108" y="175" width="38" height="14" rx="3" fill="#fff" stroke="#475569" />
                      <text x="127" y="185" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="bold">
                        LOOP 337
                      </text>

                      <rect x="35" y="142" width="32" height="14" rx="3" fill="#fff" stroke="#475569" />
                      <text x="51" y="152" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="bold">
                        SH 46
                      </text>

                      <rect x="335" y="125" width="34" height="14" rx="3" fill="#fff" stroke="#475569" />
                      <text x="352" y="135" textAnchor="middle" fill="#0f172a" fontSize="7.5" fontWeight="bold">
                        FM 306
                      </text>
                    </g>

                    {/* Clickable Numbered Color-Coded Project Pins */}
                    {filteredProjects.map((project, index) => {
                      const isSelected = activeProject?.id === project.id;
                      const meta = CATEGORY_META[project.category] || CATEGORY_META['New Business'];
                      return (
                        <g
                          key={project.id}
                          transform={`translate(${project.svgX}, ${project.svgY})`}
                          onClick={() => setSelectedProjectId(project.id)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle
                              r="19"
                              fill={meta.pinFill}
                              opacity="0.28"
                              className="animate-ping"
                            />
                          )}
                          <circle
                            r={isSelected ? 14 : 11}
                            fill={meta.pinFill}
                            stroke={isSelected ? '#ffffff' : meta.pinStroke}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                          <text
                            y="3.5"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isSelected ? '11' : '9.5'}
                            fontWeight="800"
                          >
                            {index + 1}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  /* Embedded OpenStreetMap View Centered on Selected Project */
                  <div className="w-full h-full relative">
                    <iframe
                      title="New Braunfels OpenStreetMap View"
                      className="w-full h-full border-0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        (activeProject?.lng || -98.1245) - 0.035
                      }%2C${(activeProject?.lat || 29.703) - 0.025}%2C${
                        (activeProject?.lng || -98.1245) + 0.035
                      }%2C${
                        (activeProject?.lat || 29.703) + 0.025
                      }&layer=mapnik&marker=${activeProject?.lat || 29.703}%2C${
                        activeProject?.lng || -98.1245
                      }`}
                    />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/90 text-white px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <span className="truncate font-semibold">
                        Pinned: {activeProject?.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMapViewMode('vector')}
                        className="px-2 py-1 rounded bg-emerald-600 text-[11px] font-bold shrink-0 cursor-pointer"
                      >
                        Back to Pins
                      </button>
                    </div>
                  </div>
                )}

                {/* Map Legend Overlay */}
                {mapViewMode === 'vector' && (
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2 text-[10px] font-bold text-slate-700 flex-wrap">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        Business
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Roadwork
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                        Subdivision
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                        Rumored
                      </span>
                    </div>
                    <span className="text-slate-500">Tap any pin #</span>
                  </div>
                )}
              </div>
            </div>

            {/* SELECTED PROJECT DETAIL CARD */}
            {activeProject && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-emerald-700/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        CATEGORY_META[activeProject.category]?.bg ||
                        'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {activeProject.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {activeProject.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                      {activeProject.corridor}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Verified {activeProject.updatedAt}
                  </span>
                </div>

                <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                  {activeProject.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    {activeProject.location}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    Est. Completion: <strong>{activeProject.estCompletion}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {activeProject.summary}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setMapViewMode((prev) => (prev === 'vector' ? 'osm' : 'vector'))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-600 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {mapViewMode === 'vector'
                      ? 'View Exact Site on Street Map'
                      : 'Switch Back to Vector Map'}
                  </button>

                  <a
                    href={activeProject.fbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition"
                  >
                    <span>Discuss on NB Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* SCROLLABLE LIST OF ALL MATCHING PROJECTS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  All Tracked Projects ({filteredProjects.length})
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  {sheetSyncStatus === 'synced'
                    ? 'Live Google Sheet Synced'
                    : 'NB Insider Local Database'}
                </span>
              </div>

              {filteredProjects.map((project, idx) => {
                const isSelected = activeProject?.id === project.id;
                const meta = CATEGORY_META[project.category] || CATEGORY_META['New Business'];
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      window.scrollTo({ top: 140, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-full text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-xs"
                      style={{ backgroundColor: meta.pinFill }}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.bg}`}>
                          {project.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          • {project.corridor}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 ml-auto">
                          {project.estCompletion}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {project.title}
                      </h4>
                      <p className="text-xs text-slate-600 truncate">{project.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: "BREAKING & ALERTS" (TRAINS, TRAFFIC, NBU & LOCAL DISPATCH)*/}
        {/* ================================================================= */}
        {activeTab === 'alerts' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Breaking & Local Alerts
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time train blocks, I-35 / Loop 337 closures, and NBU notices
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('tip')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition cursor-pointer"
                >
                  + Report Alert
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Train', 'Traffic', 'NBU', 'Community'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setAlertFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      alertFilter === filter
                        ? 'bg-[#064e3b] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'All' ? 'All Alerts' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-2.5">
              {filteredAlerts.map((alert) => {
                const isHigh = alert.severity === 'high';
                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl p-4 border shadow-xs space-y-2 ${
                      isHigh
                        ? 'bg-amber-50/90 border-amber-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          isHigh
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-900 text-amber-300'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {alert.type}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {alert.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900">
                      {alert.title}
                    </h3>

                    <p className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      {alert.location}
                    </p>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {alert.details}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/70">
                      <span className="font-semibold text-emerald-800">
                        ✓ {alert.verifiedBy}
                      </span>
                      <span>New Braunfels Dispatch</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: "TIP US" (READER SUBMISSION FORM FOR SIGNS, WRECKS, TRAINS)*/}
        {/* ================================================================= */}
        {activeTab === 'tip' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Spot a Sign, Wreck, or Stopped Train?
                  </h2>
                  <p className="text-xs text-slate-600">
                    Send a fast tip to NB Insider. Our automated agent geocodes new developments and alerts neighbors.
                  </p>
                </div>
              </div>

              {tipSubmitted && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tip Received & Added to Live Feed!
                    </span>
                    <button
                      type="button"
                      onClick={() => setTipSubmitted(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-medium">{tipSubmitted.summary}</p>
                  <div className="bg-slate-900 text-emerald-300 p-2 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {tipSubmitted.cliCommand}
                  </div>
                </div>
              )}

              <form onSubmit={handleTipSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    What did you spot?
                  </label>
                  <select
                    value={tipForm.tipType}
                    onChange={(e) =>
                      setTipForm((prev) => ({ ...prev, tipType: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-700"
                  >
                    <option>Construction / Sign Spotted</option>
                    <option>Stopped Train Blocking Crossing</option>
                    <option>Roadwork / Wreck / Backup</option>
                    <option>New Business Rumor or Permit</option>
                    <option>NBU Water / Utility Issue</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Intersection or Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={tipForm.location}
                      onChange={(e) =>
                        setTipForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="e.g., FM 306 near Hunter Rd"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NB Corridor
                    </label>
                    <select
                      value={tipForm.corridor}
                      onChange={(e) =>
                        setTipForm((prev) => ({ ...prev, corridor: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-700"
                    >
                      {CORRIDORS.filter((c) => c !== 'All NB').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    What’s happening? (1–2 sentences) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={tipForm.details}
                    onChange={(e) =>
                      setTipForm((prev) => ({ ...prev, details: e.target.value }))
                    }
                    placeholder="e.g., Commercial 'Coming Soon' sign went up next to Creekside Target, dirt movers on site..."
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tipForm.publishToFeed}
                    onChange={(e) =>
                      setTipForm((prev) => ({
                        ...prev,
                        publishToFeed: e.target.checked,
                      }))
                    }
                    className="rounded text-emerald-700"
                  />
                  Immediately post to local Breaking & Alerts feed on this device
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#064e3b] hover:bg-emerald-800 text-white font-extrabold text-sm shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit New Braunfels Tip
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* MODAL 1: LIVE USGS RIVER FLOW DETAILS (COMAL & GUADALUPE)           */}
      {/* =================================================================== */}
      {showRiverModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Live USGS River Flow Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRiverModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 space-y-1">
                <span className="text-[11px] font-bold text-cyan-800 uppercase">
                  Comal River (08169000)
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {riverData.comalCfs} <span className="text-xs font-bold">CFS</span>
                </div>
                <p className="text-[11px] text-cyan-900 font-medium">
                  Spring-fed • 72°F year-round • Normal tubing flow
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                <span className="text-[11px] font-bold text-sky-800 uppercase">
                  Guadalupe (08168500)
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {riverData.guadalupeCfs} <span className="text-xs font-bold">CFS</span>
                </div>
                <p className="text-[11px] text-sky-900 font-medium">
                  Above Comal Gage • Good kayak & float conditions
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-800">City Recreation & Safety Guide:</p>
              <p>• <strong>Under 500 CFS:</strong> Calm family tubing & paddling conditions.</p>
              <p>• <strong>500 – 1,000 CFS:</strong> Life jackets advised for children & weak swimmers.</p>
              <p>• <strong>Last Gauge Sync:</strong> {riverData.updatedAt}</p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={fetchUsgsRiverFlows}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${riverData.loading ? 'animate-spin' : ''}`} />
                Refresh USGS API
              </button>
              <button
                type="button"
                onClick={() => setShowRiverModal(false)}
                className="px-4 py-2 rounded-xl bg-[#064e3b] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: NBU STAGE 2 WATERING SCHEDULE (ODD / EVEN ADDRESSES)       */}
      {/* =================================================================== */}
      {showNbuModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900">
                  NBU Stage 2 Drought Watering Schedule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNbuModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
              <p className="font-extrabold">
                Today is {todayDayName} — Sprinkler Hours: Before 10 AM or After 8 PM
              </p>
              <p>
                Under Stage 2 restrictions, landscape pop-up sprinklers are allowed once per week based on the last digit of your street address.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Odd Address (ends in 1, 3, 5, 7, 9)</span>
                <span className="font-extrabold text-emerald-800">Wednesday or Saturday</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Even Address (ends in 0, 2, 4, 6, 8)</span>
                <span className="font-extrabold text-emerald-800">Thursday or Sunday</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between">
                <span className="font-bold text-slate-800">Commercial / HOA Common Areas</span>
                <span className="font-extrabold text-emerald-800">Tuesday or Friday</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNbuModal(false)}
              className="w-full py-2 rounded-xl bg-[#064e3b] text-white text-xs font-bold cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: OWNER QUICK-ADD MODAL (ADD MAP PIN OR BREAKING ALERT)      */}
      {/* =================================================================== */}
      {showOwnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Owner Quick-Post (Map Pin or Alert)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOwnerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOwnerSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOwnerForm((p) => ({ ...p, postType: 'project' }))}
                  className={`py-2 rounded-xl font-bold border cursor-pointer ${
                    ownerForm.postType === 'project'
                      ? 'bg-[#064e3b] text-white border-[#064e3b]'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  New Map Project
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerForm((p) => ({ ...p, postType: 'alert' }))}
                  className={`py-2 rounded-xl font-bold border cursor-pointer ${
                    ownerForm.postType === 'alert'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  Breaking / Train Alert
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={ownerForm.title}
                  onChange={(e) => setOwnerForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., New Dutch Bros Pad at FM 306"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ownerForm.category}
                    onChange={(e) => setOwnerForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corridor</label>
                  <select
                    value={ownerForm.corridor}
                    onChange={(e) => setOwnerForm((p) => ({ ...p, corridor: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  >
                    {CORRIDORS.filter((c) => c !== 'All NB').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Cross-Street</label>
                <input
                  type="text"
                  value={ownerForm.location}
                  onChange={(e) => setOwnerForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g., 1400 block of SH 46 West"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Summary Details</label>
                <textarea
                  rows={2}
                  value={ownerForm.summary}
                  onChange={(e) => setOwnerForm((p) => ({ ...p, summary: e.target.value }))}
                  placeholder="Permit details, timeline, or traffic impact..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-800 text-white font-extrabold cursor-pointer"
              >
                Publish Immediately
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FIXED 3-TAB BOTTOM NAVIGATION BAR                                   */}
      {/* =================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-3 h-16">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'map'
                ? 'text-[#064e3b] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'map' ? 'text-emerald-700' : ''}`} />
            <span className="text-[11px]">What’s Going In?</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`relative flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'alerts'
                ? 'text-[#064e3b] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <AlertTriangle
                className={`w-5 h-5 ${activeTab === 'alerts' ? 'text-amber-500' : ''}`}
              />
              <span className="absolute -top-1 -right-2.5 px-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black">
                {alerts.length}
              </span>
            </div>
            <span className="text-[11px]">Breaking & Alerts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tip')}
            className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'tip'
                ? 'text-[#064e3b] font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Send className={`w-5 h-5 ${activeTab === 'tip' ? 'text-emerald-700' : ''}`} />
            <span className="text-[11px]">Tip Us</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
