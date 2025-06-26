import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionInstructores.css";

export const GestionInstructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInstructores();
  }, []);

  const manejarAgregarInstructor = () => {
    navigate("/agregarInstructor");
  };

  const fetchInstructores = async () => {
    try {
      console.log("Iniciando fetchInstructores...");

      // Obtener token del localStorage
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No hay token de autenticación");
        setError("Sesión no válida. Por favor inicie sesión nuevamente.");
        navigate("/login");
        return;
      }

      // Configurar los headers con el token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5 segundos
      };

      // Realizar la petición para obtener los instructores
      const response = await axios.get(
        `${API_URL}/instructores`,
        config
      );

      console.log("Datos recibidos:", response.data);

      // Extraer la lista de instructores según la estructura de la respuesta
      let listaInstructores = Array.isArray(response.data)
        ? response.data
        : response.data.instructores || [];

      setInstructores(listaInstructores);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener instructores:", error);

      if (error.response) {
        console.error(
          "Respuesta de error:",
          error.response.status,
          error.response.data
        );

        if (error.response.status === 403 || error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(
            `Error del servidor: ${error.response.status}. Inténtelo más tarde.`
          );
        }
      } else {
        setError("No se pudo conectar con el servidor. Verifique su conexión.");
      }
      setLoading(false);
    }
  };

  if (loading)
    return <div className="loading-container">Cargando instructores...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-instructores-container">
      <div className="gestion-instructores-header">
        <h2>Lista de Instructores</h2>
      </div>

      {instructores.length === 0 ? (
        <p className="no-instructores">No hay instructores registrados.</p>
      ) : (
        <div className="instructores-grid">
          <button
            onClick={manejarAgregarInstructor}
            className="agregar-instructor-button"
          >
            Agregar Instructor
          </button>
          <div className="container-instructores">
            {instructores.map((instructor) => (
              <div key={instructor.idInstructor} className="instructor-card">
                <h4 className="instructor-nombre">
                  {instructor.nombres} {instructor.apellidos}
                </h4>
                <p className="instructor-especialidad">
                  <strong>Especialidad:</strong>{" "}
                  {instructor.area || "Sin área asignada"}
                </p>
                <p className="instructor-docente">
                  <strong>Número Docente:</strong>{" "}
                  {instructor.numeroDocente ?? "No disponible"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      
    </div>
  );
};

export default GestionInstructores;
