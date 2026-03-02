
export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  weatherCode: number;
  condition: string;
}

const LOCATIONS = [
  { name: 'Tehran', lat: 35.6892, lng: 51.3890 },
  { name: 'Mashhad', lat: 36.2605, lng: 59.6168 },
  { name: 'Isfahan', lat: 32.6546, lng: 51.6680 },
  { name: 'Tabriz', lat: 38.0962, lng: 46.2740 },
  { name: 'Shiraz', lat: 29.5918, lng: 52.5837 },
  { name: 'Ahvaz', lat: 31.3183, lng: 48.6706 },
  { name: 'Bandar Abbas', lat: 27.1832, lng: 56.2666 },
  { name: 'Zahedan', lat: 29.4963, lng: 60.8629 },
  { name: 'Kermanshah', lat: 34.3142, lng: 47.0650 },
  { name: 'Rasht', lat: 37.2682, lng: 49.5891 }
];

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code >= 1 && code <= 3) return 'Cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Storm';
  return 'Unknown';
}

export async function fetchWeatherData(): Promise<WeatherData[]> {
  try {
    const promises = LOCATIONS.map(async (loc) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,weather_code&timezone=auto`;
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        location: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        condition: getWeatherCondition(data.current.weather_code)
      };
    });

    return await Promise.all(promises);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return [];
  }
}
