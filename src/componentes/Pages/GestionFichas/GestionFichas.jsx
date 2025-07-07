

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionFichas.css";
import { toast } from "react-toastify";

export const GestionFichas = () => {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Nuevos estados para filtros y ordenamiento
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedAmbiente, setSelectedAmbiente] = useState("");
  const [sortBy, setSortBy] = useState("numeroFicha"); // Default sort by ficha number
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        toast.error("Sesión no válida. Por favor inicie sesión nuevamente.")
        /* console.error("No hay token de autenticación"); */
        /* setError("Sesión no válida. Por favor inicie sesión nuevamente."); */
        setTimeout(() => {
          navigate("/login");
        }, 3000);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.get(`${API_URL}/fichas`, config);

      setFichas(response.data);
      setLoading(false);
    } catch (error) {
      
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 403 || error.response.status === 401) {
        toast.warn("No tiene permisos para acceder a esta información.")
        /* setError("No tiene permisos para acceder a esta información."); */
        localStorage.removeItem("token");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(`Error del servidor: ${error.response.status}`)
        /* setError(`Error del servidor: ${error.response.status}`); */
      }
    } else if (error.request) {
      toast.error("No se pudo conectar con el servidor.")
      /* setError("No se pudo conectar con el servidor."); */
    } else {
      toast.error("Error al procesar la solicitud.")
      /* setError("Error al procesar la solicitud."); */
    }
    setLoading(false);
  };

  const handleDelete = async (idFicha) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta ficha?"
    );

    if (confirmar) {
      try {
        const token = sessionStorage.getItem("token");

        if (!token) {
          toast.error("Sesión no válida. Por favor inicie sesión nuevamente.")
          /* setError("Sesión no válida. Por favor inicie sesión nuevamente."); */
          setTimeout(() => {
            navigate("/login");
          }, 3000);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        await axios.delete(`${API_URL}/fichas/${idFicha}`, config);
        fetchFichas();
      } catch (error) {
        toast.error("Error al eliminar la ficha. Por favor, inténtelo de nuevo.")
        /* console.error("Error al eliminar la ficha:", error); */
        /* setError("Error al eliminar la ficha. Por favor, inténtelo de nuevo."); */
      }
    }
  };

  // Lógica de filtrado y ordenamiento combinada
  const filteredAndSortedFichas = fichas
    .filter((ficha) => {
      const matchesSearch =
        ficha.numeroFicha?.toString().includes(busqueda) ||
        ficha.nombrePrograma?.toLowerCase().includes(busqueda.toLowerCase());

      const matchesProgram = selectedProgram
        ? ficha.nombrePrograma === selectedProgram
        : true;

        const matchesAmbiente = selectedAmbiente ? ficha.numeroAmbiente === parseInt(selectedAmbiente) : true;
      

      return matchesSearch && matchesProgram && matchesAmbiente;
    })

    


    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "numeroFicha") {
        compareValue = a.numeroFicha - b.numeroFicha;
      } else if (sortBy === "nombrePrograma") {
        compareValue = a.nombrePrograma.localeCompare(b.nombrePrograma);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  // Obtener opciones únicas para los filtros
  const uniquePrograms = [...new Set(fichas.map((f) => f.nombrePrograma))];
  const uniqueAmbientes = [...new Set(fichas.map((f) => f.numeroAmbiente))];

  if (loading) return <div className="loading-message">Cargando fichas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-fichas-container">
      <div className="gestion-fichas-header">
        <h2>Lista de Fichas</h2>
        <input
          type="text"
          placeholder="Buscar por número de ficha o programa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-fichas"
        />
      </div>

      <div className="filters-sort-container">
        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los Programas</option>
          {uniquePrograms.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </select>

        <select
          value={selectedAmbiente}
          onChange={(e) => setSelectedAmbiente(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los Ambientes</option>
          {uniqueAmbientes.map((ambiente) => (
            <option key={ambiente} value={ambiente}>
              {ambiente}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="numeroFicha">Ordenar por Ficha</option>
          <option value="nombrePrograma">Ordenar por Programa</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="sort-order-button"
        >
          {sortOrder === "asc" ? "Ascendente" : "Descendente"}
        </button>

        <button
          onClick={() => navigate("/agregar-ficha")}
          className="add-button"
        >
          Agregar Ficha
        </button>
      </div>

      {filteredAndSortedFichas.length === 0 ? (
        <p className="no-fichas">
          No hay fichas registradas que coincidan con los criterios.
        </p>
      ) : (
        <div className="fichas-grid">
          {filteredAndSortedFichas.map((ficha) => (
            <div
              key={ficha.idFicha}
              className="ficha-card"
              onClick={() => navigate(`/fichas/${ficha.idFicha}`)} // Asumiendo una ruta de detalle
            >
              <div className="card-content">
                <div className="ficha-header-info">
                  <h3 className="ficha-numero">Ficha: {ficha.numeroFicha}</h3>
                  {/*  indicador de estado si las fichas tienen un estado (activo/inactivo) */}
                  {/* <span className={`status-indicator ${ficha.estado === 'activa' ? 'active' : 'inactive'}`}></span> */}
                </div>
                <p className="ficha-program">
                  <span className="detail-label">Programa: </span>
                  {ficha.nombrePrograma}
                </p>
                <div className="ficha-details-row">
                  <span className="detail-label">Fecha de inicio:</span>
                  <span className="detail-value">{ficha.fechaInicio}</span>
                </div>
                <div className="ficha-details-row">
                  <span className="detail-label">Fecha de finalizacion:</span>
                  <span className="detail-value">{ficha.fechaFin}</span>
                </div>
                <div className="ficha-details-row">
                  <span className="detail-label">Ambiente:</span>
                  <span className="detail-value">{ficha.numeroAmbiente}</span>
                </div>
                <div className="ficha-details-row">
                  <span className="detail-label">Aprendices:</span>
                  <span className="detail-value">{ficha.totalAprendices}</span>
                </div>
                
              </div>
              {/* <div className="card-actions">
                <button className="action-button" title="Ver Detalles">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="action-button" title="Editar Ficha">
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="action-button delete-button"
                  title="Eliminar Ficha"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita que el click en el botón active el click de la tarjeta
                    handleDelete(ficha.idFicha);
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionFichas;
