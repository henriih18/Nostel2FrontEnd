import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AgregarPlanMejoramiento from "./AgregarPlanMejoramiento";
//import EditarPlanMejoramiento from "./EditarPlanMejoramiento";

import logoSena from "../../../../assets/images/logoSena.png";
import html2pdf from "html2pdf.js";

const PlanesMejoramiento = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planEditar, setPlanEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planAEliminar, setPlanAEliminar] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState({
    type: "",
    message: "",
  });
  const [instructor, setInstructor] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // referencia para impresión/descarga del acta
  const actaRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDetailsModal(false);
        setShowEditModal(false);
      }
    };
    if (showDetailsModal || showEditModal) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showDetailsModal, showEditModal]);

  // 1) cargar lista de planes
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
          navigate("/login");
          return;
        }
        const resp = await axios.get(
          `http://localhost:8080/api/planMejoramientos/${idAprendiz}`, // <-- endpoint distinto
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlanes(resp.data);
      } catch (err) {
        console.error("Error al cargar planes:", err);
        setError("Error al cargar los planes de mejoramiento.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, [idAprendiz, navigate]);

  // 2) datos del instructor (igual que en Actividades)
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");
        if (!token || !idUsuario) return;
        const resp = await axios.get(
          `http://localhost:8080/api/instructores/usuario/${idUsuario}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInstructor(resp.data);
      } catch (err) {
        console.error("Error al obtener instructor:", err);
      }
    };
    fetchInstructor();
  }, []);

  const esAutor = (plan) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    return (
      idUsuario && instructor && plan.idInstructor === instructor.idInstructor
    );
  };

  // 3) crear
  const handleAgregarPlan = () => {
    navigate(`/agregar-plan/${idAprendiz}`); // <-- ruta React Router distinta
  };

  // 4) editar
  const handleEditarPlan = (plan) => {
    setPlanEditar(plan);
    setShowEditModal(true);
  };

  const handlePlanActualizado = (updated) => {
    setPlanes((prev) =>
      prev.map((p) =>
        p.idPlanMejoramiento === updated.idPlanMejoramiento ? updated : p
      )
    );
    setShowEditModal(false);
    setPlanEditar(null);
  };

  // 5) eliminar
  const handleEliminarPlan = async (idPlan) => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.delete(
        `http://localhost:8080/api/planMejoramiento/${idAprendiz}/${idPlan}`, // <-- endpoint distinto
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status >= 200 && res.status < 300) {
        setPlanes((prev) =>
          prev.filter((p) => p.idPlanMejoramiento !== idPlan)
        );
        setDeleteFeedback({ type: "success", message: "Plan eliminado." });
      } else {
        setDeleteFeedback({ type: "error", message: "No se pudo eliminar." });
      }
    } catch (err) {
      console.error("Error al eliminar plan:", err);
      setDeleteFeedback({
        type: "error",
        message: "Error al eliminar el plan de mejoramiento.",
      });
    }
  };

  // 6) imprimir acta
  const handlePrintActa = useReactToPrint({
    contentRef: actaRef,
    documentTitle: `ActaPlan_${selectedPlan?.idPlanMejoramiento || "default"}`,
    pageStyle: `
      @page { size: letter portrait; margin: 3cm 2.5cm; }
      @media print {
        body * { visibility: hidden; }
        .acta-imprimible, .acta-imprimible * { visibility: visible; }
        .acta-imprimible {
          position: absolute; top:0; left:0; right:0; bottom:0;
          box-sizing: border-box;
        }
        .logoActaCell img {
          max-height: 15mm; display:block; margin:0 auto;
        }
        .acta-tabla {
          width:100%; border-collapse:collapse; table-layout:fixed;
          margin-top: 20mm; /* espacio para logo */
        }
        .acta-tabla th, .acta-tabla td {
          border:1px solid #000; padding:8px; vertical-align:top;
        }
        .containerFooterActa {
          position: fixed; bottom:0; left:50%; transform:translateX(-50%);
          font-family: Calibri,sans-serif; font-size:12pt; text-align:center;
        }
      }
    `,
    onAfterPrint: () => console.log("Impresión completada."),
  });

  // al hacer clic en fila abrimos modal detalle
  const handleRowClick = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Planes de Mejoramiento</h3>
        <button className="add-button" onClick={handleAgregarPlan}>
          + Agregar Plan de Mejoramiento
        </button>
      </div>

      {/* <div className="card-body">
        {loading ? (
          <p>Cargando planes…</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : planes.length === 0 ? (
          <p>No hay planes de mejoramiento.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Comité / Plan</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr
                  key={plan.idPlanMejoramiento}
                  onClick={() => handleRowClick(plan)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{plan.nombreComite}</td>
                  <td>{new Date(plan.fecha).toLocaleDateString()}</td>
                  <td>{plan.estado}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {esAutor(plan) && (
                      <>
                        <button
                          className="btn-editar"
                          onClick={() => handleEditarPlan(plan)}
                        >
                          ✎
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => setPlanAEliminar(plan)}
                        >
                          ✖
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div> */}
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
        <div className="actividades-grid">
          {planes.map((plan) => (
            <div
              key={plan.idPlanMejoramiento}
              className="actividad-card"
              onClick={() => handleRowClick(plan)}
            >
              <h4>{plan.nombreComite || "Sin comité"}</h4>
              <p>
                <span>Fecha:</span> {formatDate(plan.fecha)}
              </p>
              <p>
                <span>Estado:</span> {plan.estado}
              </p>
              {esAutor(plan) && (
                <div
                  className="actividad-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-editar"
                    onClick={() => handleEditarPlan(plan)}
                  >
                    <span className="icon-edit">✎</span> Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => setPlanAEliminar(plan)}
                  >
                    ✖ Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Modal editar */}
      {showEditModal && planEditar && (
        <EditarPlanMejoramiento
          plan={planEditar}
          onClose={() => setShowEditModal(false)}
          onUpdated={handlePlanActualizado}
        />
      )}

      {/* Confirmar eliminación */}
      {planAEliminar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setPlanAEliminar(null);
            setDeleteFeedback({ type: "", message: "" });
          }}
        >
          <div
            className="modal-container-delete"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>¿Eliminar plan de mejoramiento?</h3>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer.</p>
              {deleteFeedback.message && (
                <p
                  className={
                    deleteFeedback.type === "error" ? "error" : "success"
                  }
                >
                  {deleteFeedback.message}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setPlanAEliminar(null);
                  setDeleteFeedback({ type: "", message: "" });
                }}
              >
                No
              </button>
              <button
                className="submit-button"
                onClick={() =>
                  handleEliminarPlan(planAEliminar.idPlanMejoramiento)
                }
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle / acta */}
      {showDetailsModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Acta Plan #{selectedPlan.idPlanMejoramiento}</h2>
            </div>
            <div className="modal-body">
              <div ref={actaRef} className="acta-imprimible">
                <table className="acta-tabla">
                  <thead>
                    <tr>
                      <th colSpan="5" className="logoActaCell">
                        <img src={logoSena} alt="SENA" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="titulo-principal">
                        ACTA No. {selectedPlan.actaNumber}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="fila-celda">
                        <strong>COMITÉ:</strong> {selectedPlan.nombreComite}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="fila-celda">
                        <strong>CIUDAD Y FECHA:</strong> {selectedPlan.ciudad},{" "}
                        {new Date(selectedPlan.fecha).toLocaleDateString()}
                      </td>
                      <td></td>
                      <td className="fila-celda">
                        <strong>INICIO:</strong> {selectedPlan.horaInicio}
                      </td>
                      <td className="fila-celda">
                        <strong>FIN:</strong> {selectedPlan.horaFin}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="fila-celda">
                        <strong>OBJETIVOS:</strong>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: selectedPlan.objetivos,
                          }}
                        />
                      </td>
                    </tr>
                    {/* … resto de filas: desarrollo, conclusiones, compromisos, asistentes … */}
                  </tbody>
                </table>
                <div className="containerFooterActa">GOR-F-084 V02</div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => setShowDetailsModal(false)}
              >
                Cerrar
              </button>
              <button className="submit-button" onClick={handlePrintActa}>
                Imprimir Acta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesMejoramiento;
