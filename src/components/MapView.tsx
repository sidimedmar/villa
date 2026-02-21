import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../LanguageContext';
import { Property } from '../types';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Mauritania coordinates (Nouakchott center)
  const center: [number, number] = [18.0858, -15.9785];

  useEffect(() => {
    fetch('/api/properties', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setProperties(data));
  }, []);

  // Mock coordinates for demo purposes since we don't have real lat/lng in DB yet
  const getMockCoords = (id: string): [number, number] => {
    const seed = id.split('-')[1] ? parseInt(id.split('-')[1]) : 0;
    return [
      center[0] + (Math.sin(seed) * 0.05),
      center[1] + (Math.cos(seed) * 0.05)
    ];
  };

  return (
    <div className="h-full min-h-[600px] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
      <MapContainer center={center} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
          <Marker key={property.id} position={getMockCoords(property.id)}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-slate-900 mb-1">{property.name}</h4>
                <p className="text-xs text-slate-500 mb-2">{property.province}, {property.region}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-sm font-bold text-primary">{property.rent_amount} MRU</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    property.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {t(`property.paymentStatus.${property.payment_status}`)}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl">
        <h5 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Légende</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs text-slate-200">Propriété</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
