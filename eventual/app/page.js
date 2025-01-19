"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./MapComponent"), { ssr: false });



export default function Home() {
  const [events, setEvents] = useState([]);
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(37.02);
  const [lon, setLon] = useState(-4.33);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  const fetchCoordinates = async () => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          },
        }
      );

      if (response.data.status !== "OK") {
        alert("No se encontraron coordenadas para la dirección proporcionada.");
        return;
      }

      const location = response.data.results[0].geometry.location;
      setLat(location.lat);
      setLon(location.lng);
      fetchEvents(location.lat, location.lng);
    } catch (error) {
      console.error("Error al convertir dirección a coordenadas:", error.message);
      alert("Error al convertir dirección a coordenadas.");
    }
  };

  const fetchEvents = async (latitude = lat, longitude = lon) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/`, {
        params: { lat: latitude, lon: longitude },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Error al obtener eventos:", error.message);
      alert("Error al conectar con el backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    // Redirige a una página para crear un nuevo evento
    router.push("/create-event");
  };

  const handleEditEvent = (id) => {
    // Redirige a una página para editar el evento seleccionado
    router.push(`/edit-event/${id}`);
  };

  const handleDeleteEvent = async (id) => {
    if (confirm("¿Estás seguro de que deseas borrar este evento?")) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/eventos/${id}`);
        alert("Evento eliminado correctamente.");
        fetchEvents();
      } catch (error) {
        console.error("Error al borrar el evento:", error.message);
        alert("No se pudo borrar el evento.");
      }
    }
  };

  const handleViewDetails = (id) => {
    router.push(`/details-event/${id}`);
  };
  
  

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Eventos Próximos</h1>
      <div className="flex justify-center mb-8">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Introduce una dirección"
          className="border rounded-lg p-2 mr-4 w-1/3"
        />
        <button
          onClick={fetchCoordinates}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Buscar por dirección
        </button>
      </div>

      <div className="flex justify-center mb-8">
        <div className="mr-4">
          <label className="block text-gray-700">Latitud:</label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">Longitud:</label>
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <button
          onClick={() => fetchEvents(lat, lon)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ml-4 mt-6"
        >
          Buscar por coordenadas
        </button>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleCreateEvent}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Crear Evento
        </button>
      </div>

      {loading && <p className="text-center text-lg">Cargando eventos...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="border rounded-lg p-4 shadow-lg bg-white"
          >
            <h3 className="text-xl font-bold mb-2">{event.nombre}</h3>
            <p className="text-gray-600 mb-2">
              Organizador: {event.organizador}
            </p>
            <p className="text-gray-600 mb-4">
              Fecha y hora: {new Date(event.timestamp).toLocaleString()}
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => handleViewDetails(event.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Ver detalles
              </button>
              <button
                onClick={() => handleEditEvent(event.id)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="h-[500px] w-full">
        <DynamicMap
          center={[lat, lon]}
          events={events}
          handleViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}
