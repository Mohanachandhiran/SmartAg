export async function getWeatherForecast(lat: number, lon: number) {
  // Use Open-Meteo directly for the 7-day forecast
  // We need daily temperature max, relative humidity mean, and precipitation probability max
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_probability_max,relative_humidity_2m_mean&timezone=auto`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch weather from Open-Meteo");
  }

  const data = await response.json();
  
  // Format the data into the structure expected by the frontend chart
  // Open-Meteo returns daily arrays: data.daily.time, data.daily.temperature_2m_max, etc.
  const chartData = [];
  
  if (data.daily && data.daily.time) {
    for (let i = 0; i < data.daily.time.length; i++) {
      const dateStr = data.daily.time[i];
      chartData.push({
        date: new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        temp: Math.round(data.daily.temperature_2m_max[i]),
        humidity: data.daily.relative_humidity_2m_mean[i],
        rain: data.daily.precipitation_probability_max[i]
      });
    }
  }

  return chartData;
}
