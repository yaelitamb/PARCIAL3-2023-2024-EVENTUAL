"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export async function generateStaticParams() {
  return []; // Deja vacío si no hay prerenderización para IDs dinámicos
}

export default function EditEvent({ params }) {
  const [form, setForm] = useState({
    nombre: "",
    timestamp: "",
    lugar: "",
    organizador: "",
    imagen: null, // Imagen local o URL existente
  });
  const [existingImageUrl, setExistingImageUrl] = useState(""); // Almacenar la URL de la imagen existente
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Obtener detalles del evento al montar el componente
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
          throw new Error("ID no encontrado en los parámetros.");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/eventos/${id}`
        );

        const eventData = response.data;

        // Pre-cargar datos en el formulario
        setForm({
          nombre: eventData.nombre,
          timestamp: new Date(eventData.timestamp).toISOString().slice(0, 16), // Para input datetime-local
          lugar: eventData.lugar,
          organizador: eventData.organizador,
          imagen: null, // No cargamos archivo local aquí
        });
        setExistingImageUrl(eventData.imagen); // URL de la imagen existente
      } catch (error) {
        console.error("Error al obtener los detalles del evento:", error.message);
        alert("No se pudieron cargar los detalles del evento.");
        router.push("/");
      }
    };

    fetchEventDetails();
  }, [params, router]);

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
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resolvedParams = await params;
      const id = resolvedParams.id;

      if (!id) {
        throw new Error("ID no encontrado en los parámetros.");
      }

      // Subir imagen si hay una nueva seleccionada
      let imageUrl = existingImageUrl;
      if (form.imagen) {
        imageUrl = await handleImageUpload(form.imagen);
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

      // Crear datos del evento actualizado
      const updatedEvent = {
        nombre: form.nombre,
        timestamp: new Date(form.timestamp).toISOString(),
        lugar: form.lugar,
        lat: location.lat,
        lon: location.lng,
        organizador: form.organizador,
        imagen: imageUrl, // URI de la imagen
      };

      console.log("Datos enviados al backend:", updatedEvent);

      // Enviar datos actualizados al backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/eventos/${id}`,
        updatedEvent
      );

      console.log("Respuesta del backend:", response.data);
      alert("Evento actualizado exitosamente.");
      router.push("/");
    } catch (error) {
      console.error("Error al actualizar el evento:", error.response?.data || error.message);
      alert("No se pudo actualizar el evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Editar Evento</h1>
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
          <label className="block text-gray-700">Imagen Actual</label>
          {existingImageUrl && (
            <img
              src={existingImageUrl}
              alt="Imagen actual"
              className="rounded-lg shadow-md mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, imagen: e.target.files[0] })}
            className="border rounded-lg p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
