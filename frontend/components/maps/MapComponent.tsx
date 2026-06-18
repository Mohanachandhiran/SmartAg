'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon bug in Leaflet + Next.js build
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface LocationPoint {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  type: 'mandi' | 'fpo' | 'buyer';
  distance?: number;
}



function RecenterMap({ coords }: { coords: number[] }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords[0], coords[1]], 12);
  }, [coords, map]);
  return null;
}

export default function MapComponent({ userLocation, mandiPoints = [] }: { userLocation?: { lat: number; lng: number } | null, mandiPoints?: LocationPoint[] }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultCenter: [number, number] = [9.9252, 78.1198]; // Madurai default
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  const nearestRoute = React.useMemo(() => {
    // Draw route to nearest mandi if available
    if (userLocation && mandiPoints.length > 0) {
      // Assuming mandiPoints is already sorted by distance
      const nearest = mandiPoints[0];
      if (nearest.lat && nearest.lng) {
        return [
          [userLocation.lat, userLocation.lng],
          [nearest.lat, nearest.lng]
        ];
      }
    }
    return [];
  }, [userLocation, mandiPoints]);

  if (!isMounted) return null;

  return (
    <div className="w-full h-full min-h-[450px] rounded-xl overflow-hidden shadow-agri border border-border relative z-0">
      <MapContainer 
        center={center} 
        zoom={10} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Farm location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createIcon('red')}>
            <Popup>
              <div className="text-xs font-bold text-foreground">
                🌾 My Farm Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Locations */}
        {mandiPoints.map((p, idx) => {
          if (!p.lat || !p.lng) return null;
          const color = 'green';
          return (
            <Marker key={p.id || idx} position={[p.lat, p.lng]} icon={createIcon(color)}>
              <Popup>
                <div className="text-xs">
                  <span className="font-bold text-foreground block">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase block">{p.type || 'Mandi'} Center</span>
                  {p.distance && (
                    <span className="text-[10px] text-green-700 font-bold block mt-1">
                      Distance: {p.distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline to nearest FPO */}
        {nearestRoute.length > 0 && (
          <Polyline positions={nearestRoute as any} color="#F5A623" weight={4} dashArray="5, 8" />
        )}

        <RecenterMap coords={center} />
      </MapContainer>
    </div>
  );
}
