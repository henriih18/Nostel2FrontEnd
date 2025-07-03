/* import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import './Comentarios.css';
import AgregarComentario from "./AgregarComentario";
import EditarComentario from "./EditarComentario";

export const Comentarios = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarioEditar, setComentarioEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchComentarios = async () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido.");
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/comentarios/${idAprendiz}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setComentarios(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem("token");
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        navigate("/login");
      } else {
        setError("Error al cargar los comentarios.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [idAprendiz, navigate]);

  const handleComentarioAgregado = (nuevoComentario) => {
    setComentarios([...comentarios, nuevoComentario]);
  };

  const handleComentarioActualizado = (comentarioActualizado) => {
    setComentarios(
      comentarios.map((c) =>
        c.idComentario === comentarioActualizado.idComentario
          ? comentarioActualizado
          : c
      )
    );
    setShowEditModal(false);
    setComentarioEditar(null);
  };

  const handleEditarComentario = (comentario) => {
    setComentarioEditar(comentario);
    setShowEditModal(true);
   
  };

  const handleConfirmDelete = (idComentario) => {
    setConfirmDelete(idComentario);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleEliminarComentario = async (idComentario) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación.");
        navigate("/login");
        return;
      }

      await axios.delete(
        `${API_URL}/comentarios/${idAprendiz}/${idComentario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComentarios(
        comentarios.filter((c) => c.idComentario !== idComentario)
      );
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      setError("Error al eliminar el comentario.");
    }
  };

  const esAutor = (nombreInstructor) => {
    if (!instructor) return false;
    const nombreCompleto =
      instructor.nombres && instructor.apellidos
        ? `${instructor.nombres} ${instructor.apellidos}`
        : instructor.nombreCompleto || instructor.nombre || "";
    return nombreInstructor === nombreCompleto;
  };

  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");

        if (!token || !idUsuario) {
          setError("No hay token de autenticación o ID de usuario.");
          navigate("/login");
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
        console.error("Error al obtener datos del instructor:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          navigate("/login");
        }
      }
    };

    obtenerDatosInstructor();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Comentarios</h3>
        <button
          className="add-button"
          onClick={() => navigate(`/agregar-comentario/${idAprendiz}`)}
        >
          <span className="icon-plus">+</span> Agregar Comentario
        </button>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading-state">
            <p>Cargando comentarios...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="empty-state">
            <p>No hay comentarios registrados.</p>
          </div>
        ) : (
          <div className="actividades-grid">
            {comentarios.map((comentario) => (
              <div key={comentario.idComentario} className="actividad-card">
                <h4>{comentario.nombreInstructor || "Anónimo"}</h4>
                <p>
                  <span>Fecha:</span> {formatDate(comentario.fechaComentario)}
                </p>
                <div
                  className="actividad-contenido"
                  dangerouslySetInnerHTML={{ __html: comentario.comentario }}
                />
                {esAutor(comentario.nombreInstructor) && (
                  <div className="actividad-actions">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditarComentario(comentario)}
                    >
                      <span className="icon-edit">✎</span> Editar
                    </button>
                    {confirmDelete === comentario.idComentario ? (
                      <div className="confirm-delete">
                        <span>¿Confirmar eliminación?</span>
                        <button
                          className="btn-confirm"
                          onClick={() =>
                            handleEliminarComentario(comentario.idComentario)
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
                          handleConfirmDelete(comentario.idComentario)
                        }
                      >
                        <span className="icon-delete">✖</span> Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && comentarioEditar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            setComentarioEditar(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EditarComentario
              comentario={comentarioEditar}
              onComentarioActualizado={handleComentarioActualizado}
              onClose={() => {
                setShowEditModal(false);
                setComentarioEditar(null);
              }}
            />
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Comentarios;
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import './Comentarios.css';
import AgregarComentario from "./AgregarComentario";
import EditarComentario from "./EditarComentario";
import { toast } from "react-toastify";


export const Comentarios = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentarioEditar, setComentarioEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchComentarios = async () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      setError("ID de aprendiz inválido.");
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/comentarios/${idAprendiz}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setComentarios(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        sessionStorage.removeItem("token");
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
        navigate("/login");
      } else {
        setError("Error al cargar los comentarios.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, [idAprendiz, navigate]);

  const handleComentarioAgregado = (nuevoComentario) => {
    setComentarios([...comentarios, nuevoComentario]);
  };

  /* const handleComentarioActualizado = (comentarioActualizado) => {
    setComentarios(
      comentarios.map((c) =>
        c.idComentario === comentarioActualizado.idComentario
          ? comentarioActualizado
          : c
      )
    );
    setShowEditModal(false);
    setComentarioEditar(null);
    toast.success("Comentario actualizado con exito")
  }; */

  const handleComentarioActualizado = (comentarioActualizado) => {
  try {
    setComentarios(
      comentarios.map((c) =>
        c.idComentario === comentarioActualizado.idComentario
          ? comentarioActualizado
          : c
      )
    );
    setShowEditModal(false);
    setComentarioEditar(null);
    toast.success("Comentario actualizado con éxito.");
  } catch (err) {
    console.error("Error al actualizar comentario:", err);
    toast.error("Error al actualizar el comentario.");
  }
};


  const handleEditarComentario = (comentario) => {
    setComentarioEditar(comentario);
    setShowEditModal(true);
  };

  const handleConfirmDelete = (idComentario) => {
    setConfirmDelete(idComentario);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  const handleEliminarComentario = async (idComentario) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No hay token de autenticación.");
        navigate("/login");
        return;
      }

      await axios.delete(
        `${API_URL}/comentarios/${idAprendiz}/${idComentario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComentarios(
        comentarios.filter((c) => c.idComentario !== idComentario)
      );
      setConfirmDelete(null);
      toast.success("Comentario eliminado con exito")
    } catch (err){
      toast.error("Error al eliminar el comentario")
    }
  };

  const esAutor = (nombreInstructor) => {
    if (!instructor) return false;
    const nombreCompleto =
      instructor.nombres && instructor.apellidos
        ? `${instructor.nombres} ${instructor.apellidos}`
        : instructor.nombreCompleto || instructor.nombre || "";
    return nombreInstructor === nombreCompleto;
  };

  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");

        if (!token || !idUsuario) {
          setError("No hay token de autenticación o ID de usuario.");
          navigate("/login");
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
        console.error("Error al obtener datos del instructor:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
          navigate("/login");
        }
      }
    };

    obtenerDatosInstructor();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Comentarios</h3>
        <button
          className="add-button"
          onClick={() => navigate(`/agregar-comentario/${idAprendiz}`)}
        >
          <span className="icon-plus">+</span> Agregar Comentario
        </button>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="loading-state">
            <p>Cargando comentarios...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="empty-state">
            <p>No hay comentarios registrados.</p>
          </div>
        ) : (
          <div className="actividades-grid">
            {comentarios.map((comentario) => (
              <div key={comentario.idComentario} className="actividad-card">
                <h4>{comentario.nombreInstructor || "Anónimo"}</h4>
                <p>
                  <span>Fecha:</span> {formatDate(comentario.fechaComentario)}
                </p>
                <div
                  className="actividad-contenido"
                  dangerouslySetInnerHTML={{ __html: comentario.comentario }}
                />
                {esAutor(comentario.nombreInstructor) && (
                  <div className="actividad-actions">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditarComentario(comentario)}
                    >
                      <span className="icon-edit">✎</span> Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleConfirmDelete(comentario.idComentario)}
                    >
                      <span className="icon-delete">✖</span> Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && comentarioEditar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            setComentarioEditar(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EditarComentario
              comentario={comentarioEditar}
              onComentarioActualizado={handleComentarioActualizado}
              onClose={() => {
                setShowEditModal(false);
                setComentarioEditar(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 🔴 Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-container-delete" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>¿Eliminar comentario?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCancelDelete}>
                No
              </button>
              <button
                className="submit-button"
                onClick={() => handleEliminarComentario(confirmDelete)}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comentarios;
