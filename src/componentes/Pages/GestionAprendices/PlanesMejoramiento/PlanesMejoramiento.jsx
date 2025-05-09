import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AgregarPlanMejoramiento from "./AgregarPlanMejoramiento";
//import EditarPlanMejoramiento from "./EditarPlanMejoramiento";

const PlanesMejoramiento = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planEditar, setPlanEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido.");
      setLoading(false);
      return;
    }

    const fetchPlanes = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("No hay token de autenticación");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/planMejoramientos/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setPlanes(response.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar planes de mejoramiento:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          sessionStorage.removeItem("token");
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          navigate("/login");
        } else {
          setError("Error al cargar los planes de mejoramiento.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, [idAprendiz, navigate]);

  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");

        if (!token || !idUsuario) {
          console.log("No se encontró token o idUsuario en sessionStorage");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/instructores/usuario/${idUsuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setInstructor(response.data);
      } catch (err) {
        console.error("Error al obtener datos del instructor:", err);
      }
    };

    obtenerDatosInstructor();
  }, []);

  const handleAgregarPlan = () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido. No se puede agregar plan.");
      return;
    }
    navigate(`/agregar-plan/${idAprendiz}`);
  };

  const handlePlanActualizado = (planActualizado) => {
    setPlanes((prevPlanes) =>
      prevPlanes.map((p) =>
        p.idPlanMejoramiento === planActualizado.idPlanMejoramiento
          ? planActualizado
          : p
      )
    );
    setShowEditModal(false);
    setPlanEditar(null);
  };

  const handleEditarPlan = (plan) => {
    setPlanEditar(plan);
    setShowEditModal(true);
  };

  const handleConfirmDelete = (idPlan) => {
    setConfirmDelete(idPlan);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleEliminarPlan = async (idPlan) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación");
        navigate("/login");
        return;
      }

      await axios.delete(
        `http://localhost:8080/api/planesMejoramiento/${idAprendiz}/${idPlanMejoramiento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPlanes((prevPlanes) =>
        prevPlanes.filter((p) => p.idPlanMejoramiento !== idPlan)
      );
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error al eliminar plan:", err);
      setError("Error al eliminar el plan de mejoramiento.");
    }
  };

  const esAutor = (nombreInstructorPlan) => {
    if (!instructor) return false;

    const nombreCompleto =
      instructor.nombres && instructor.apellidos
        ? `${instructor.nombres} ${instructor.apellidos}`
        : instructor.nombreCompleto || instructor.nombres || "";

    if (!nombreInstructorPlan || !nombreCompleto) return false;

    return (
      nombreInstructorPlan.trim().toLowerCase() ===
      nombreCompleto.trim().toLowerCase()
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return <span className="estado pendiente">Pendiente</span>;
      case "COMPLETADO":
        return <span className="estado completada">Completado</span>;
      case "VENCIDO":
        return <span className="estado vencida">Vencido</span>;
      default:
        return <span className="estado">{estado}</span>;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Planes de Mejoramiento</h3>
        {idAprendiz && (
          <button className="add-button" onClick={handleAgregarPlan}>
            <span className="icon-plus">+</span> Agregar Plan de Mejoramiento
          </button>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading-state">
            <p>Cargando planes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : planes.length === 0 ? (
          <div className="empty-state">
            <p>No hay planes de mejoramiento asignados.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Instructor</th>
                  <th>Competencia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr key={plan.idPlanMejoramiento}>
                    <td>{plan.descripcion}</td>
                    <td>{formatDate(plan.fechaInicio)}</td>
                    <td>{formatDate(plan.fechaFin)}</td>
                    <td>{getEstadoLabel(plan.estado)}</td>
                    <td>
                      {plan.nombreCompleto || plan.nombreInstructor}
                    </td>
                    <td>{plan.competencia}</td>
                    <td>
                      {esAutor(
                        plan.nombreCompleto || plan.nombreInstructor
                      ) && (
                        <div>
                          <button
                            className="btn-editar"
                            onClick={() => handleEditarPlan(plan)}
                          >
                            <span className="icon-edit">✎</span> Editar
                          </button>

                          {confirmDelete === plan.idPlanMejoramiento ? (
                            <div className="confirm-delete">
                              <span>¿Confirmar?</span>
                              <button
                                className="btn-confirm"
                                onClick={() =>
                                  handleEliminarPlan(plan.idPlanMejoramiento)
                                }
                              >
                                Sí
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={handleCancelDelete}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-eliminar"
                              onClick={() =>
                                handleConfirmDelete(plan.idPlanMejoramiento)
                              }
                            >
                              <span className="icon-delete">✖</span> Eliminar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && planEditar && (
        <EditarPlanMejoramiento
          plan={planEditar}
          onPlanActualizado={handlePlanActualizado}
          onClose={() => {
            setShowEditModal(false);
            setPlanEditar(null);
          }}
        />
      )}
    </div>
  );
};

export default PlanesMejoramiento;