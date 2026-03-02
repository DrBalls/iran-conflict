import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
    title: string;
    location: string;
    coordinates?: [number, number];
    type: string;
    description: string;
  }>;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 5);
  }, [center, map]);
  return null;
}

export default function ConflictMap({ events }: MapProps) {
  const defaultCenter: [number, number] = [32.4279, 53.6880]; // Center of Iran

  const getIcon = (type: string) => {
    const color = type === 'MILITARY' ? '#ef4444' : type === 'DIPLOMATIC' ? '#3b82f6' : '#f97316';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
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
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {events.map((event, idx) => (
          event.coordinates && (
            <Marker 
              key={idx} 
              position={event.coordinates}
              icon={getIcon(event.type)}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{event.title}</h3>
                  <p className="text-xs text-gray-400 mb-1">{event.location}</p>
                  <p className="text-xs">{event.description}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
        <MapUpdater center={defaultCenter} />
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
