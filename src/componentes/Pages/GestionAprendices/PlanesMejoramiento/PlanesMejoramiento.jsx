// src/components/planes/PlanesMejoramiento.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

import AgregarPlanMejoramiento from "./AgregarPlanMejoramiento";
//import EditarPlanMejoramiento from "./EditarPlanMejoramiento";

// ——— Importa el mismo CSS que usa ActividadesComplementarias ———
//import "./actividadComplementaria.css";

import logoSena from "../../../../assets/images/logoSena.png";

const PlanesMejoramiento = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planEditar, setPlanEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planAEliminar, setPlanAEliminar] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState({ type: "", message: "" });
  const [instructor, setInstructor] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ——— ¡Usamos el MISMO currentSection que Actividades! ———
  // Dejar “actividades” para la primera pestaña (aunque aquí sea Acta de Plan).
  const [currentSection, setCurrentSection] = useState("actividades");

  // Referencias para impresión (idéntico a Actividades)
  const actaRef = useRef();
  const registroRef = useRef();

  // 0) Manejo de ESC para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setCurrentSection("actividades"); // igual que en Actividades
      }
    };
    if (showDetailsModal || showEditModal) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDetailsModal, showEditModal]);

  // 1) Cargar planes de mejoramiento
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
          `http://localhost:8080/api/planMejoramientos/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Planes recibidos:", resp.data);
        setPlanes(resp.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar planes:", err);
        setError("Error al cargar los planes de mejoramiento.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, [idAprendiz, navigate]);

  // 2) Obtener datos del instructor
  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");
        if (!token || !idUsuario) return;
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

  // 3) Verificar si el plan es del instructor actual
  const esAutor = (plan) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    if (!idUsuario || !instructor || !instructor.idInstructor) return false;
    return plan.idInstructor === instructor.idInstructor;
  };

  // 4) Ir a Crear Plan
  const handleAgregarPlan = () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido. No se puede agregar plan.");
      return;
    }
    navigate(`/agregar-plan/${idAprendiz}`);
  };

  // 5) Actualizar plan
  const handlePlanActualizado = (planActualizado) => {
    setPlanes((prev) =>
      prev.map((p) =>
        p.idPlanMejoramiento === planActualizado.idPlanMejoramiento
          ? planActualizado
          : p
      )
    );
    setShowEditModal(false);
    setPlanEditar(null);
  };

  // 6) Abrir modal de edición
  const handleEditarPlan = (plan) => {
    setPlanEditar(plan);
    setShowEditModal(true);
  };

  // 7) Eliminar plan
  const handleEliminarPlan = async (idPlan) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sin token de autenticación");
      const res = await axios.delete(
        `http://localhost:8080/api/planMejoramiento/${idAprendiz}/${idPlan}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status >= 200 && res.status < 300) {
        setPlanes((prev) => prev.filter((p) => p.idPlanMejoramiento !== idPlan));
        setTimeout(() => {
          setPlanAEliminar(null);
          setDeleteFeedback({
            type: "success",
            message: "Plan eliminado con éxito.",
          });
        }, 2000);
      } else {
        setTimeout(() => {
          setPlanAEliminar(null);
          setDeleteFeedback({
            type: "error",
            message: "No se pudo eliminar el plan.",
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Error al eliminar plan:", err);
      setDeleteFeedback({
        type: "error",
        message: "Error al eliminar el plan de mejoramiento.",
      });
    }
  };

  // 8) Imprimir “Acta” (idéntico a ActividadesComplementarias)
  const handlePrintActa = useReactToPrint({
    contentRef: actaRef,
    documentTitle: `ActaPlan_${selectedPlan?.idPlanMejoramiento || "default"}`,
    pageStyle: `
      @page {
        size: letter portrait;
        margin: 3cm 2.5cm 2.5cm 2.5cm;
      }
      @media print {
        body * {
          visibility: hidden;
        }
        .acta-imprimible, .acta-imprimible * {
          visibility: visible;
        }
        .acta-imprimible {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-sizing: border-box;
          padding-top: 0mm;
          padding-bottom: 0mm;
        }

        .acta-tabla {
          margin-top: 0;
        }

        .containerFooterActa {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          font-family: Calibri, sans-serif;
          font-size: 12pt;
          text-align: center;
          z-index: 999;
        }

        .acta-tabla tbody.block-group3 {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
      }
    `,
    onAfterPrint: () => console.log("Impresión del acta completada."),
  });

  // 9) Imprimir “Registro” (idéntico)
  const handlePrintRegistro = useReactToPrint({
    contentRef: registroRef,
    documentTitle: `Registro_Asistencia_${selectedPlan?.idPlanMejoramiento || "default"}`,
    pageStyle: `
      /* Márgenes oficiales */
      @page {
        size: letter landscape;
        margin: 3cm 2.5cm 2.5cm 2.5cm;
      }

      @media print {
        /* oculta todo menos el registro */
        body, body * {
          visibility: hidden;
          margin: 0;
          padding: 0;
        }
        .registro-imprimible, .registro-imprimible * {
          visibility: visible;
        }

        /* área imprimible = exactamente el interior de los márgenes */
        .registro-imprimible {
          position: absolute;
          top: 0;    /* justo 3 cm debajo del tope físico */
          left: 0;   /* justo 2.5 cm a la derecha del borde físico */
          right: 0;  /* deja 2.5 cm a la derecha */
          bottom: 0; /* deja 2.5 cm arriba del pie físico */
          box-sizing: border-box;
        }

        /* LOGO pegado al margen superior */
        .logoRegistroContainer {
          position: absolute;
          top: 0;    /* arranca al tope del área imprimible */
          left: 50%;
          transform: translateX(-50%);
          max-height: 15mm;
        }

        /* la tabla entra justo bajo el logo */
        .registro-full-table {
          margin-top: 20mm; /* = altura del logo */
        }

        /* FOOTER pegado al margen inferior */
        .containerFooter {
          position: absolute;
          bottom: 0;   /* al límite inferior del área imprimible */
          left: 50%;
          transform: translateX(-50%);
          font-size: 8pt;
        }
      }
    `,
    onAfterPrint: () => console.log("Impresión del registro completada."),
  });

  // 10) Al hacer clic en un “plan”, abrimos modal detalle
  const handleRowClick = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
    setCurrentSection("actividades"); // Igual que en Actividades
  };

  // Formatear fecha de ejemplo
  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  // Formatear fecha para cabecera “Registro”
  const formatFechaModal = (fecha) => {
    const date = new Date(fecha);
    return {
      dia: date.getDate(),
      mes: date.toLocaleString("default", { month: "long" }),
      anio: date.getFullYear(),
    };
  };

  return (
    <div className="card">
      {/* ===================== Cabecera ===================== */}
      <div className="card-header">
        <h3>Planes de Mejoramiento</h3>
        <button className="add-button" onClick={handleAgregarPlan}>
          <span className="icon-plus">+</span> Agregar Plan de Mejoramiento
        </button>
      </div>

      {/* ===================== Body ===================== */}
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

      {/* ===================== Modal Edición ===================== */}
      {showEditModal && planEditar && (
        <EditarPlanMejoramiento
          plan={planEditar}
          onClose={() => {
            setShowEditModal(false);
            setPlanEditar(null);
          }}
          onUpdated={handlePlanActualizado}
        />
      )}

      {/* ===================== Confirmar Eliminación ===================== */}
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
            <div className="modal-header">
              <h3>¿Eliminar plan de mejoramiento?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer.</p>
              {deleteFeedback.message && (
                <div
                  className={
                    deleteFeedback.type === "error"
                      ? "error-message"
                      : "success-message"
                  }
                >
                  {deleteFeedback.message}
                </div>
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

      {/* ===================== Modal Detalle / Acta / Registro ===================== */}
      {showDetailsModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentSection("actividades"); // igual que en Actividades
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h2>Acta Plan #{selectedPlan.actaNumber}</h2>
            </div>

            {/* Body del modal */}
            <div className="modal-body">
              {/* —————— SECCIÓN "ACTIVIDADES" (equivale a Acta) —————— */}
              {currentSection === "actividades" && (
                <div
                  ref={actaRef}
                  className={`acta-imprimible ${
                    currentSection === "actividades" ? "slide-in-left" : "slide-out-right"
                  }`}
                >
                  <table className="acta-tabla">
                    <thead>
                      <tr>
                        <th colSpan="5" className="logoActaCell">
                          <img src={logoSena} alt="Logo SENA" className="registro-logo" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Fila Título */}
                      <tr>
                        <td colSpan="5" className="titulo-principal">
                          ACTA No. {selectedPlan.actaNumber}
                        </td>
                      </tr>

                      {/* Fila Comité */}
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>COMITÉ:</strong> {selectedPlan.nombreComite}
                        </td>
                      </tr>

                      {/* Fila Ciudad/Fecha - Inicio - Fin */}
                      <tr>
                        <td colSpan="2" className="fila-celda">
                          <strong>CIUDAD Y FECHA:</strong>{" "}
                          {selectedPlan.ciudad},{" "}
                          {new Date(selectedPlan.fecha).toLocaleDateString("es-ES")}
                        </td>
                        <td className="fila-celda"></td>
                        <td className="fila-celda">
                          <strong>INICIO:</strong> {selectedPlan.horaInicio}
                        </td>
                        <td className="fila-celda">
                          <strong>FIN:</strong> {selectedPlan.horaFin}
                        </td>
                      </tr>

                      {/* Fila Lugar/Enlace - Dirección/Regional/Centro */}
                      {(
                        selectedPlan.lugarEnlace ||
                        selectedPlan.direccionRegionalCentro
                      ) && (
                        <tr>
                          <td colSpan="2" className="fila-celda">
                            <strong>LUGAR Y/O ENLACE:</strong>{" "}
                            {selectedPlan.lugarEnlace || ""}
                          </td>
                          <td className="fila-celda"></td>
                          <td colSpan="2" className="fila-celda">
                            <strong>DIRECCIÓN / REGIONAL / CENTRO:</strong>{" "}
                            {selectedPlan.direccionRegionalCentro || ""}
                          </td>
                        </tr>
                      )}

                      {/* Fila Objetivos */}
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>OBJETIVOS:</strong>
                          <br />
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedPlan.objetivos,
                            }}
                          />
                        </td>
                      </tr>

                      

                      {/* Desarrollo de la reunión (si existe) */}
                      {selectedPlan.desarrollo && (
                        <>
                          <tr>
                            <td colSpan="5" className="seccion-central">
                              <strong>DESARROLLO DE LA REUNIÓN</strong>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" className="fila-celda">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selectedPlan.desarrollo,
                                }}
                              />
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Conclusiones (si existen) */}
                      {selectedPlan.conclusiones && (
                        <>
                          <tr>
                            <td colSpan="5" className="seccion-central">
                              <strong>CONCLUSIONES</strong>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" className="fila-celda">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selectedPlan.conclusiones,
                                }}
                              />
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>

                    {/* ——— ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS ——— */}
                    <tbody>
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</strong>
                        </td>
                      </tr>
                      <tr>
                        <th colSpan="2">ACTIVIDAD / DECISIÓN</th>
                        <th>FECHA</th>
                        <th>RESPONSABLE</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                      {(selectedPlan.compromisosPlan?.length > 0
                        ? selectedPlan.compromisosPlan
                        : Array(3).fill({})
                      ).map((comp, index) => (
                        <tr key={index}>
                          <td colSpan="2">{comp.planDecision || ""}</td>
                          <td>
                            {comp.fecha
                              ? new Date(comp.fecha).toLocaleDateString("es-ES")
                              : ""}
                          </td>
                          <td>{comp.responsable || ""}</td>
                          <td>{comp.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                    </tbody>

                    {/* ——— ASISTENTES Y APROBACIÓN DECISIONES ——— */}
                    <tbody className="block-group3">
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>ASISTENTES Y APROBACIÓN DECISIONES</strong>
                        </td>
                      </tr>
                      <tr>
                        <th>NOMBRE</th>
                        <th>DEPENDENCIA / EMPRESA</th>
                        <th>APRUEBA (SI/NO)</th>
                        <th>OBSERVACIÓN</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                      {(selectedPlan.asistentesPlan?.length > 0
                        ? selectedPlan.asistentesPlan
                        : Array(3).fill({})
                      ).map((asis, index) => (
                        <tr key={index}>
                          <td>{asis.nombre || ""}</td>
                          <td>{asis.dependenciaEmpresa || ""}</td>
                          <td>{asis.aprueba || ""}</td>
                          <td>{asis.observacion || ""}</td>
                          <td>{asis.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                      <tr className="acta-legal-text">
                        <td colSpan="5">
                          De acuerdo con la Ley 1581 de 2012, Protección de Datos
                          Personales, el Servicio Nacional de Aprendizaje SENA se
                          compromete a garantizar la seguridad y protección de los
                          datos personales que se encuentran almacenados en este
                          documento, y les dará el tratamiento correspondiente en
                          cumplimiento de lo establecido legalmente.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="containerFooterActa">GOR-F-084 V02</div>
                </div>
              )}

              {/* ——— SECCIÓN “REGISTRO” ——— */}
              {currentSection === "registro" && (
                <div
                  ref={registroRef}
                  className={`registro-imprimible ${
                    currentSection === "registro" ? "slide-in-left" : "slide-out-right"
                  }`}
                >
                  <div className="logoRegistroContainer">
                    <img
                      src={logoSena}
                      alt="Logo SENA"
                      className="registro-logo"
                    />
                  </div>
                  <table
                    className="registro-full-table"
                    border="1"
                    cellPadding="4"
                    cellSpacing="0"
                  >
                    <thead>
                      <tr>
                        <th colSpan="11" className="registro-title-cell">
                          REGISTRO DE ASISTENCIA / DÍA{" "}
                          {formatFechaModal(selectedPlan.fecha).dia} DEL MES DE{" "}
                          {formatFechaModal(selectedPlan.fecha).mes} DEL AÑO{" "}
                          {formatFechaModal(selectedPlan.fecha).anio}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan="11" className="registro-objetivo-cell">
                          <strong>OBJETIVO(S):</strong>&nbsp;
                          <span
                            dangerouslySetInnerHTML={{
                              __html: selectedPlan.objetivos,
                            }}
                          />
                        </th>
                      </tr>
                      <tr>
                        <th>N°</th>
                        <th>NOMBRES Y APELLIDOS</th>
                        <th>No. DOCUMENTO</th>
                        <th>PLANTA</th>
                        <th>CONTRATISTA</th>
                        <th>OTRO / ¿CUÁL?</th>
                        <th>DEPENDENCIA / EMPRESA</th>
                        <th>CORREO ELECTRÓNICO</th>
                        <th>TELÉFONO/EXT.</th>
                        <th>AUTORIZA GRABACIÓN</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedPlan.asistentesPlan || []).map((asis, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{asis.nombre}</td>
                          <td>{asis.numeroDocumento}</td>
                          <td>{asis.planta}</td>
                          <td>{asis.contratista}</td>
                          <td>{asis.otro}</td>
                          <td>{asis.dependenciaEmpresa}</td>
                          <td>{asis.correoElectronico}</td>
                          <td>{asis.telefonoExt}</td>
                          <td>{asis.autorizaGrabacion ? "SÍ" : "NO"}</td>
                          <td>{asis.firmaParticipacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="regisro-legal-text">
                    <p>
                      De acuerdo con la Ley 1581 de 2012, Protección de Datos Personales,
                      el Servicio Nacional de Aprendizaje SENA se compromete a garantizar
                      la seguridad y protección de los datos personales que se encuentran
                      almacenados en este documento, y les dará el tratamiento correspondiente
                      en cumplimiento de lo establecido legalmente.
                    </p>
                  </div>
                  <div className="containerFooter">
                    <div className="registro-version">
                      <p>GOR-F-085 V02</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ——— Botón para navegar entre secciones ——— */}
              <div className="modal-navigation">
                {currentSection === "actividades" ? (
                  <button
                    className="nav-button"
                    onClick={() => setCurrentSection("registro")}
                  >
                    → Registro de Asistencia
                  </button>
                ) : (
                  <button
                    className="nav-button"
                    onClick={() => setCurrentSection("actividades")}
                  >
                    ← Actividades Complementarias
                  </button>
                )}
              </div>
            </div>

            {/* ——— Foot del modal (Cerrar / Imprimir) ——— */}
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setCurrentSection("actividades");
                }}
              >
                Cerrar
              </button>
              {currentSection === "actividades" ? (
                <button className="submit-button" onClick={handlePrintActa}>
                  Imprimir Acta
                </button>
              ) : (
                <button className="submit-button" onClick={handlePrintRegistro}>
                  Imprimir Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesMejoramiento;
