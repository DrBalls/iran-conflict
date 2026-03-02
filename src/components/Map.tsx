import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function MapController({ events }: { events: MapProps['events'] }) {
  const map = useMap();

  useEffect(() => {
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
  }, [events, map]);

  return null;
}

export default function ConflictMap({ events }: MapProps) {
  const defaultCenter: [number, number] = [32.4279, 53.6880]; // Center of Iran

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
        <MapController events={events} />
      </MapContainer>
      
      {/* Map Overlay UI */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/80 p-2 border border-white/10 text-[10px] font-mono text-white/60">
        <div>LAT: 32.4279 N</div>
        <div>LNG: 53.6880 E</div>
        <div>ZOOM: 5X</div>
      </div>
    </div>
  );
}
