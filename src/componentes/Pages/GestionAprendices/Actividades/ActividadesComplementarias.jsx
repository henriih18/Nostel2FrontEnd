import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import AgregarActividadComplementaria from "./AgregarActividadComplementaria";
import EditarActividadComplementaria from "./EditarActividadComplementaria";
/* import { input } from "@azure/functions"; */

const ActividadesComplementarias = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actividadEditar, setActividadEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const componentRef = useRef();
  const [selectedActividad, setSelectedActividad] = useState(null); // Estado para la actividad seleccionada
  const [showDetailsModal, setShowDetailsModal] = useState(false); // Estado para el modal de detalles

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
          `http://localhost:8080/api/actividadComplementarias/${idAprendiz}`,
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

  const handleConfirmDelete = (idActividad) => {
    setConfirmDelete(idActividad);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleEliminarActividad = async (idActividad) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación");
        return;
      }

      await axios.delete(
        `http://localhost:8080/api/actividadComplementarias/${idAprendiz}/${idActividad}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setActividades((prevActividades) =>
        prevActividades.filter((a) => a.idActividad !== idActividad)
      );
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error al eliminar actividad:", err);
      alert("Error al eliminar la actividad complementaria.");
    }
  };

  const esAutor = (actividad) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    if (!idUsuario || !instructor || !instructor.idInstructor) return false;
    return actividad.idInstructor === instructor.idInstructor;
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Actividad_Complementaria_${
      selectedActividad?.idActividad || "default"
    }`,
    onAfterPrint: () => {
      console.log("Impresión completada.");
    },
    onPrintError: (error) => {
      console.error("Error al intentar imprimir:", error);
    },
  });

  const handleRowClick = (actividad) => {
    setSelectedActividad(actividad);
    setShowDetailsModal(true);
  };

  const handleConfirmPrint = () => {
    if (componentRef.current) {
      handlePrint();
    } else {
      console.error("El componente para imprimir no está disponible.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
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
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Actividad</th>
                  <th>Fecha Asignación</th>
                  <th>Fecha Entrega</th>
                  <th>Estado</th>
                  <th>Instructor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((actividad) => (
                  <tr
                    key={actividad.idActividad}
                    onClick={() => handleRowClick(actividad)} // Evento para abrir el modal al hacer clic en la fila
                    style={{ cursor: "pointer" }} // Hacer que la fila parezca clicable
                  >
                    <td>
                      {actividad.compromisos && actividad.compromisos.length > 0
                        ? actividad.compromisos
                            .map((compromiso) => compromiso.actividadDecision)
                            .join(", ")
                        : "Sin actividad"}
                    </td>
                    <td>{formatDate(actividad.fecha)}</td>
                    <td>
                      {actividad.compromisos && actividad.compromisos.length > 0
                        ? formatDate(actividad.compromisos[0].fecha)
                        : "No definida"}
                    </td>
                    <td>{getEstadoLabel(actividad.estado)}</td>
                    <td>{getInstructorNombre(actividad)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {" "}
                      {/* Evitar que el clic en los botones abra el modal */}
                      {esAutor(actividad) && (
                        <div>
                          <button
                            className="btn-editar"
                            onClick={() => handleEditarActividad(actividad)}
                          >
                            <span className="icon-edit">✎</span> Editar
                          </button>
                          {confirmDelete === actividad.idActividad ? (
                            <div className="confirm-delete">
                              <span>¿Confirmar?</span>
                              <button
                                className="btn-confirm"
                                onClick={() =>
                                  handleEliminarActividad(actividad.idActividad)
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
                                handleConfirmDelete(actividad.idActividad)
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

      {showDetailsModal && selectedActividad && (
        <div className="modal-overlay">
  <div className="modal-container">
    <div className="modal-header">
      <h2>Detalles de la Actividad #{selectedActividad.idActividad}</h2>
      <button className="close-button" onClick={() => setShowDetailsModal(false)}>×</button>
    </div>
    <div className="modal-body">
      <div ref={componentRef} className="acta-imprimible">
        <table className="acta-tabla" border="1">
          <tbody>
            <tr>
              <td colSpan="4" className="titulo-principal">ACTA No. {selectedActividad.actaNumber || ""}</td>
            </tr>
            <tr>
              <td colSpan="4" className="fila-celda">
                <strong>NOMBRE DEL COMITÉ O DE LA REUNIÓN:</strong> {selectedActividad.nombreComite || ""}
              </td>
            </tr>
            <tr>
              <td className="fila-celda">
                <strong>CIUDAD Y FECHA:</strong> {selectedActividad.ciudad || ""}, {formatDate(selectedActividad.fecha)}
              </td>
              <td className="fila-celda">
              </td>
              <td className="fila-celda">
                <strong>HORA INICIO:</strong> {selectedActividad.horaInicio || ""}
              </td>
              <td className="fila-celda">
                <strong>HORA FIN:</strong> {selectedActividad.horaFin || ""}
              </td>
            </tr>
            <tr>
              <td className="fila-celda">
                <strong>LUGAR Y/O ENLACE:</strong> {selectedActividad.lugarEnlace || ""}
              </td>
              <td className="fila-celda"></td>
              <td colSpan="2" className="fila-celda">
                <strong>DIRECCIÓN / REGIONAL / CENTRO:</strong> {selectedActividad.direccionRegionalCentro || ""}
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="fila-celda">
                <strong>AGENDA O PUNTOS PARA DESARROLLAR:</strong><br />
                <div dangerouslySetInnerHTML={{ __html: selectedActividad.agenda }} />
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="fila-celda">
                <strong>OBJETIVO(S) DE LA REUNIÓN:</strong><br />
                <div dangerouslySetInnerHTML={{ __html: selectedActividad.objetivos }} />
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="seccion-central">DESARROLLO DE LA REUNIÓN</td>
            </tr>
            <tr>
              <td colSpan="4" className="fila-celda">
                <div dangerouslySetInnerHTML={{ __html: selectedActividad.desarrollo }} />
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="seccion-central">CONCLUSIONES</td>
            </tr>
            <tr>
              <td colSpan="4" className="fila-celda">
                <div dangerouslySetInnerHTML={{ __html: selectedActividad.conclusiones }} />
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="seccion-central">ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</td>
            </tr>
            <tr>
              <th>ACTIVIDAD / DECISIÓN</th>
              <th>FECHA</th>
              <th>RESPONSABLE</th>
              <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
            </tr>
            {(selectedActividad.compromisos?.length > 0
              ? selectedActividad.compromisos
              : Array(3).fill({})
            ).map((comp, index) => (
              <tr key={index}>
                <td>{comp.actividadDecision || ""}</td>
                <td>{formatDate(comp.fecha) || ""}</td>
                <td>{comp.responsable || ""}</td>
                <td>{comp.firmaParticipacion || ""}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" className="seccion-central">ASISTENTES Y APROBACIÓN DECISIONES</td>
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
            <tr>
              <td colSpan="4" className="nota-legal">
                De acuerdo con la Ley 1581 de 2012, Protección de Datos Personales, el Servicio Nacional de Aprendizaje SENA se compromete a garantizar la seguridad y protección de los datos personales que se encuentran almacenados en este documento, y les dará el tratamiento correspondiente en cumplimiento de lo establecido legalmente.
              </td>
            </tr>
            <tr>
              <td colSpan="4" className="pie-codigo">GOR-F-084 V02</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div className="modal-footer">
      <button className="cancel-button" onClick={() => setShowDetailsModal(false)}>Cerrar</button>
      <button className="submit-button" onClick={handleConfirmPrint}>Imprimir</button>
    </div>
  </div>
</div>

      )}
    </div>
  );
};

export default ActividadesComplementarias;