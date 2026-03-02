import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchWeatherData, type WeatherData } from '../services/weather';

// Fix for default Leaflet markers in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  events: Array<{
    id: string;
    title: string;
    location: string;
    coordinates?: [number, number];
    type: string;
    description: string;
  }>;
}

function MapRecenter({ events }: { events: MapProps['events'] }) {
  const map = useMap();

  const fitToMarkers = () => {
    if (events.length === 0) return;

    const coordinates = events
      .filter(e => e.coordinates)
      .map(e => e.coordinates as [number, number]);

    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 8,
        animate: true,
        duration: 1.5
      });
    }
  };

  useEffect(() => {
    fitToMarkers();
  }, [events, map]);

  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control leaflet-bar !border-0">
        <a 
          href="#" 
          role="button" 
          title="Fit to markers"
          onClick={(e) => {
            e.preventDefault();
            fitToMarkers();
          }}
          className="!bg-[#1a1a1a] !text-white !border !border-[#333] hover:!bg-[#333] flex items-center justify-center"
          style={{ width: '30px', height: '30px', lineHeight: '30px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
        </a>
      </div>
    </div>
  );
}

export default function ConflictMap({ events }: MapProps) {
  const defaultCenter: [number, number] = [32.4279, 53.6880]; // Center of Iran
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [showWeather, setShowWeather] = useState(false);

  useEffect(() => {
    const loadWeather = async () => {
      const data = await fetchWeatherData();
      setWeatherData(data);
    };
    loadWeather();
  }, []);

  // Custom icons based on event type
  const getIcon = (type: string) => {
    let color = '#f97316'; // Default orange
    
    switch (type) {
      case 'MILITARY': color = '#ef4444'; break; // Red
      case 'DIPLOMATIC': color = '#3b82f6'; break; // Blue
      case 'CIVIL': color = '#10b981'; break; // Emerald
      case 'CYBER': color = '#8b5cf6'; break; // Violet
    }

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const getWeatherIcon = (condition: string) => {
    let icon = '☀️';
    if (condition === 'Cloudy') icon = '☁️';
    if (condition === 'Rain' || condition === 'Showers') icon = '🌧️';
    if (condition === 'Snow') icon = '❄️';
    if (condition === 'Storm') icon = '⚡';
    if (condition === 'Fog') icon = '🌫️';

    return L.divIcon({
      className: 'weather-icon',
      html: `<div style="font-size: 20px; filter: drop-shadow(0 0 2px black);">${icon}</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Custom function to create cluster icons
  const createClusterCustomIcon = function (cluster: any) {
    return L.divIcon({
      html: `<div class="cluster-icon"><span>${cluster.getChildCount()}</span></div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(33, 33, true),
    });
  };

  return (
    <div className="h-full w-full bg-[#111] relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
        >
          {events.map((event) => (
            event.coordinates && (
              <Marker 
                key={event.id} 
                position={event.coordinates}
                icon={getIcon(event.type)}
              >
                <Popup className="custom-popup" closeButton={false}>
                  <div className="p-3 min-w-[200px] max-w-[250px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded text-black font-bold" style={{ 
                        backgroundColor: event.type === 'MILITARY' ? '#ef4444' : 
                                       event.type === 'DIPLOMATIC' ? '#3b82f6' : 
                                       event.type === 'CIVIL' ? '#10b981' : 
                                       event.type === 'CYBER' ? '#8b5cf6' : '#f97316'
                      }}>
                        {event.type}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{event.location}</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-white leading-tight">{event.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-3">{event.description}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MarkerClusterGroup>

        {showWeather && weatherData.map((data, idx) => (
          <Marker
            key={`weather-${idx}`}
            position={[data.latitude, data.longitude]}
            icon={getWeatherIcon(data.condition)}
            zIndexOffset={-100} // Keep weather icons below event markers
          >
            <Popup className="custom-popup" closeButton={false}>
              <div className="p-2 text-center">
                <div className="font-bold text-sm text-white">{data.location}</div>
                <div className="text-xs text-gray-400">{data.condition}</div>
                <div className="text-lg font-mono text-white mt-1">{data.temperature}°C</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapRecenter events={events} />
      </MapContainer>
      
      {/* Map Overlay UI */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 p-2 border border-white/10 text-[10px] font-mono text-white/60">
        <div>LAT: 32.4279 N</div>
        <div>LNG: 53.6880 E</div>
        <div>ZOOM: 5X</div>
      </div>

      {/* Weather Toggle */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={() => setShowWeather(!showWeather)}
          className={`p-2 rounded border transition-colors ${
            showWeather 
              ? 'bg-blue-900/50 border-blue-500 text-blue-200' 
              : 'bg-black/80 border-white/10 text-gray-400 hover:text-white'
          }`}
          title="Toggle Weather Overlay"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3s1.3 3 3 3h11c1.7 0 3-1.3 3-3z"/>
            <path d="M3.3 16C1.9 15.6 1 14.4 1 13c0-2.2 1.8-4 4-4 1 0 1.9.4 2.5 1.1.6-1.6 2.1-2.6 3.9-2.6 2.5 0 4.5 2 4.5 4.5 0 .4-.1.8-.2 1.2"/>
            <path d="M16 13c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.3-.5 2.5-1.3 3.4"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
