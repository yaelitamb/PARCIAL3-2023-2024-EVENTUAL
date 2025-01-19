"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
  const [form, setForm] = useState({
    nombre: "",
    timestamp: "",
    lugar: "",
    organizador: "",
    imagen: null, // Cambiado a un archivo local
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
  
      return response.data.secure_url; // Devuelve la URI de la imagen
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error; // Lanza el error para manejarlo en el flujo principal
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Subir la imagen a Cloudinary
      let imageUrl = "";
      if (form.imagen) {
        imageUrl = await handleImageUpload(form.imagen);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      // Obtener coordenadas desde Google Geocoding API
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: form.lugar,
            key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
          },
        }
      );

      if (
        geocodeResponse.data.status !== "OK" ||
        geocodeResponse.data.results.length === 0
      ) {
        alert("No se encontraron coordenadas para la dirección proporcionada.");
        setLoading(false);
        return;
      }

      const location = geocodeResponse.data.results[0].geometry.location;

      // Crear datos del evento
      const eventData = {
        nombre: form.nombre,
        timestamp: new Date(form.timestamp).toISOString(),
        lugar: form.lugar,
        lat: location.lat,
        lon: location.lng,
        organizador: form.organizador,
        imagen: imageUrl, // URI de Cloudinary
      };

      console.log("Datos enviados al backend:", eventData);

      // Enviar datos al backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/eventos`,
        eventData
      );

      console.log("Respuesta del backend:", response.data);
      alert("Evento creado exitosamente.");
      router.push("/"); // Redirigir a la página principal
    } catch (error) {
      console.error("Error al crear el evento:", error.response?.data || error.message);
      alert("No se pudo crear el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Crear Evento</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto"
      >
        <div className="mb-4">
          <label className="block text-gray-700">Nombre del Evento</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Fecha y Hora</label>
          <input
            type="datetime-local"
            name="timestamp"
            value={form.timestamp}
            onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
            required
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Lugar</label>
          <input
            type="text"
            name="lugar"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
            required
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Organizador</label>
          <input
            type="email"
            name="organizador"
            value={form.organizador}
            onChange={(e) => setForm({ ...form, organizador: e.target.value })}
            required
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Evento"}
        </button>
      </form>
    </div>
  );
}
