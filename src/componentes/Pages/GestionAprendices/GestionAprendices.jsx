import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GestionAprendices.css";
import { toast } from "react-toastify";

export const GestionAprendices = () => {
  const [aprendices, setAprendices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState(null);
  const [fichas, setFichas] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // Filtros y orden
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedFicha, setSelectedFicha] = useState("");
  const [selectedAmbiente, setSelectedAmbiente] = useState("");
  const [estadoFichaFilter, setEstadoFichaFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("nombres");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAprendices();
    fetchFichas();
  }, []);

  const fetchAprendices = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.get(`${API_URL}/aprendices`, config);
      setAprendices(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error al cargar los aprendices")
      /* console.error("Error al obtener aprendices:", error); */
      /* setError("Error al cargar los aprendices."); */
      setLoading(false);
    }
  };

  const fetchFichas = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(`${API_URL}/fichas`, config);
      setFichas(response.data);
    } catch (error) {
      toast.error("Error al obtener fichas")
      /* console.error("Error al obtener fichas:", error); */
    }
  };

  const isFichaActiva = (numeroFicha) => {
    const ficha = fichas.find((f) => f.numeroFicha === numeroFicha);
    if (!ficha || !ficha.fechaInicio || !ficha.fechaFin) return false;

    const hoy = new Date();
    const inicio = new Date(ficha.fechaInicio);
    const fin = new Date(ficha.fechaFin);

    return hoy >= inicio && hoy <= fin;
  };

  const filteredAndSortedAprendices = aprendices
    .filter((aprendiz) => {
      const matchesSearch =
        `${aprendiz.nombres} ${aprendiz.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        aprendiz.documento?.toString().includes(busqueda);

      const matchesProgram = selectedProgram ? aprendiz.nombrePrograma === selectedProgram : true;
      const matchesFicha = selectedFicha ? aprendiz.numeroFicha === selectedFicha : true;
      const matchesAmbiente = selectedAmbiente ? aprendiz.numeroAmbiente === selectedAmbiente : true;

      const estadoFicha = isFichaActiva(aprendiz.numeroFicha) ? "activo" : "inactivo";
      const matchesEstado =
        estadoFichaFilter === "todos" || estadoFicha === estadoFichaFilter;

      return matchesSearch && matchesProgram && matchesFicha && matchesAmbiente && matchesEstado;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "nombres") {
        compareValue = a.nombres.localeCompare(b.nombres);
      } else if (sortBy === "nombrePrograma") {
        compareValue = a.nombrePrograma.localeCompare(b.nombrePrograma);
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const uniquePrograms = [...new Set(aprendices.map((a) => a.nombrePrograma))];
  const uniqueFichas = [...new Set(aprendices.map((a) => a.numeroFicha))];
  const uniqueAmbientes = [...new Set(aprendices.map((a) => a.numeroAmbiente))];

  if (loading) return <div className="loading-message">Cargando...</div>;
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

      <div className="filters-sort-container">
        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="filter-select">
          <option value="">Todos los Programas</option>
          {uniquePrograms.map((program) => (
            <option key={program} value={program}>{program}</option>
          ))}
        </select>

        <select value={selectedFicha} onChange={(e) => setSelectedFicha(e.target.value)} className="filter-select">
          <option value="">Todas las Fichas</option>
          {uniqueFichas.map((ficha) => (
            <option key={ficha} value={ficha}>{ficha}</option>
          ))}
        </select>

        <select value={selectedAmbiente} onChange={(e) => setSelectedAmbiente(e.target.value)} className="filter-select">
          <option value="">Todos los Ambientes</option>
          {uniqueAmbientes.map((ambiente) => (
            <option key={ambiente} value={ambiente}>{ambiente}</option>
          ))}
        </select>

        <select value={estadoFichaFilter} onChange={(e) => setEstadoFichaFilter(e.target.value)} className="filter-select">
          <option value="todos">Todos los Estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        

        <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="sort-order-button">
          {sortOrder === "asc" ? "Ascendente" : "Descendente"}
        </button>
      </div>

      {filteredAndSortedAprendices.length === 0 ? (
        <p className="no-aprendices">No hay aprendices registrados que coincidan con los criterios.</p>
      ) : (
        <div className="aprendices-grid">
          {filteredAndSortedAprendices.map((aprendiz) => {
            const estaActivo = isFichaActiva(aprendiz.numeroFicha);
            return (
              <div
                key={aprendiz.idAprendiz}
                className="aprendiz-card"
                onClick={() => navigate(`/aprendices/${aprendiz.idAprendiz}`)}
              >
                <div className="card-content">
                  <div className="aprendiz-name-status">
                    <h3 className="aprendiz-name">
                      {aprendiz.nombres} {aprendiz.apellidos}
                    </h3>
                    <span className={`status-indicator ${estaActivo ? "active" : "inactive"}`}></span>
                  </div>
                  <div className="container-info">
                    <div className="info-module primary-info">
                      <p className="aprendiz-program">
                        <span className="detail-label">Programa:</span>
                        <span className="detail-value ajust">{aprendiz.nombrePrograma}</span>
                      </p>
                      <div className="aprendiz-details-row">
                        <span className="detail-label">Ficha:</span>
                        <span className="detail-value">{aprendiz.numeroFicha}</span>
                      </div>
                      <div className="aprendiz-details-row">
                        <span className="detail-label">Ambiente:</span>
                        <span className="detail-value">{aprendiz.numeroAmbiente}</span>
                      </div>
                    </div>
                    <div className="info-module secondary-info">
                      <div className="aprendiz-details-row">
                        <span className="detail-label">Actividades:</span>
                        <span className="detail-value">{aprendiz.totalActividades}</span>
                      </div>
                      <div className="aprendiz-details-row">
                        <span className="detail-label">Planes:</span>
                        <span className="detail-value">{aprendiz.totalPlanes}</span>
                      </div>
                      <div className="aprendiz-details-row">
                        <span className="detail-label">Comentarios:</span>
                        <span className="detail-value">{aprendiz.totalComentarios}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GestionAprendices;
