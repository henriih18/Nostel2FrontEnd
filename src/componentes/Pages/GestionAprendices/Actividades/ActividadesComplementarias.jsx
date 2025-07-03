import React, { useEffect, useState, useRef } from "react"; // Corregimos la importación de useRef
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AgregarActividadComplementaria from "./AgregarActividadComplementaria";
import EditarActividadComplementaria from "./EditarActividadComplementaria";
import "./actividadComplementaria.css";
import logoSena from "../../../../assets/images/logoSena.png";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";

const ActividadesComplementarias = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);

  const [showDeleteFeedback, setShowDeleteFeedback] = useState(false); // Controla la visibilidad del mensaje
  const [instructor, setInstructor] = useState(null);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("actividades"); // Nuevo estado para controlar la sección

  const API_URL = import.meta.env.VITE_API_URL;

  // Inicializamos las referencias con useRef
  const actaRef = useRef();
  const registroRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setCurrentSection("actividades"); // Resetear la sección al cerrar
      }
    };
    if (showDetailsModal || showEditModal) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDetailsModal, showEditModal]);

  useEffect(() => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido.");
      setLoading(false);
      return;
    }

    const fetchActividades = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");

        if (!token) {
          setError("No hay token de autenticación");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${API_URL}/actividadComplementarias/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setActividades(response.data);
        setError(null);
      } catch (err) {
        /* console.error("Error al cargar actividades:", err); */
        /* setError("Error al cargar las actividades complementarias."); */
        toast.error("Error al cargar las actividades complementarias")
      } finally {
        setLoading(false);
      }
    };

    fetchActividades();
  }, [idAprendiz, navigate]);

  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");

        if (!token || !idUsuario) {
          /* console.log("No se encontró token o idUsuario en sessionStorage"); */
          return;
        }

        const response = await axios.get(
          `${API_URL}/instructores/usuario/${idUsuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setInstructor(response.data);
      } catch (err) {
        /* console.error("Error al obtener datos del instructor:", err); */
      }
    };

    obtenerDatosInstructor();
  }, []);

  const handleAgregarActividad = () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      toast.error("ID de aprendiz invalido. No se puede agregar actividad")
      /* setError("ID de aprendiz inválido. No se puede agregar actividad."); */
      return;
    }
    navigate(`/agregar-actividad/${idAprendiz}`);
  };


const handleActividadActualizada = (actividadActualizada) => {
  try {
    if (!actividadActualizada?.idActividad) {
      toast.error("ID de actividad inválido. No se pudo actualizar.");
      return;
    }

    setActividades((prevActividades) =>
      prevActividades.map((a) =>
        a.idActividad === actividadActualizada.idActividad
          ? actividadActualizada
          : a
      )
    );
    setShowEditModal(false);
    setActividadEditar(null);
    toast.success("Actividad complementaria actualizada con éxito.");
  } catch (err) {
    toast.error("Error al actualizar la actividad.");
  }
};


  const handleEditarActividad = (actividad) => {
    setActividadEditar(actividad);
    setShowEditModal(true);
  };

  const handleEliminarActividad = async (idActividad) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sin token de autenticación");
      setActividadAEliminar(null);

      const res = await axios.delete(
        `${API_URL}/actividadComplementarias/${idAprendiz}/${idActividad}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status >= 200 && res.status < 300) {
        setActividades((prev) =>
          prev.filter((a) => a.idActividad !== idActividad)
        );
        /* setDeleteFeedback({ type: "success", message: "Eliminado con éxito." }); */
        toast.success("Actividad eliminada con exito.");
      } else {
        toast.error("No se pudo eliminar la actividad.");
      }
    } catch (err) {
      toast.error("Error al eliminar la actividad.");
    }
  };

  const esAutor = (actividad) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    if (!idUsuario || !instructor || !instructor.idInstructor) return false;
    return actividad.idInstructor === instructor.idInstructor;
  };

  const handlePrintActa = useReactToPrint({
    contentRef: actaRef,
    documentTitle: `Acta_${selectedActividad?.idActividad || "default"}`,
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
        top:    0;    
        left:   0;    
        right:  0;    
        bottom: 0;    
        box-sizing: border-box;
        padding-top:    0mm;  /* altura del logo + pequeño hueco */
        padding-bottom: 0mm;
        }

        .acta-tabla {
        margin-top: 0;
        
      }

       .containerFooterActa {
    position: fixed;
    bottom: 0;            /* justo al límite del área imprimible */
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

  const handlePrintRegistro = useReactToPrint({
    contentRef: registroRef,
    documentTitle: `Registro_Asistencia_${
      selectedActividad?.idActividad || "default"
    }`,
    pageStyle: `
      @page {
        size: letter landscape;
        margin: 3cm 2.5cm 2.5cm 2.5cm;
      }
      @media print {
        body, body * {
          visibility: hidden;
          margin: 0;
          padding: 0;
        }
        .registro-imprimible, .registro-imprimible * {
          visibility: visible;
        }
        .registro-imprimible {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          box-sizing: border-box;
        }
        .logoRegistroContainer {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          max-height: 15mm;
        }
        .registro-full-table {
          margin-top: 20mm;
        }
        .containerFooter {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8pt;
        }
      }
    `,
    onAfterPrint: () => console.log("Impresión del registro completada."),
  });

  const handleRowClick = (actividad) => {
    setSelectedActividad(actividad);
    setShowDetailsModal(true);
    setCurrentSection("actividades"); // Resetear a la sección inicial al abrir
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  const formatFechaModal = (fecha) => {
    const date = new Date(fecha);
    return {
      dia: date.getDate(),
      mes: date.toLocaleString("default", { month: "long" }),
      anio: date.getFullYear(),
    };
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "Pendiente":
        return <span className="estado pendiente">Pendiente</span>;
      case "Entregado":
        return <span className="estado completada">Entregado</span>;
      case "Calificado":
        return <span className="estado vencida">Calificado</span>;
      default:
        return <span className="estado">{estado}</span>;
    }
  };

  const getInstructorNombre = (actividad) => {
    if (!actividad.asistentes || actividad.asistentes.length === 0)
      return "No asignado";
    const instructorAsistente = actividad.asistentes.find(
      (asistente) => asistente.idInstructor === actividad.idInstructor
    );
    return instructorAsistente ? instructorAsistente.nombre : "No asignado";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Actividades Complementarias</h3>
        {idAprendiz && (
          <button className="add-button" onClick={handleAgregarActividad}>
            <span className="icon-plus">+</span> Agregar Actividad
            Complementaria
          </button>
        )}
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading-state">
            <p>Cargando actividades...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : actividades.length === 0 ? (
          <div className="empty-state">
            <p>No hay actividades complementarias asignadas.</p>
          </div>
        ) : (
          <div className="actividades-grid">
            {actividades.map((actividad) => (
              <div
                key={actividad.idActividad}
                className="actividad-card"
                onClick={() => handleRowClick(actividad)}
              >
                <h4>
                  {actividad.compromisos && actividad.compromisos.length > 0
                    ? actividad.compromisos
                        .map((compromiso) => compromiso.actividadDecision)
                        .join(", ")
                    : "Sin actividad"}
                </h4>
                <p>
                  <span>Fecha Asignación:</span> {formatDate(actividad.fecha)}
                </p>
                <p>
                  <span>Fecha Entrega:</span>{" "}
                  {actividad.compromisos && actividad.compromisos.length > 0
                    ? formatDate(actividad.compromisos[0].fecha)
                    : "No definida"}
                </p>
                <p>
                  <span>Estado:</span> {getEstadoLabel(actividad.estado)}
                </p>
                <p>
                  <span>Instructor:</span> {getInstructorNombre(actividad)}
                </p>
                {esAutor(actividad) && (
                  <div
                    className="actividad-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn-editar"
                      onClick={() => handleEditarActividad(actividad)}
                    >
                      <span className="icon-edit">✎</span> Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => setActividadAEliminar(actividad)}
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

      {showEditModal && actividadEditar && (
        <EditarActividadComplementaria
          actividad={actividadEditar}
          onActividadActualizada={handleActividadActualizada}
          onClose={() => {
            setShowEditModal(false);
            setActividadEditar(null);
          }}
        />
      )}

      {actividadAEliminar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setActividadAEliminar(null);
            if (showDeleteFeedback) setShowDeleteFeedback(false); // Cerrar feedback si está visible
          }}
        >
          <div
            className="modal-container-delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>¿Eliminar actividad?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer.</p>
              {/* {showDeleteFeedback && deleteFeedback.message && (
                <div
                  className={
                    deleteFeedback.type === "error"
                      ? "error-message"
                      : "success-message"
                  }
                >
                  {deleteFeedback.message}
                </div>
              )} */}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setActividadAEliminar(null);
                  if (showDeleteFeedback) setShowDeleteFeedback(false);
                  setDeleteFeedback({ type: "", message: "" });
                }}
                disabled={showDeleteFeedback}
              >
                No
              </button>
              <button
                className="submit-button"
                onClick={() =>
                  handleEliminarActividad(actividadAEliminar.idActividad)
                }
                disabled={showDeleteFeedback}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedActividad && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentSection("actividades"); // Resetear al cerrar
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Actividad #{selectedActividad.idActividad}</h2>
            </div>
            <div className="modal-body">
              {/* Sección de Actividades Complementarias */}
              {currentSection === "actividades" && (
                <div
                  ref={actaRef}
                  className={`acta-imprimible ${
                    currentSection === "actividades"
                      ? "slide-in-left"
                      : "slide-out-right"
                  }`}
                >
                  <table className="acta-tabla">
                    <thead>
                      <div colSpan="5" className="logoActaCell">
                        <img
                          src={logoSena}
                          alt="Logo SENA"
                          className="registro-logo"
                        />
                      </div>
                    </thead>

                    <tbody>
                      <tr>
                        <td colSpan="5" className="titulo-principal">
                          ACTA No. {selectedActividad.actaNumber || ""}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>NOMBRE DEL COMITÉ O DE LA REUNIÓN:</strong>{" "}
                          {selectedActividad.nombreComite || ""}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="fila-celda">
                          <strong>CIUDAD Y FECHA:</strong>{" "}
                          {selectedActividad.ciudad || ""},{" "}
                          {formatDate(selectedActividad.fecha)}
                        </td>
                        <td className="fila-celda"></td>
                        <td className="fila-celda">
                          <strong>HORA INICIO:</strong>{" "}
                          {selectedActividad.horaInicio || ""}
                        </td>
                        <td className="fila-celda">
                          <strong>HORA FIN:</strong>{" "}
                          {selectedActividad.horaFin || ""}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="fila-celda">
                          <strong>LUGAR Y/O ENLACE:</strong>{" "}
                          {selectedActividad.lugarEnlace || ""}
                        </td>
                        <td className="fila-celda"></td>
                        <td colSpan="2" className="fila-celda">
                          <strong>DIRECCIÓN / REGIONAL / CENTRO:</strong>{" "}
                          {selectedActividad.direccionRegionalCentro || ""}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>AGENDA O PUNTOS PARA DESARROLLAR:</strong>
                          <br />
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.agenda,
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>OBJETIVO(S) DE LA REUNIÓN:</strong>
                          <br />
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.objetivos,
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>DESARROLLO DE LA REUNIÓN</strong>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.desarrollo,
                            }}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>CONCLUSIONES</strong>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.conclusiones,
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>
                            ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <th colSpan="2">ACTIVIDAD / DECISIÓN</th>
                        <th>FECHA</th>
                        <th>RESPONSABLE</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                      {(selectedActividad.compromisos?.length > 0
                        ? selectedActividad.compromisos
                        : Array(3).fill({})
                      ).map((comp, index) => (
                        <tr key={index}>
                          <td colSpan="2">{comp.actividadDecision || ""}</td>
                          <td>{formatDate(comp.fecha) || ""}</td>
                          <td>{comp.responsable || ""}</td>
                          <td>{comp.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                    </tbody>
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
                      {(selectedActividad.asistentes?.length > 0
                        ? selectedActividad.asistentes
                        : Array(3).fill({})
                      ).map((asist, index) => (
                        <tr key={index}>
                          <td>{asist.nombre || ""}</td>
                          <td>{asist.dependenciaEmpresa || ""}</td>
                          <td>{asist.aprueba || ""}</td>
                          <td>{asist.observacion || ""}</td>
                          <td>{asist.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                      <tr className="acta-legal-text">
                        <td colSpan="5">
                          De acuerdo con la Ley 1581 de 2012, Protección de
                          Datos Personales, el Servicio Nacional de Aprendizaje
                          SENA se compromete a garantizar la seguridad y
                          protección de los datos personales que se encuentran
                          almacenados en este documento, y les dará el
                          tratamiento correspondiente en cumplimiento de lo
                          establecido legalmente.
                        </td>
                      </tr>
                    </tbody>
                    {/* <tfoot>
                      
                      <tr>
                        <td colSpan="5" className="containerFooterActa">
                          <p>GOR-F-084 V02</p>
                        </td>
                      </tr>
                    </tfoot> */}
                  </table>
                  <div className="containerFooterActa">GOR-F-084 V02</div>
                </div>
              )}

              {/* Sección de Registro de Asistencia */}
              {currentSection === "registro" && (
                <div
                  ref={registroRef}
                  className={`registro-imprimible ${
                    currentSection === "registro"
                      ? "slide-in-left"
                      : "slide-out-right"
                  }`}
                >
                  <div className="logoRegistroContainer">
                    <div className="registro-logo-cell">
                      <img
                        src={logoSena}
                        alt="Logo SENA"
                        className="registro-logo"
                      />
                    </div>
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
                          {formatFechaModal(selectedActividad.fecha).dia}
                          DEL MES DE{" "}
                          {formatFechaModal(selectedActividad.fecha).mes}
                          DEL AÑO{" "}
                          {formatFechaModal(selectedActividad.fecha).anio}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan="11" className="registro-objetivo-cell">
                          <strong>OBJETIVO(S):</strong> 
                          <span
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.objetivos,
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
                      {(selectedActividad.asistentes || []).map((asis, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{asis.nombre}</td>
                          <td>{asis.numeroDocumento}</td>
                          <td>{asis.planta ? "SI" : "NO"}</td>
                          <td>{asis.contratista ? "SI" : "NO"}</td>
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
                      De acuerdo con la Ley 1581 de 2012, Protección de Datos
                      Personales, el Servicio Nacional de Aprendizaje SENA se
                      compromete a garantizar la seguridad y protección de los
                      datos personales que se encuentran almacenados en este
                      documento, y les dará el tratamiento correspondiente en
                      cumplimiento de lo establecido legalmente.
                    </p>
                  </div>
                  <div className="containerFooter">
                    <div className="registro-version">
                      <p>GOR-F-085 V02</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navegación entre secciones */}
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

              {/* Botones específicos por sección */}
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
                  <>
                    <button className="submit-button" onClick={handlePrintActa}>
                      Imprimir Acta
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="submit-button"
                      onClick={handlePrintRegistro}
                    >
                      Imprimir Registro
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActividadesComplementarias;
