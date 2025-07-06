

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionInstructores.css";
import { toast } from "react-toastify";

export const GestionInstructores = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Nuevos estados para filtros y ordenamiento
  const [selectedArea, setSelectedArea] = useState("");
  const [sortBy, setSortBy] = useState("nombres"); // Default sort by name
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchInstructores();
  }, []);

  const fetchInstructores = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        /* console.error("No hay token de autenticación"); */
        toast.error("Sesión no válida. Por favor inicie sesión nuevamente.");
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
        timeout: 5000,
      };

      const response = await axios.get(
        `${API_URL}/instructores`,
        config
      );

      let listaInstructores = Array.isArray(response.data)
        ? response.data
        : response.data.instructores || [];

      setInstructores(listaInstructores);
      setLoading(false);
    } catch (error) {
      /* console.error("Error al obtener instructores:", error); */

      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          toast.error(
            `Error del servidor. Inténtelo más tarde.`
          );
        }
      } else {
        toast.error("No se pudo conectar con el servidor. Verifique su conexión.");
      }
      setLoading(false);
    }
  };

  // Lógica de filtrado y ordenamiento combinada
  const filteredAndSortedInstructores = instructores
    .filter((instructor) => {
      const matchesSearch =
        `${instructor.nombres} ${instructor.apellidos}`
          .toLowerCase()
          .includes(busqueda.toLowerCase()) ||
        instructor.numeroDocente?.toString().includes(busqueda);

      const matchesArea = selectedArea
        ? instructor.area === selectedArea
        : true;

      return matchesSearch && matchesArea;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "nombres") {
        compareValue = a.nombres.localeCompare(b.nombres);
      } else if (sortBy === "area") {
        compareValue = (a.area || "").localeCompare(b.area || "");
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  // Obtener opciones únicas para los filtros
  const uniqueAreas = [...new Set(instructores.map((i) => i.area).filter(Boolean))];

  if (loading) return <div className="loading-message">Cargando instructores...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-instructores-container">
      <div className="gestion-instructores-header">
        <h2>Lista de Instructores</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o número de docente"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-instructores"
        />
      </div>

      <div className="filters-sort-container">
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las Áreas</option>
          {uniqueAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="nombres">Ordenar por Nombre</option>
          <option value="area">Ordenar por Área</option>
        </select>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="sort-order-button"
        >
          {sortOrder === "asc" ? "Ascendente" : "Descendente"}
        </button>

        <button
          onClick={() => navigate("/agregarInstructor")}
          className="add-button"
        >
          Agregar Instructor
        </button>
      </div>

      {filteredAndSortedInstructores.length === 0 ? (
        <p className="no-instructores">No hay instructores registrados que coincidan con los criterios.</p>
      ) : (
        <div className="instructores-grid">
          {filteredAndSortedInstructores.map((instructor) => (
            <div
              key={instructor.idInstructor}
              className="instructor-card"
              onClick={() => navigate(`/instructores/${instructor.idInstructor}`)} // Asumiendo una ruta de detalle
            >
              <div className="card-content">
                <div className="instructor-name-status">
                  <h3 className="instructor-name">
                    {instructor.nombres} {instructor.apellidos}
                  </h3>
                  {/*  indicador de estado si los instructores tienen un estado (activo/inactivo) */}
                  {/* <span className={`status-indicator ${instructor.estado === 'activo' ? 'active' : 'inactive'}`}></span> */}
                </div>
                <p className="instructor-area">
                  <span className="detail-label">Área:</span> {instructor.area || "Sin área asignada"}</p>
                <div className="instructor-details-row">
                  <span className="detail-label">Número Docente:</span>
                  <span className="detail-value">{instructor.numeroDocente ?? "No disponible"}</span>
                </div>
              </div>
              {/* <div className="card-actions">
                <button className="action-button" title="Ver Perfil">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="action-button" title="Editar">
                  <i className="fas fa-edit"></i>
                </button>
                
                 <button className="action-button delete-button" title="Eliminar Instructor" onClick={(e) => { e.stopPropagation(); handleDelete(instructor.idInstructor); }}><i className="fas fa-trash"></i></button> 
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionInstructores;


