'use client';

import { useEffect, useRef } from "react";

export interface MarketRow {
  name: string;
  state: string;
  district: string;
  distance: number;
  price: number;
  forecast: number;
  demand: string;
  risk: string;
  score: number;
  lat: number;
  lng: number;
  recommendation: string;
}

const RISK_COLOR: Record<string, string> = {
  Low: "#1a6641",
  Medium: "#b8860b",
  High: "#c0392b",
};

type Props = {
  markets: MarketRow[];
  commodity: string;
  selectedKey?: string | null;
  height?: number;
};

export function marketKey(m: MarketRow) {
  return `${m.name}|${m.state}`;
}

export default function MarketMap({ markets, commodity, selectedKey, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markerRefs = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          scrollWheelZoom: true,
          zoomControl: true,
        }).setView([20.5937, 78.9629], 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        layerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
      }

      const map = mapRef.current!;
      const layer = layerRef.current!;
      layer.clearLayers();
      markerRefs.current.clear();

      const points: [number, number][] = [];

      for (const m of markets) {
        if (m.lat == null || m.lng == null) continue;
        points.push([m.lat, m.lng]);

        const color = RISK_COLOR[m.risk] ?? RISK_COLOR.Medium;
        const key = marketKey(m);
        const marker = L.circleMarker([m.lat, m.lng], {
          radius: m.recommendation === "BEST" ? 10 : 7,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).bindPopup(
          `<div style="min-width:180px;font-family:system-ui,sans-serif;font-size:12px">
            <div style="font-size:10px;color:#888;margin-bottom:4px">${commodity}</div>
            <strong style="color:#1a4d2e;font-size:13px">${m.name}</strong><br/>
            <span style="color:#666">${m.district}, ${m.state}</span><br/>
            <strong style="font-size:13px">₹${m.price.toLocaleString("en-IN")}/q</strong> · ${m.forecast >= 0 ? "+" : ""}${m.forecast}% 7d<br/>
            <span style="font-weight:655;color:${color}">${m.risk} Risk</span>
          </div>`,
        );

        marker.addTo(layer);
        markerRefs.current.set(key, marker);
      }

      if (points.length === 1) {
        map.setView(points[0], 9);
      } else if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 9 });
      } else {
        map.setView([20.5937, 78.9629], 5);
      }

      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
    };
  }, [markets, commodity]);

  useEffect(() => {
    if (!selectedKey || !mapRef.current) return;

    void (async () => {
      const marker = markerRefs.current.get(selectedKey);
      if (!marker) return;
      const latlng = marker.getLatLng();
      mapRef.current?.flyTo(latlng, 10, { duration: 0.6 });
      marker.openPopup();
    })();
  }, [selectedKey]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerRef.current = null;
      markerRefs.current.clear();
    };
  }, []);

  return (
    <div
      className="relative shrink-0 overflow-hidden border-b border-border w-full h-full min-h-[350px] rounded-lg"
    >
      <div ref={containerRef} className="h-full w-full z-0 absolute inset-0" />
      {markets.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-muted/40 text-[13px] text-muted-foreground z-10">
          No mandi locations for {commodity}
        </div>
      )}
    </div>
  );
}
