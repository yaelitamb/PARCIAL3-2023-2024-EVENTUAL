"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export async function generateStaticParams() {
  return []; // Deja vacío si no hay prerenderización para IDs dinámicos
}

export default function EventDetails({ params }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const resolvedParams = await params; // Resuelve la promesa de `params`
        const id = resolvedParams.id; // Extrae el ID

        if (!id) {
          throw new Error("ID no encontrado en los parámetros.");
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/eventos/${id}`
        );
        setEvent(response.data);
      } catch (error) {
        console.error("Error al obtener los detalles del evento:", error.message);
        alert("No se pudieron cargar los detalles del evento.");
        router.push("/"); // Redirige si hay error
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [params, router]);

  if (loading) return <p>Cargando detalles del evento...</p>;
  if (!event) return <p>No se encontraron detalles para este evento.</p>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-4">{event.nombre}</h1>
      <p className="text-gray-700 mb-2">
        <strong>Fecha y Hora:</strong> {new Date(event.timestamp).toLocaleString()}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Lugar:</strong> {event.lugar}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>Organizador:</strong> {event.organizador}
      </p>
      {event.imagen && (
        <img
          src={event.imagen}
          alt={event.nombre}
          className="mt-4 rounded-lg shadow-md"
        />
      )}
      <button
        onClick={() => router.push("/")}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-6"
      >
        Volver
      </button>
    </div>
  );
}
