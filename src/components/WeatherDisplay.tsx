import { useState, lazy, Suspense } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind, Droplets, Umbrella, Activity, ChevronRight } from 'lucide-react';
import './WeatherDisplay.css';

// Lazy load the modal and all its heavy Lucide icons (`MapPin`, `Navigation`) since it's hidden by default.
const ActivityModal = lazy(() => import('./ActivityModal').then(module => ({ default: module.ActivityModal })));

export interface WeatherData {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max?: number[];
  };
}

interface WeatherDisplayProps {
  weather: WeatherData;
  locationName: string;
}

// Convert WMO Weather interpretation codes to Lucide icons
export const getWeatherIcon = (code: number, isDay: boolean = true) => {
  if (code === 0) return isDay ? <Sun className="weather-icon-main" /> : <Moon className="weather-icon-main" />;
  if (code === 1 || code === 2 || code === 3) return isDay ? <CloudSun className="weather-icon-main" /> : <CloudMoon className="weather-icon-main" />;
  if (code >= 45 && code <= 48) return <CloudFog className="weather-icon-main" />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className="weather-icon-main" />;
  if (code >= 61 && code <= 65) return <CloudRain className="weather-icon-main" />;
  if (code >= 71 && code <= 77) return <CloudSnow className="weather-icon-main" />;
  if (code >= 80 && code <= 82) return <CloudRain className="weather-icon-main" />;
  if (code >= 95 && code <= 99) return <CloudLightning className="weather-icon-main" />;
  return <Cloud className="weather-icon-main" />;
};

export const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
};

export const getActivitySuggestion = (code: number, maxTemp: number, locationName: string) => {
  const shortName = locationName.split(',')[0].trim();
  if (code >= 51 && code <= 99) return `Indoor activities, Reading, Movie marathon in ${shortName}`;
  if (maxTemp > 25 && code <= 3) return `Beach, Swimming, Picnic near ${shortName}`;
  if (maxTemp > 15 && maxTemp <= 25 && code <= 3) return `Hiking, Cycling, Outdoor sports in ${shortName}`;
  if (maxTemp <= 15 && code <= 3) return `Brisk walk, Photography, Cafe visit in ${shortName}`;
  return `Museum visit, Shopping, Light exercise in ${shortName}`;
};

export function WeatherDisplay({ weather, locationName }: WeatherDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const current = weather.current;
  const isDay = current.is_day === 1;
  const description = getWeatherDescription(current.weather_code);
  const currentRainChance = weather.daily.precipitation_probability_max?.[0] || 0;
  const currentMaxTemp = Math.round(weather.daily.temperature_2m_max[0]);
  const currentSuggestion = getActivitySuggestion(current.weather_code, currentMaxTemp, locationName);
  
  // Determine gradient based on weather code and day/night
  let gradientClass = 'bg-clear-night';
  if (isDay) {
    if (current.weather_code <= 3) gradientClass = 'bg-clear-day';
    else if (current.weather_code >= 51 && current.weather_code <= 65) gradientClass = 'bg-rain-day';
    else gradientClass = 'bg-cloudy-day';
  } else {
    if (current.weather_code <= 3) gradientClass = 'bg-clear-night';
    else if (current.weather_code >= 51 && current.weather_code <= 65) gradientClass = 'bg-rain-night';
    else gradientClass = 'bg-cloudy-night';
  }

  return (
    <div className="weather-display-container animate-fade-in">
      <div className={`weather-card glass-panel ${gradientClass}`}>
        <div className="weather-top">
          <div className="location-info">
            <h1 className="location-title">{locationName}</h1>
            <p className="weather-description">{description}</p>
          </div>
          <div className="weather-icon-container">
            {getWeatherIcon(current.weather_code, isDay)}
          </div>
        </div>
        
        <div className="weather-main-area">
          <div className="weather-main">
            <div className="temperature-readout">
              <span className="temp-value">{Math.round(current.temperature_2m)}</span>
              <span className="temp-unit">°C</span>
            </div>
            <p className="feels-like">Feels like {Math.round(current.apparent_temperature)}°C</p>
          </div>
          
          <div className="weather-extra-info">
            <div className="extra-item">
              <Umbrella size={16} className="extra-icon" />
              <span>{currentRainChance}% chance of rain</span>
            </div>
            <div 
              className="extra-item interactive-extra" 
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
            >
              <Activity size={16} className="extra-icon" />
              <span>Find {currentSuggestion.split(' in ')[0]}</span>
              <ChevronRight size={16} className="interactive-arrow" />
            </div>
          </div>
        </div>
        
        <div className="weather-details glass-panel subtle-glass">
          <div className="detail-item">
            <Wind size={20} className="detail-icon" />
            <div className="detail-info">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{Math.round(current.wind_speed_10m)} km/h</span>
            </div>
          </div>
          <div className="detail-separator"></div>
          <div className="detail-item">
            <Droplets size={20} className="detail-icon" />
            <div className="detail-info">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{current.relative_humidity_2m}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <Suspense fallback={null}>
          <ActivityModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            latitude={weather.latitude}
            longitude={weather.longitude}
            weatherCode={current.weather_code}
            maxTemp={currentMaxTemp}
            locationName={locationName}
          />
        </Suspense>
      )}
    </div>
  );
}
