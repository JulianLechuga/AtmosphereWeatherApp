import { useState, useEffect } from 'react';
import { CloudRain } from 'lucide-react';
import { SearchBar, type LocationResult } from './components/SearchBar';
import { WeatherDisplay, type WeatherData } from './components/WeatherDisplay';
import { ForecastLayout } from './components/ForecastLayout';
import './App.css';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      setLocationName(name);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attempt Geolocation first, fallback to London
    const getLocalWeather = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
              const geoData = await geoRes.json();
              const name = geoData.locality || geoData.city || 'Your Location';
              fetchWeather(latitude, longitude, name);
            } catch (err) {
              fetchWeather(latitude, longitude, 'Your Location');
            }
          },
          (err) => {
            console.warn(err);
            // Default to Tokyo if location denied
            fetchWeather(35.6895, 139.6917, 'Tokyo');
          }
        );
      } else {
        // Default to Tokyo
        fetchWeather(35.6895, 139.6917, 'Tokyo');
      }
    };
    
    getLocalWeather();
  }, []);

  const handleLocationSelect = (location: LocationResult) => {
    fetchWeather(location.latitude, location.longitude, location.name);
  };

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="logo-area">
          <CloudRain className="logo-icon" size={32} />
          <span className="app-title">Atmosphere</span>
        </div>
        <SearchBar onLocationSelect={handleLocationSelect} />
      </header>

      <main className="main-content">
        {isLoading ? (
          <div className="status-message animate-fade-in">
            <div className="spinner"></div>
            <p>Gathering atmosphere data...</p>
          </div>
        ) : error ? (
          <div className="status-message animate-fade-in">
            <p className="error-text">Oops! {error}. Please try another location.</p>
          </div>
        ) : weather ? (
          <>
            <WeatherDisplay weather={weather} locationName={locationName} />
            <ForecastLayout weather={weather} locationName={locationName} />
          </>
        ) : null}
      </main>
    </div>
  );
}

export default App;
