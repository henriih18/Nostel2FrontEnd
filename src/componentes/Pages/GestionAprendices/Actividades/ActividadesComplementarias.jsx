import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AgregarActividadComplementaria from "./AgregarActividadComplementaria";
import EditarActividadComplementaria from "./EditarActividadComplementaria";
import "./actividadComplementaria.css";
import logoSena from "../../../../assets/images/logoSena.png";
import html2pdf from "html2pdf.js";

const ActividadesComplementarias = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState({
    type: "",
    message: "",
  });
  const [instructor, setInstructor] = useState(null);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("actividades"); // Nuevo estado para controlar la sección

  // Referencias específicas para cada sección
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
          `http://localhost:8080/actividadComplementarias/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Actividades recibidas:", response.data);
        setActividades(response.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar actividades:", err);
        setError("Error al cargar las actividades complementarias.");
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
          console.log("No se encontró token o idUsuario en sessionStorage");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/instructores/usuario/${idUsuario}`,
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

  const handleAgregarActividad = () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido. No se puede agregar actividad.");
      return;
    }
    navigate(`/agregar-actividad/${idAprendiz}`);
  };

  const handleActividadActualizada = (actividadActualizada) => {
    setActividades((prevActividades) =>
      prevActividades.map((a) =>
        a.idActividad === actividadActualizada.idActividad
          ? actividadActualizada
          : a
      )
    );
    setShowEditModal(false);
    setActividadEditar(null);
  };

  const handleEditarActividad = (actividad) => {
    setActividadEditar(actividad);
    setShowEditModal(true);
  };

  const handleEliminarActividad = async (idActividad) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sin token de autenticación");
      const res = await axios.delete(
        `http://localhost:8080/actividadComplementarias/${idAprendiz}/${idActividad}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status >= 200 && res.status < 300) {
        setActividades((prev) =>
          prev.filter((a) => a.idActividad !== idActividad)
        );
        /* setDeleteFeedback({ type: "success", message: "Eliminado con éxito." }); */
        setTimeout(() => {
          setActividadAEliminar(null);
          setDeleteFeedback({
            type: "success",
            message: "Actividad eliminada con éxito.",
          });
        }, 2000);
      } else {
        setTimeout(() => {
          setActividadAEliminar(null);
          setDeleteFeedback({
            type: "error",
            message: "No se pudo eliminar la actividad.",
          });
        }, 2000);
      }
    } catch (err) {
      setDeleteFeedback({
        type: "error",
        message: "Error al eliminar la actividad.",
      });
    }
  };

  const esAutor = (actividad) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    if (!idUsuario || !instructor || !instructor.idInstructor) return false;
    return actividad.idInstructor === instructor.idInstructor;
  };

  // Manejador de descarga para la sección de Acta
  /* const handleDownloadActa = () => {
    if (!actaRef.current) return;

    const opt = {
      margin: 25.4,
      filename: `Acta_${selectedActividad.idActividad}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(actaRef.current).save();
  }; */

  // Manejador de descarga para la sección de Registro
  /* const handleDownloadRegistro = () => {
    if (!registroRef.current) return;

    const opt = {
      margin: [30, 25, 25, 25],
      filename: `Registro_Asistencia_${selectedActividad.idActividad}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "letter",
        orientation: "landscape",
      },
    };

    html2pdf().set(opt).from(registroRef.current).save();
  }; */

  // Manejador de impresión para la sección de Acta
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
    /* Márgenes oficiales */
    @page {
      size: letter landscape;
      margin: 3cm 2.5cm 2.5cm 2.5cm;
      
    }

    @media print {
      /* oculta todo menos el registro */
      body, body * {
        visibility: hidden;
        margin: 0; padding: 0;
      }
      .registro-imprimible, .registro-imprimible * {
        visibility: visible;
      }

      /* área imprimible = exactamente el interior de los márgenes */
      .registro-imprimible {
        position: absolute;
        top:    0;    /* justo 3 cm debajo del tope físico */
        left:   0;    /* justo 2.5 cm a la derecha del borde físico */
        right:  0;    /* deja 2.5 cm a la derecha */
        bottom: 0;    /* deja 2.5 cm arriba del pie físico */
        box-sizing: border-box;
      }

      /* LOGO pegado al margen superior */
      .logoRegistroContainer {
        position: absolute;
        top:    0;    /* arranca al tope del área imprimible */
        left:   50%;
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
        bottom: 0;     /* al límite inferior del área imprimible */
        left:   50%;
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
          onClick={() => setActividadAEliminar(null)}
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
                  setActividadAEliminar(null);
                  setDeleteFeedback({ type: "", message: "" });
                }}
              >
                No
              </button>
              <button
                className="submit-button"
                onClick={() =>
                  handleEliminarActividad(actividadAEliminar.idActividad)
                  
                }
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
                      <tr>
                        <th colSpan="5" className="logoActaCell">
                          <img
                            src={logoSena}
                            alt="Logo SENA"
                            className="registro-logo"
                          />
                        </th>
                      </tr>
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
                      {/* LOGO */}

                      {/* TÍTULO */}
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
                      {/* OBJETIVOS */}
                      <tr>
                        <th colSpan="11" className="registro-objetivo-cell">
                          <strong>OBJETIVO(S):</strong>&nbsp;
                          <span
                            dangerouslySetInnerHTML={{
                              __html: selectedActividad.objetivos,
                            }}
                          />
                        </th>
                      </tr>
                      {/* CABECERAS DE COLUMNA */}
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
                      {/* FILAS DE DATOS */}
                      {(selectedActividad.asistentes || []).map((asis, i) => (
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
                    {/* <button
                      className="submit-button"
                      onClick={handleDownloadActa}
                    >
                      Descargar Acta
                    </button> */}
                    <button className="submit-button" onClick={handlePrintActa}>
                      Imprimir Acta
                    </button>
                  </>
                ) : (
                  <>
                    {/* <button
                      className="submit-button"
                      onClick={handleDownloadRegistro}
                    >
                      Descargar Registro
                    </button> */}
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
