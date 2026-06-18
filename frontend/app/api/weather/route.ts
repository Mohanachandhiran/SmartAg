import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'OpenWeather API Key is not configured. Please add it to your .env file.' },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=7&units=metric&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenWeather API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch weather data from OpenWeather' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error fetching weather' }, { status: 500 });
  }
}
