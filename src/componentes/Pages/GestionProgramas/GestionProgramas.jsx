

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionProgramas.css";

export const GestionProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Nuevos estados para ordenamiento (los programas no tienen muchos campos para filtrar)
  const [sortBy, setSortBy] = useState("nombrePrograma"); // Default sort by name
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    obtenerProgramas();
  }, []);

  const obtenerProgramas = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.error("No hay token de autenticación");
        setError("Sesión no válida. Por favor inicie sesión nuevamente.");
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

      const respuesta = await axios.get(`${API_URL}/programas`, config);

      setProgramas(respuesta.data);
      setCargando(false);
    } catch (error) {
      console.error("Error al obtener programas:", error);

      if (error.response) {
        if (error.response.status === 403) {
          setError(
            "No tiene permisos para acceder a esta información. Este recurso está restringido."
          );
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else if (error.response.status === 401) {
          setError("Sesión no válida. Por favor inicie sesión nuevamente.");
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setError(
            `Error del servidor: ${error.response.status}. Por favor, inténtelo de nuevo más tarde.`
          );
        }
      } else if (error.request) {
        setError(
          "No se pudo conectar con el servidor. Verifique su conexión a internet."
        );
      } else {
        setError(`Error: ${error.message}`);
      }

      setCargando(false);
    }
  };

  // Lógica de filtrado y ordenamiento combinada
  const filteredAndSortedProgramas = programas
    .filter((programa) => {
      const matchesSearch = programa.nombrePrograma
        ?.toLowerCase()
        .includes(busqueda.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "nombrePrograma") {
        compareValue = a.nombrePrograma.localeCompare(b.nombrePrograma);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  if (cargando)
    return <div className="loading-message">Cargando programas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-programas-container">
      <div className="gestion-programas-header">
        <h2>Lista de Programas Formativos</h2>
        <input
          type="text"
          placeholder="Buscar por nombre de programa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador-programas"
        />
      </div>

      <div className="filters-sort-container">
        

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="sort-order-button"
        >
          {sortOrder === "asc" ? "Ascendente" : "Descendente"}
        </button>

        <button
          onClick={() => navigate("/agregar-programa")}
          className="add-button"
        >
          Agregar Nuevo Programa
        </button>
      </div>

      {filteredAndSortedProgramas.length === 0 ? (
        <p className="no-programas">
          No hay programas registrados que coincidan con los criterios.
        </p>
      ) : (
        <div className="programas-grid">
          {filteredAndSortedProgramas.map((programa) => (
            <div
              key={programa.idPrograma}
              className="programa-card"
              onClick={() => navigate(`/programas/${programa.idPrograma}`)} // Asumiendo una ruta de detalle
            >
              <div className="card-content">
                <div className="programa-header-info">
                  <h3 className="programa-nombre">{programa.nombrePrograma}</h3>
                  {/* indicador de estado si los programas tienen un estado (activo/inactivo) */}
                  {/* <span className={`status-indicator ${programa.estado === 'activo' ? 'active' : 'inactive'}`}></span> */}
                </div>
                {/* Puedes añadir más detalles del programa aquí si están disponibles en el objeto programa */}
                {/* <p className="programa-descripcion">{programa.descripcion}</p> */}
              </div>
              {/* <div className="card-actions">
                <button className="action-button" title="Ver Detalles">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="action-button" title="Editar Programa">
                  <i className="fas fa-edit"></i>
                </button>

                <button
                  className="action-button delete-button"
                  title="Eliminar Programa"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(programa.idPrograma);
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

export default GestionProgramas;
