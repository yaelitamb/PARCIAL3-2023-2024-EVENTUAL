"use client";
import { useState } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [address, setAddress] = useState(""); // Dirección introducida por el usuario
  const [lat, setLat] = useState(37.02); // Coordenadas predeterminadas
  const [lon, setLon] = useState(-4.33); // Coordenadas predeterminadas
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

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
      fetchEvents(location.lat, location.lng); // Llama a fetchEvents con las nuevas coordenadas
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

  const handleLoginSuccess = async (credentialResponse) => {
    console.log("Google Credential Response:", credentialResponse);

    try {
      const response = await axios.post("http://localhost:8000/auth/verify", {
        idToken: credentialResponse.credential,
        
      });
      console.log("ID Token:", credentialResponse.credential);

      console.log("Backend response:", response.data);
    } catch (error) {
      console.error("Error verifying token with backend:", error.message);
    }
  };

  const handleLoginError = () => {
    console.error("Login Failed");
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error("Error al obtener los logs:", error.message);
      alert("Error al obtener los logs. Por favor, inténtelo más tarde.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: "20px" }}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div>
        <h1>Iniciar Sesión con Google</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </GoogleOAuthProvider>
      <h1>Eventos Próximos</h1>
      <div>
        <label>
          Dirección:
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Introduce una dirección"
            style={{ marginLeft: "10px", marginRight: "20px", width: "300px" }}
          />
        </label>
        <button onClick={fetchCoordinates}>Buscar por dirección</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>
          Latitud:
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            style={{ marginLeft: "10px", marginRight: "20px" }}
          />
        </label>
        <label>
          Longitud:
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            style={{ marginLeft: "10px", marginRight: "20px" }}
          />
        </label>
        <button onClick={() => fetchEvents(lat, lon)}>Buscar por coordenadas</button>
      </div>

      {loading && <p>Cargando eventos...</p>}

      <ul style={{ marginTop: "20px" }}>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.nombre}</h3>
            <p>Organizador: {event.organizador}</p>
            <p>Fecha y hora: {new Date(event.timestamp).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      <button onClick={fetchLogs} style={{ margin: "20px", padding: "10px 20px" }}>
        Ver Logs de Sesión
      </button>

      {loading && <p>Cargando logs...</p>}

      {/* Mostrar los logs */}
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <p><strong>Usuario:</strong> {log.user}</p>
            <p><strong>Fecha y hora:</strong> {new Date(log.timestamp).toLocaleString()}</p>
            <p><strong>Expiración:</strong> {new Date(log.expiration * 1000).toLocaleString()}</p>
            <p><strong>Token:</strong> {log.token}</p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
