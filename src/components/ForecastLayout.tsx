import { useState } from 'react';
import { type WeatherData, getWeatherIcon, getActivitySuggestion } from './WeatherDisplay';
import { Umbrella, Activity } from 'lucide-react';
import './ForecastLayout.css';

interface ForecastLayoutProps {
  weather: WeatherData;
  locationName: string;
}

export function ForecastLayout({ weather, locationName }: ForecastLayoutProps) {
  const daily = weather.daily;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // Skip the first day (today) and take the next 5 days
  const forecastDays = daily.time.slice(1, 6).map((time, index) => {
    const realIndex = index + 1;
    const date = new Date(time);
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
    const code = daily.weather_code[realIndex];
    const maxTemp = Math.round(daily.temperature_2m_max[realIndex]);
    
    return {
      day: dayName,
      maxTemp,
      minTemp: Math.round(daily.temperature_2m_min[realIndex]),
      code,
      precipProb: daily.precipitation_probability_max?.[realIndex] || 0,
      suggestion: getActivitySuggestion(code, maxTemp, locationName)
    };
  });

  return (
    <div className="forecast-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h3 className="forecast-title">5-Day Forecast</h3>
      <div className="forecast-grid glass-panel">
        {forecastDays.map((day, i) => (
          <button 
            key={i} 
            className={`forecast-day ${expandedIndex === i ? 'active' : ''}`}
            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
          >
            <span className="forecast-day-name">{day.day}</span>
            <div className="forecast-icon-wrapper">
              {getWeatherIcon(day.code, true)}
            </div>
            <div className="forecast-temps">
              <span className="temp-max">{day.maxTemp}°</span>
              <span className="temp-min">{day.minTemp}°</span>
            </div>
          </button>
        ))}
      </div>

      {expandedIndex !== null && (
        <div className="forecast-expanded-card glass-panel animate-fade-in">
          <div className="expanded-header">
            <h4>{forecastDays[expandedIndex].day} Details</h4>
          </div>
          <div className="expanded-body">
            <div className="expanded-item">
              <Umbrella size={20} className="expanded-icon" />
              <div className="expanded-info">
                <span className="expanded-label">Chance of Rain</span>
                <span className="expanded-value">{forecastDays[expandedIndex].precipProb}%</span>
              </div>
            </div>
            <div className="expanded-separator"></div>
            <div className="expanded-item">
              <Activity size={20} className="expanded-icon" />
              <div className="expanded-info">
                <span className="expanded-label">Ideal For</span>
                <span className="expanded-value">{forecastDays[expandedIndex].suggestion}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
