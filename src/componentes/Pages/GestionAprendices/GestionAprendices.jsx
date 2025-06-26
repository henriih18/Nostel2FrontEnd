import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionAprendices.css";

export const GestionAprendices = () => {
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  useEffect(() => {
    fetchAprendices();
  }, []);

  const fetchAprendices = async () => {
    try {
      // Obtener el token del localStorage
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.error("No hay token de autenticación");
        navigate("/login");
        return;
      }

      console.log("Token utilizado:", token);

      // Configurar los headers con el token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.get(
        `${API_URL}/aprendices`,
        config
      );

      //console.log('Respuesta del servidor:', response.data);

      setAprendices(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener aprendices:", error);

      if (error.response) {
        console.error(
          "Respuesta de error:",
          error.response.status,
          error.response.data
        );

        if (error.response.status === 403 || error.response.status === 401) {
          console.error("Error de autenticación. Redirigiendo al login...");
          localStorage.removeItem("token");
          navigate("/login");
        }
      }

      setError(
        "Error al cargar los aprendices. Por favor, inténtelo de nuevo más tarde."
      );
      setLoading(false);
    }
  };

  const buscarAprendiz = aprendices.filter(
    (aprendiz) =>
      `${aprendiz.nombres} ${aprendiz.apellidos}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()) ||
      aprendiz.documento?.toString().includes(busqueda)
  );

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-aprendices-container">
      <div className="gestion-aprendices-header">
        <h2>Lista de Aprendices</h2>

      <input
        type="text"
        placeholder="Buscar por nombre o documento"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="buscador-aprendices"
      />
      </div>
      

      {aprendices.length === 0 ? (
        <p className="no-aprendices">No hay aprendices registrados.</p>
      ) : (
        <div className="aprendices-grid">
          {buscarAprendiz.map((aprendiz) => (
            <div
              key={aprendiz.idAprendiz}
              className="aprendiz-card"
              onClick={() => navigate(`/aprendices/${aprendiz.idAprendiz}`)}
            >
              <div className="aprendiz-header">
                <strong>
                  {aprendiz.nombres} {aprendiz.apellidos}
                </strong>
              </div>
              <div className="aprendiz-detalle">
                Programa: {aprendiz.nombrePrograma}
                <br />
                Ficha: {aprendiz.numeroFicha}
                <br />
                Ambiente: {aprendiz.numeroAmbiente}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionAprendices;
