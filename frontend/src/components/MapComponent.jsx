import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ professionals }) => {
  // Center of Brazil
  const center = [-14.2350, -51.9253];

  // Function to get coordinates from city/state (Mocked for now since we don't have geocoding)
  // In a real app, we would use a geocoding API or have coordinates in the DB
  const getCoordinates = (prof) => {
    // Simple offset based on ID to scatter them a bit if we don't have coords
    // This is just a visualization trick since our seed data doesn't have lat/lon
    // If the DB has lat/lon, we should use it.
    // Let's check the verify_api output. No lat/lon in professional model.
    
    // Mapping some states to approx coordinates
    const stateCoords = {
        'SP': [-23.5505, -46.6333],
        'MG': [-19.9167, -43.9345],
        'GO': [-16.6869, -49.2648],
        'MT': [-15.6014, -56.0979],
        'MS': [-20.4697, -54.6201],
        'PR': [-25.4284, -49.2733],
        'RS': [-30.0346, -51.2177],
        'BA': [-12.9777, -38.5016],
        'TO': [-10.1753, -48.3318]
    };

    const base = stateCoords[prof.state] || center;
    // Add random jitter based on ID
    const jitter = (prof.id % 10) * 0.05; 
    return [base[0] + jitter, base[1] + jitter];
  };

  return (
    <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {professionals.map((prof) => (
        <Marker key={prof.id} position={getCoordinates(prof)}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{prof.name}</h3>
              <p className="text-sm text-gray-600">{prof.type}</p>
              <p className="text-xs">{prof.city} - {prof.state}</p>
              <p className="text-xs mt-1">{prof.phone}</p>
              <p className="text-xs italic">{prof.specialties}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
