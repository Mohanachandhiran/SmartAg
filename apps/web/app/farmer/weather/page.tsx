"use client";

import React, { useEffect, useState } from "react";
import { getWeatherForecast } from "@/services/weather";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { CloudRain, Droplets, Thermometer, AlertTriangle, RefreshCcw, MapPin } from "lucide-react";

interface WeatherData {
  date: string;
  temp: number;
  humidity: number;
  rain: number;
}

export default function WeatherForecastPage() {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Defaulting to Madurai coordinates for demo
  const [location, setLocation] = useState({ lat: 9.9252, lon: 78.1198 });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const chartData = await getWeatherForecast(lat, lon);
      setData(chartData);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching the weather forecast.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location.lat, location.lon);
  }, [location]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
        setLocation({
          lat: Number(position.coords.latitude.toFixed(4)),
          lon: Number(position.coords.longitude.toFixed(4))
        });
      },
      (err) => {
        setIsGettingLocation(false);
        setError("Location access denied or failed. Displaying default regional data.");
      }
    );
  };

  return (
    <div className="flex-1 bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif mb-1 text-primary flex items-center gap-2">
              <CloudRain className="w-6 h-6" /> 7-Day Regional Forecast
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> 
              {location.lat === 9.9252 ? "Madurai, Tamil Nadu" : "Your Current Location"} 
              (Lat: {location.lat}, Lon: {location.lon})
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleGetLocation}
              className="px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-500 text-green-950 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              disabled={isGettingLocation || loading}
            >
              <MapPin className={`w-4 h-4 ${isGettingLocation ? 'animate-bounce' : ''}`} />
              {isGettingLocation ? 'Locating...' : 'Get My Location'}
            </button>
            <button 
              onClick={() => fetchWeather(location.lat, location.lon)}
              className="p-2.5 bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
              title="Refresh Forecast"
              disabled={loading}
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-primary"></span>
              </span>
              <p className="font-semibold text-sm">Connecting to Open-Meteo Satellite Data...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center text-rose-600 gap-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg p-6 border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-10 h-10" />
              <h3 className="font-bold">API Connection Failed</h3>
              <p className="text-sm text-center max-w-md">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6 mb-6 px-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-500">
                  <Thermometer className="w-4 h-4" /> Day Temp (°C)
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                  <Droplets className="w-4 h-4" /> Precipitation Probability (%)
                </div>
              </div>
              
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)',
                        color: 'var(--card-foreground)',
                        borderRadius: '0.5rem',
                        fontWeight: 'bold'
                      }}
                    />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="temp" 
                      name="Temperature (°C)"
                      stroke="#F5A623" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="rain" 
                      name="Rain Risk (%)"
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
