"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

type HeatPoint = [number, number, number];

const SUPPLIER_DENSITY: HeatPoint[] = [
  // China — dominant manufacturing hub
  [30.57, 114.27, 1.0],   // Wuhan
  [23.13, 113.26, 1.0],   // Guangzhou
  [22.54, 114.06, 0.95],  // Shenzhen
  [31.23, 121.47, 0.95],  // Shanghai
  [39.9, 116.4, 0.85],    // Beijing
  [30.3, 120.15, 0.9],    // Hangzhou
  [29.87, 121.55, 0.8],   // Ningbo
  [24.48, 118.09, 0.75],  // Xiamen
  [36.07, 120.38, 0.7],   // Qingdao
  [34.26, 108.94, 0.6],   // Xi'an
  [28.23, 112.94, 0.65],  // Changsha
  [26.08, 119.3, 0.7],    // Fuzhou
  [32.06, 118.78, 0.65],  // Nanjing
  [38.05, 114.49, 0.55],  // Shijiazhuang
  [25.04, 102.68, 0.4],   // Kunming

  // India — fast-growing supplier base
  [19.08, 72.88, 0.7],    // Mumbai
  [28.61, 77.21, 0.6],    // Delhi
  [13.08, 80.27, 0.55],   // Chennai
  [12.97, 77.59, 0.6],    // Bangalore
  [17.38, 78.49, 0.5],    // Hyderabad
  [22.57, 88.36, 0.4],    // Kolkata
  [23.02, 72.57, 0.55],   // Ahmedabad
  [18.52, 73.86, 0.5],    // Pune

  // Southeast Asia — emerging manufacturing
  [21.03, 105.85, 0.65],  // Hanoi
  [10.82, 106.63, 0.6],   // Ho Chi Minh City
  [13.76, 100.5, 0.55],   // Bangkok
  [1.35, 103.82, 0.45],   // Singapore
  [-6.21, 106.85, 0.5],   // Jakarta
  [14.6, 120.98, 0.35],   // Manila

  // Japan & South Korea — high-tech manufacturing
  [35.68, 139.69, 0.65],  // Tokyo
  [34.69, 135.5, 0.55],   // Osaka
  [35.18, 136.91, 0.5],   // Nagoya
  [37.57, 126.98, 0.6],   // Seoul
  [35.18, 129.08, 0.5],   // Busan

  // Germany & Central Europe — precision engineering
  [48.14, 11.58, 0.55],   // Munich
  [50.11, 8.68, 0.5],     // Frankfurt
  [51.23, 6.78, 0.45],    // Düsseldorf
  [48.78, 9.18, 0.5],     // Stuttgart
  [52.52, 13.41, 0.4],    // Berlin
  [51.34, 12.37, 0.35],   // Leipzig

  // Western Europe
  [48.86, 2.35, 0.35],    // Paris
  [45.46, 9.19, 0.4],     // Milan
  [41.39, 2.17, 0.3],     // Barcelona
  [51.51, -0.13, 0.35],   // London
  [52.37, 4.9, 0.3],      // Amsterdam

  // Turkey
  [41.01, 28.98, 0.45],   // Istanbul
  [39.93, 32.85, 0.3],    // Ankara

  // USA — diversified supplier base
  [34.05, -118.24, 0.45], // Los Angeles
  [40.71, -74.01, 0.4],   // New York
  [41.88, -87.63, 0.4],   // Chicago
  [29.76, -95.37, 0.35],  // Houston
  [37.77, -122.42, 0.35], // San Francisco
  [33.75, -84.39, 0.3],   // Atlanta
  [42.36, -71.06, 0.3],   // Boston
  [47.61, -122.33, 0.25], // Seattle

  // Mexico — nearshoring growth
  [19.43, -99.13, 0.4],   // Mexico City
  [25.67, -100.31, 0.35], // Monterrey
  [20.67, -103.35, 0.3],  // Guadalajara

  // Brazil
  [-23.55, -46.63, 0.35], // São Paulo
  [-22.91, -43.17, 0.25], // Rio de Janeiro

  // Middle East
  [25.2, 55.27, 0.3],     // Dubai
  [24.47, 54.37, 0.2],    // Abu Dhabi

  // Africa — emerging
  [-33.93, 18.42, 0.2],   // Cape Town
  [6.52, 3.38, 0.2],      // Lagos
  [30.04, 31.24, 0.25],   // Cairo

  // Taiwan — semiconductor hub
  [25.03, 121.57, 0.7],   // Taipei
  [24.15, 120.67, 0.6],   // Taichung
  [22.62, 120.31, 0.5],   // Kaohsiung

  // Bangladesh — textiles
  [23.81, 90.41, 0.45],   // Dhaka
  [22.34, 91.82, 0.35],   // Chittagong
];

export function HeatmapLayer() {
  const map = useMap();

  useEffect(() => {
    const heat = L.heatLayer(SUPPLIER_DENSITY, {
      radius: 35,
      blur: 40,
      maxZoom: 10,
      minOpacity: 0.08,
      gradient: {
        0.0: "rgba(0,0,0,0)",
        0.15: "rgba(60,60,60,0.12)",
        0.35: "rgba(40,40,40,0.22)",
        0.55: "rgba(25,25,25,0.35)",
        0.75: "rgba(15,15,15,0.48)",
        1.0: "rgba(0,0,0,0.62)",
      },
    });

    heat.addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map]);

  return null;
}
