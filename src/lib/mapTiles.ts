/**
 * Stadia Maps raster tiles require a public API key when the app is served from a real hostname.
 * Localhost often works without a key; production (e.g. Vercel) returns 401 without it.
 * @see https://docs.stadiamaps.com/raster/
 * @see https://docs.stadiamaps.com/authentication/
 */
export function getMapRasterConfig(): { url: string; attribution: string } {
  const key = process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY?.trim();

  if (key) {
    return {
      url: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(key)}`,
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    };
  }

  return {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  };
}
