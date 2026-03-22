"use client";

import { useEffect, useState } from "react";

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

const FALLBACK: UserLocation = {
  lat: 49.2827,
  lng: -123.1207,
  label: "Vancouver, BC",
};

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let label = "Your Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;
          const countryCode = data.address?.country_code?.toUpperCase();
          if (city && countryCode) label = `${city}, ${countryCode}`;
          else if (city) label = city;
        } catch {
          // reverse geocoding failed — keep generic label
        }

        setLocation({ lat: latitude, lng: longitude, label });
        setLoading(false);
      },
      () => {
        setPermissionDenied(true);
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  return { location, loading, permissionDenied };
}
