import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { getCountryInfo } from '../utils/countryData';

/**
 * GlobeCanvas — renders a rotating 3D globe using cobe (WebGL).
 *
 * KEY RULES from reading cobe v2 source code:
 * 1. Pass the canvas ref directly to createGlobe — do NOT create/remove canvases dynamically.
 *    cobe inserts its own wrapper div around the canvas automatically.
 *    Messing with innerHTML or creating canvas programmatically disrupts cobe's own DOM management.
 * 2. The globe must be destroyed and re-created when regions/size changes.
 *    The useEffect dependency array includes [regions, width, height].
 * 3. Never pass state.width or state.height in onRender — cobe re-allocates WebGL framebuffers,
 *    which wipes the map texture every frame.
 * 4. Always initialize markers with at least a tiny placeholder to pre-allocate GPU buffers.
 * 5. mapBrightness must be high (6-10) with dark:1 to show continent dots.
 *    With dark:1, baseColor is the ocean color, and dots appear lighter.
 */
const GlobeCanvas = ({ regions = [], width = 300, height = 300 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Map regions to cobe marker format
    const maxCount = Math.max(1, ...regions.map((rg) => rg.redirects || 0));

    const markers = regions
      .map((rg) => {
        const countryCode = rg.code || rg.region;
        const country = getCountryInfo(countryCode);
        if (!country || country.name === 'Unknown') return null;

        const count = rg.redirects || 0;
        const normalized = count / maxCount;
        const size = 0.06 + normalized * 0.09;

        return {
          location: [country.lat, country.lng],
          size,
        };
      })
      .filter(Boolean);

    // cobe crashes with empty markers array on some WebGL drivers.
    // Add an invisible placeholder at null island (0,0) to pre-allocate the GPU buffer.
    if (markers.length === 0) {
      markers.push({ location: [0, 0], size: 0.001 });
    }

    let phi = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: width * 2,
      height: height * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 2,
      mapSamples: 20000,
      mapBrightness: 8,      // High value makes continent dots bright and visible in dark mode
      mapBaseBrightness: 0,  // Ocean stays dark
      baseColor: [0.05, 0.07, 0.18],  // Very dark navy — strong contrast for continent dots
      markerColor: [0.5, 1.0, 0.2],   // Bright lime green pings
      glowColor: [0.3, 0.25, 0.9],    // Purple glow ring
      markers,
      onRender: (state) => {
        state.phi = phi;
        phi += 0.004;
        // ⚠️ Do NOT touch state.width, state.height, or state.markers here.
        // Updating these in the animation loop forces cobe to re-allocate WebGL
        // framebuffers every frame, wiping the map texture immediately after drawing it.
      },
    });

    return () => {
      globe.destroy();
    };
  }, [regions, width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      />
    </div>
  );
};

export default GlobeCanvas;
