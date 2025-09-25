import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  async () => (await import('react-leaflet')).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import('react-leaflet')).TileLayer,
  { ssr: false }
);
const Marker = dynamic(
  async () => (await import('react-leaflet')).Marker,
  { ssr: false }
);
const Circle = dynamic(
  async () => (await import('react-leaflet')).Circle,
  { ssr: false }
);
const Popup = dynamic(
  async () => (await import('react-leaflet')).Popup,
  { ssr: false }
);
// Hook for reliable map event handling
import { useMapEvents } from 'react-leaflet';

// Leaflet's default icon assets are not bundled automatically in Next. Fix by setting icon URLs.
import L from 'leaflet';

// Fix default icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const Controls = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  left: auto;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Field = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

function haversineMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000; // meters
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MountainFinder = () => {
  // Flow: right-click to place -> confirm -> enter radius (miles) -> fetch top 5 peaks
  const [map, setMap] = useState(null);
  const [pendingCenter, setPendingCenter] = useState(null); // [lat, lon] before confirmation
  const [center, setCenter] = useState(null); // confirmed center
  const [radiusMiles, setRadiusMiles] = useState(50);
  const [results, setResults] = useState([]); // fetched peaks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const N = 5;
  const abortRef = useRef(null);
  const tileCacheRef = useRef(new Map()); // key: "s,w,n,e" -> { ts, items }
  const [progress, setProgress] = useState(null); // {done, total}

  React.useEffect(() => {
    if (!map) return;
    const onRightClick = (e) => {
      setPendingCenter([e.latlng.lat, e.latlng.lng]);
      setError('');
    };
    const onMouseDown = (e) => {
      // Right mouse button fallback
      if (e?.originalEvent?.button === 2 && e?.latlng) {
        setPendingCenter([e.latlng.lat, e.latlng.lng]);
        setError('');
      }
    };
    // Ensure the browser menu is suppressed for any right-click on the map container
    const container = map.getContainer();
    const prevent = (ev) => {
      ev.preventDefault();
    };
    container.addEventListener('contextmenu', prevent, { capture: true });
    map.on('contextmenu', onRightClick);
    map.on('mousedown', onMouseDown);
    return () => {
      container.removeEventListener('contextmenu', prevent, { capture: true });
      map.off('contextmenu', onRightClick);
      map.off('mousedown', onMouseDown);
    };
  }, [map]);

  // Backstop: prevent browser context menu when right-click originates within the Leaflet map,
  // even if some overlay grabs the event first.
  React.useEffect(() => {
    if (!map) return;
    const handler = (ev) => {
      try {
        const container = map.getContainer();
        if (container && container.contains(ev.target)) {
          ev.preventDefault();
        }
      } catch {}
    };
    document.addEventListener('contextmenu', handler, { capture: true });
    return () => {
      document.removeEventListener('contextmenu', handler, { capture: true });
    };
  }, [map]);

  const metersFromMiles = (mi) => mi * 1609.344;

  function parseElevationToMeters(ele) {
    if (ele == null) return null;
    if (typeof ele === 'number') return ele; // assume meters
    const raw = String(ele).trim();
    // extract number and optional unit
    const match = raw.match(/(-?\d+(?:[.,]\d+)?)(?:\s*(m|meters|meter|ft|feet|\'))?/i);
    if (!match) return null;
    let value = parseFloat(match[1].replace(',', '.'));
    const unit = (match[2] || 'm').toLowerCase();
    if (unit === 'ft' || unit === "'" || unit === 'feet') {
      value = value * 0.3048;
    }
    // meters otherwise
    return value;
  }

  const fetchPeaks = async (lat, lon, radiusM, { eleOnly = false, signal } = {}) => {
    // Query Overpass API for natural=peak nodes within radius
    // Optionally restrict to peaks that have an elevation tag to reduce payload on large searches
    const eleFilter = eleOnly ? '["ele"]' : '';
    const overpassQuery = `
      [out:json][timeout:25];
      node(around:${Math.floor(radiusM)},${lat},${lon})[natural=peak]${eleFilter};
      out body qt;
    `;
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: overpassQuery }),
          signal,
        });
        if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
        const json = await res.json();
        const peaks = (json.elements || [])
          .filter((el) => el.type === 'node')
          .map((el) => {
            const elevationM = parseElevationToMeters(el.tags?.ele);
            return {
              id: el.id,
              name: el.tags?.name || 'Unnamed peak',
              lat: el.lat,
              lon: el.lon,
              elevation: elevationM ?? null,
              eleRaw: el.tags?.ele,
            };
          });
        return peaks;
      } catch (e) {
        // try next endpoint
        // eslint-disable-next-line no-console
        console.warn('Overpass error:', e.message);
      }
    }
    throw new Error('All Overpass endpoints failed');
  };

  // Overpass via bbox tiles for large radii
  function kmPerDegLonAtLat(latDeg) {
    return 111.32 * Math.cos((latDeg * Math.PI) / 180);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function buildTilesForCircle(lat, lon, radiusM, tileKm = 75) {
    const radiusKm = radiusM / 1000;
    const kmPerDegLat = 111.32;
    const kLon = kmPerDegLonAtLat(lat) || 1e-6; // avoid div by zero near poles
    const dLat = radiusKm / kmPerDegLat;
    const dLon = radiusKm / kLon;
    let south = clamp(lat - dLat, -89.9, 89.9);
    let north = clamp(lat + dLat, -89.9, 89.9);
    let west = lon - dLon;
    let east = lon + dLon;

    // Normalize lons into [-180, 180]
    const norm = (x) => {
      let v = x;
      while (v < -180) v += 360;
      while (v > 180) v -= 360;
      return v;
    };
    west = norm(west);
    east = norm(east);

    // Determine tile size in degrees
    const latTileDeg = Math.max(tileKm / kmPerDegLat, 0.05);
    const lonTileDeg = Math.max(tileKm / kLon, 0.05);

    const tiles = [];
    const addTilesForSpan = (w, e) => {
      for (let y = south; y < north; y += latTileDeg) {
        const y2 = Math.min(y + latTileDeg, north);
        for (let x = w; x < e; x += lonTileDeg) {
          const x2 = Math.min(x + lonTileDeg, e);
          tiles.push({ s: y, w: x, n: y2, e: x2 });
        }
      }
    };

    if (east >= west) {
      addTilesForSpan(west, east);
    } else {
      // wraps antimeridian -> split into [west..180] and [-180..east]
      addTilesForSpan(west, 180);
      addTilesForSpan(-180, east);
    }
    return tiles;
  }

  async function fetchTileBBox(tile, { eleOnly = true, signal } = {}) {
    const { s, w, n, e } = tile;
    const eleFilter = eleOnly ? '["ele"]' : '';
    const query = `
      [out:json][timeout:25];
      node(${s},${w},${n},${e})[natural=peak]${eleFilter};
      out body qt;
    `;
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
    ];
    let lastErr;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: query }),
          signal,
        });
        if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
        const json = await res.json();
        const peaks = (json.elements || [])
          .filter((el) => el.type === 'node')
          .map((el) => {
            const elevationM = parseElevationToMeters(el.tags?.ele);
            return {
              id: el.id,
              name: el.tags?.name || 'Unnamed peak',
              lat: el.lat,
              lon: el.lon,
              elevation: elevationM ?? null,
              eleRaw: el.tags?.ele,
            };
          });
        return peaks;
      } catch (e) {
        lastErr = e;
        // eslint-disable-next-line no-console
        console.warn('Overpass tile error:', e.message);
      }
    }
    throw lastErr || new Error('All Overpass endpoints failed for tile');
  }

  // Small promise pool for limited concurrency
  async function withConcurrency(items, limit, worker) {
    const ret = [];
    let i = 0;
    const active = new Set();
    async function runOne(idx) {
      const p = worker(items[idx]).then((r) => {
        ret[idx] = r;
      }).finally(() => {
        active.delete(p);
      });
      active.add(p);
      return p;
    }
    while (i < items.length) {
      while (active.size < limit && i < items.length) {
        await runOne(i++);
      }
      if (active.size >= limit) {
        await Promise.race(active);
      }
    }
    await Promise.all(active);
    return ret;
  }

  // Simple streaming top-N by elevation (meters). Missing elevation treated as -Infinity.
  function topNByElevation(items, N) {
    const best = [];
    for (const it of items) {
      const e = typeof it.elevation === 'number' ? it.elevation : -Infinity;
      if (best.length < N) {
        best.push(it);
        // keep descending by elevation
        best.sort((a, b) => (b.elevation ?? -Infinity) - (a.elevation ?? -Infinity));
      } else if (e > (best[best.length - 1].elevation ?? -Infinity)) {
        best[best.length - 1] = it;
        best.sort((a, b) => (b.elevation ?? -Infinity) - (a.elevation ?? -Infinity));
      }
    }
    return best;
  }

  // Grid-based simplification: keep the highest-elevation peak per cell
  function simplifyByGrid(peaks, cellDeg) {
    const cellMap = new Map();
    for (const p of peaks) {
      const key = `${Math.floor(p.lat / cellDeg)},${Math.floor(p.lon / cellDeg)}`;
      const cur = cellMap.get(key);
      const e = typeof p.elevation === 'number' ? p.elevation : -Infinity;
      const curE = cur && typeof cur.elevation === 'number' ? cur.elevation : -Infinity;
      if (!cur || e > curE) cellMap.set(key, p);
    }
    return Array.from(cellMap.values());
  }

  const runSearch = async () => {
    if (!center) {
      setError('Please confirm a location first.');
      return;
    }
    setLoading(true);
    setError('');
    setProgress(null);

    // Cancel any in-flight search
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const radiusM = metersFromMiles(radiusMiles);
      const largeRadiusEleFilterMiles = 200; // apply ele-only filter for large searches
      const simplifyThresholdMiles = 120; // start simplifying for bigger radii
      const useEleOnly = radiusMiles >= largeRadiusEleFilterMiles;
      let ranked = [];

      if (radiusMiles < 100) {
        // For small/medium radii, a single around() query is faster
        let peaks = await fetchPeaks(center[0], center[1], radiusM, { eleOnly: useEleOnly, signal: controller.signal });
        if (useEleOnly && peaks.length < 2 * N) {
          const extra = await fetchPeaks(center[0], center[1], radiusM, { eleOnly: false, signal: controller.signal });
          const seen = new Set(peaks.map((p) => p.id || `${p.lat},${p.lon}`));
          for (const p of extra) {
            const key = p.id || `${p.lat},${p.lon}`;
            if (!seen.has(key)) peaks.push(p);
          }
        }
        const withEle = peaks.filter((p) => typeof p.elevation === 'number');
        let candidates = withEle.length > 0 ? withEle : peaks;
        if (radiusMiles >= simplifyThresholdMiles && candidates.length > 200) {
          const cellKm = Math.min(Math.max(radiusMiles * 1.609 / 15, 8), 40);
          const cellDeg = cellKm / 111;
          candidates = simplifyByGrid(candidates, cellDeg);
        }
        const withDist = candidates
          .map((p) => ({ ...p, distance: haversineMeters(center, [p.lat, p.lon]) }))
          .filter((p) => p.distance <= radiusM);
        ranked = topNByElevation(withDist, N);
      } else {
        // Large radius strategy: tile bbox queries with concurrency and cache
        const tiles = buildTilesForCircle(center[0], center[1], radiusM, Math.min(120, Math.max(60, radiusMiles * 1.609 / 8)));
        setProgress({ done: 0, total: tiles.length });
        const seenIds = new Set();
        let best = [];

        const now = Date.now();
        const staleMs = 10 * 60 * 1000; // 10 minutes cache

        let done = 0;
        const updateProgress = () => setProgress({ done: ++done, total: tiles.length });

        const resultsPerTile = await withConcurrency(tiles, 6, async (tile) => {
          const key = `${tile.s.toFixed(4)},${tile.w.toFixed(4)},${tile.n.toFixed(4)},${tile.e.toFixed(4)}`;
          let items;
          const cached = tileCacheRef.current.get(key);
          if (cached && (now - cached.ts) < staleMs) {
            items = cached.items;
          } else {
            items = await fetchTileBBox(tile, { eleOnly: true, signal: controller.signal });
            tileCacheRef.current.set(key, { ts: Date.now(), items });
          }
          updateProgress();
          // Stream into top-N
          for (const p of items) {
            // cheap dedupe
            const idKey = p.id || `${p.lat},${p.lon}`;
            if (seenIds.has(idKey)) continue;
            // distance filter to keep within circle
            const dist = haversineMeters(center, [p.lat, p.lon]);
            if (dist > radiusM) continue;
            seenIds.add(idKey);
            const e = typeof p.elevation === 'number' ? p.elevation : -Infinity;
            const enriched = { ...p, distance: dist };
            if (best.length < N) {
              best.push(enriched);
              best.sort((a, b) => (b.elevation ?? -Infinity) - (a.elevation ?? -Infinity));
            } else if (e > (best[best.length - 1].elevation ?? -Infinity)) {
              best[best.length - 1] = enriched;
              best.sort((a, b) => (b.elevation ?? -Infinity) - (a.elevation ?? -Infinity));
            }
          }
          // periodically update UI with current best
          setResults([...best]);
          return true;
        });
        ranked = best;
      }

      setResults(ranked);
    } catch (e) {
      // Ignore abort/cancel errors (user-initiated)
      if (controller.signal?.aborted || e?.name === 'AbortError') {
        // no-op
      } else {
        setError(e.message || 'Search failed.');
      }
    } finally {
      setProgress(null);
      setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const resetAll = () => {
    // Abort any in-flight search
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
      abortRef.current = null;
    }
    setPendingCenter(null);
    setCenter(null);
    setResults([]);
    setError('');
    setProgress(null);
    setLoading(false);
  };

  const hasRadius = center && radiusMiles && radiusMiles > 0;
  const radiusMeters = hasRadius ? metersFromMiles(radiusMiles) : 0;

  // Auto-fit initial view if no center picked: show Everest-ish
  const initialCenter = center || pendingCenter || [27.9881, 86.925];

  // Gold icon for the confirmed center marker
  const centerIcon = React.useMemo(() => {
    return L.divIcon({
      className: 'center-gold-marker',
      html: `
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: gold;
          border: 2px solid #b8860b; /* dark goldenrod */
          box-shadow: 0 0 4px rgba(0,0,0,0.5);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }, []);

  // Component to catch Leaflet map events reliably
  const MapEventCatcher = ({ onPick }) => {
    useMapEvents({
      contextmenu(e) {
        if (e?.latlng) onPick(e.latlng);
      },
      mousedown(e) {
        if (e?.originalEvent?.button === 2 && e?.latlng) onPick(e.latlng);
      },
      click(e) {
        // Fallback: allow Shift/Ctrl/Meta + click to pick
        const oe = e?.originalEvent;
        if ((oe?.shiftKey || oe?.ctrlKey || oe?.metaKey) && e?.latlng) onPick(e.latlng);
      },
    });
    return null;
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
      onContextMenuCapture={(e) => e.preventDefault()}
    >
      <Controls>
        {!center && (
          <div style={{ fontSize: 12, lineHeight: 1.4 }}>
            <div><strong>Step 1:</strong> Right-click on the map to pick a location.</div>
            {pendingCenter && (
              <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => setCenter(pendingCenter)}>Confirm location</button>
                <button onClick={() => setPendingCenter(null)}>Reset</button>
                <span>
                  {pendingCenter[0].toFixed(4)}, {pendingCenter[1].toFixed(4)}
                </span>
              </div>
            )}
          </div>
        )}

        {center && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Field>
              Center
              <input
                type="text"
                readOnly
                value={`${center[0].toFixed(4)}, ${center[1].toFixed(4)}`}
                style={{ width: 160 }}
              />
            </Field>
            <Field>
              Radius (miles)
              <input
                type="number"
                min={1}
                max={2000}
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(Number(e.target.value))}
                style={{ width: 80 }}
              />
            </Field>
            <button onClick={runSearch} disabled={loading}>
              {loading ? 'Searching…' : `Find top ${N}`}
            </button>
            <button onClick={resetAll}>
              {loading ? 'Cancel / Start over' : 'Start over'}
            </button>
            <span style={{ fontSize: 12 }}>
              {results.length > 0 ? `Found: ${results.length}` : ''}
            </span>
            {progress && (
              <span style={{ fontSize: 12 }}>
                Tiles: {progress.done}/{progress.total}
              </span>
            )}
          </div>
        )}
        {error && (
          <div style={{ color: 'crimson', fontSize: 12, marginLeft: 6 }}>{error}</div>
        )}
      </Controls>

      <MapContainer
        center={initialCenter}
        zoom={center ? 9 : 5}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
        onContextMenu={(e) => {
          // Prevent the browser context menu so Leaflet's 'contextmenu' event is usable
          e.preventDefault();
        }}
      >
        <MapEventCatcher
          onPick={(latlng) => {
            setPendingCenter([latlng.lat, latlng.lng]);
            setError('');
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pending marker (before confirm) */}
        {pendingCenter && !center && (
          <Marker position={pendingCenter}>
            <Popup>
              Pending location<br />
              {pendingCenter[0].toFixed(4)}, {pendingCenter[1].toFixed(4)}
              <br />Right-click elsewhere to move. Click Confirm to continue.
            </Popup>
          </Marker>
        )}

        {/* Confirmed center marker */}
        {center && (
          <Marker position={center} icon={centerIcon}>
            <Popup>
              Selected location<br />
              {center[0].toFixed(4)}, {center[1].toFixed(4)}
            </Popup>
          </Marker>
        )}

        {/* Search radius */}
        {center && radiusMeters > 0 && (
          <Circle center={center} radius={radiusMeters} />
        )}

        {/* Result markers */}
        {results.map((m) => (
          <Marker key={`${m.id || m.name}-${m.lat}-${m.lon}`} position={[m.lat, m.lon]}>
            <Popup>
              <strong>{m.name}</strong>
              <br />
              Elevation: {typeof m.elevation === 'number' ? `${Math.round(m.elevation)} m` : (m.eleRaw || 'unknown')}
              <br />
              Distance: {center ? (haversineMeters(center, [m.lat, m.lon]) / 1609.344).toFixed(1) : '?'} mi
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MountainFinder;
