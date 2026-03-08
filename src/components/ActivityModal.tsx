import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Navigation, Loader2 } from 'lucide-react';
import './ActivityModal.css';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  weatherCode: number;
  maxTemp: number;
  locationName: string;
}

interface Place {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
}

// Maps weather conditions to OpenStreetMap Overpass API queries
const getOverpassQuery = (code: number, maxTemp: number, lat: number, lon: number, radius: number = 5000) => {
  let tags = '';
  let title = '';

  if (code >= 51 && code <= 99) {
    // Rainy/Snowy -> Indoor
    title = 'Indoor Venues & Museums';
    tags = `
      node["tourism"="museum"](around:${radius},${lat},${lon});
      node["amenity"="cinema"](around:${radius},${lat},${lon});
      node["amenity"="library"](around:${radius},${lat},${lon});
    `;
  } else if (maxTemp > 25 && code <= 3) {
    // Hot -> Beach / Water
    title = 'Parks & Water Activities';
    tags = `
      node["natural"="beach"](around:${radius},${lat},${lon});
      node["leisure"="park"](around:${radius},${lat},${lon});
      node["tourism"="viewpoint"](around:${radius},${lat},${lon});
    `;
  } else if (maxTemp > 15 && maxTemp <= 25 && code <= 3) {
    // Warm -> Hiking / Outdoors
    title = 'Parks & Nature Reserves';
    tags = `
      node["leisure"="park"](around:${radius},${lat},${lon});
      node["leisure"="nature_reserve"](around:${radius},${lat},${lon});
      node["tourism"="attraction"](around:${radius},${lat},${lon});
    `;
  } else if (maxTemp <= 15 && code <= 3) {
    // Cool -> Cafe / City walk
    title = 'Cafes & Local Spots';
    tags = `
      node["amenity"="cafe"](around:${radius},${lat},${lon});
      node["amenity"="restaurant"](around:${radius},${lat},${lon});
    `;
  } else {
    // Default -> General POIs
    title = 'Nearby Attractions';
    tags = `
      node["tourism"="museum"](around:${radius},${lat},${lon});
      node["amenity"="cafe"](around:${radius},${lat},${lon});
    `;
  }

  const query = `
    [out:json][timeout:25];
    (
      ${tags}
    );
    out body 15;
  `;
  
  return { query, title };
};

export function ActivityModal({ isOpen, onClose, latitude, longitude, weatherCode, maxTemp, locationName }: ActivityModalProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionTitle, setSuggestionTitle] = useState('');

  const shortName = locationName.split(',')[0].trim();

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      setPlaces([]);

      const { query, title } = getOverpassQuery(weatherCode, maxTemp, latitude, longitude);
      setSuggestionTitle(title);

      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        
        if (!res.ok) throw new Error('Failed to fetch places');
        
        const data = await res.json();
        
        if (isMounted) {
          // Filter to only include elements that have a name tag to display nicely
          const namedPlaces = (data.elements || [])
            .filter((el: any) => el.tags && el.tags.name)
            .map((el: any) => ({
              id: el.id,
              name: el.tags.name,
              type: el.tags.amenity || el.tags.tourism || el.tags.leisure || el.tags.natural || 'place',
              lat: el.lat,
              lon: el.lon
            }));
            
          // Deduplicate by name just in case
          const uniquePlaces = Array.from(new Map(namedPlaces.map((item: Place) => [item.name, item])).values()) as Place[];
          
          setPlaces(uniquePlaces.slice(0, 8)); // Max 8 items
          
          if (uniquePlaces.length === 0) {
              setError("We couldn't find many matching places nearby. Try exploring the city center!");
          }
        }
      } catch (err) {
        if (isMounted) setError('Failed to load real-world locations. Please try again later.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlaces();

    return () => { isMounted = false; };
  }, [isOpen, latitude, longitude, weatherCode, maxTemp]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{suggestionTitle}</h2>
            <p className="modal-subtitle">Real places near {shortName}</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <Loader2 className="spinner-icon" size={32} />
              <p>Discovering places...</p>
            </div>
          )}

          {error && !loading && (
            <div className="modal-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && places.length > 0 && (
            <ul className="places-list">
              {places.map((place) => (
                <li key={place.id} className="place-item">
                  <div className="place-info">
                    <MapPin size={18} className="place-icon" />
                    <div>
                      <h4 className="place-name">{place.name}</h4>
                      <span className="place-type">{place.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="map-link-btn"
                  >
                    <span>View Map</span>
                    <Navigation size={14} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        
      </div>
    </div>,
    document.body
  );
}
