import React, { useState, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { getCountryInfo } from '../utils/countryData';
import './WorldMapChart.css';

// Natural Earth TopoJSON from public CDN
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const WorldMapChart = ({ regions = [] }) => {
  const [tooltip, setTooltip] = useState(null);
  const [position, setPosition] = useState({ coordinates: [20, 10], zoom: 1 });

  // Build markers from regions
  const maxCount = Math.max(1, ...regions.map((rg) => rg.redirects || 0));

  const markers = regions
    .map((rg) => {
      const countryCode = rg.code || rg.region;
      const country = getCountryInfo(countryCode);
      if (!country || country.name === 'Unknown') return null;

      const count = rg.redirects || 0;
      const normalized = count / maxCount;
      // Radius scales from 6px (small) to 18px (top)
      const r = 6 + normalized * 12;

      return {
        name: country.name,
        flag: country.flag,
        lat: country.lat,
        lng: country.lng,
        count,
        r,
        pct: rg.percentage ? rg.percentage.toFixed(1) : '0.0',
      };
    })
    .filter(Boolean);

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [20, 10], zoom: 1 });
  };

  return (
    <div className="worldmap-wrapper">
      {/* Zoom controls */}
      <div className="worldmap-controls">
        <button className="worldmap-ctrl-btn" onClick={handleZoomIn} title="Zoom in">+</button>
        <button className="worldmap-ctrl-btn" onClick={handleZoomOut} title="Zoom out">−</button>
        <button className="worldmap-ctrl-btn worldmap-ctrl-reset" onClick={handleReset} title="Reset">⌖</button>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="worldmap-tooltip">
          {tooltip.flag} <strong>{tooltip.name}</strong>
          <span className="worldmap-tooltip-count">{tooltip.count.toLocaleString()} redirects · {tooltip.pct}%</span>
        </div>
      )}

      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1a2035"
                  stroke="#2a3a5c"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#212d4a', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {markers.map((marker) => (
            <Marker
              key={marker.name}
              coordinates={[marker.lng, marker.lat]}
              onMouseEnter={() => setTooltip(marker)}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Pulsing outer ring */}
              <circle
                r={marker.r + 4}
                fill="rgba(100, 220, 50, 0.12)"
                className="worldmap-ping-ring"
              />
              {/* Solid dot */}
              <circle
                r={marker.r}
                fill="rgba(100, 220, 50, 0.85)"
                stroke="#aaffa0"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 6px rgba(100, 220, 50, 0.7))' }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {markers.length === 0 && (
        <div className="worldmap-empty">
          <p>No traffic data yet — visit a short link to see it here</p>
        </div>
      )}

      <p className="worldmap-hint">Scroll or pinch to zoom · Drag to pan</p>
    </div>
  );
};

export default memo(WorldMapChart);
