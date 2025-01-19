"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export default function MapComponent({ center, events, handleViewDetails }) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg shadow-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapUpdater center={center} />
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.lat, event.lon]}
          icon={customIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{event.nombre}</h3>
              <p>{event.lugar}</p>
              <button
                onClick={() => handleViewDetails(event.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 mt-2"
              >
                Ver detalles
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
