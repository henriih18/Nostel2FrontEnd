import React, { useState, useEffect } from "react"; // Añadimos useEffect para depuración
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Heart } from "lucide-react";
import { toast } from "react-toastify";

export const EditarActividadComplementaria = ({
  actividad,
  onActividadActualizada,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    idActividad: actividad.idActividad,
    idAprendiz: actividad.idAprendiz,
    idInstructor: actividad.idInstructor,
    actaNumber: actividad.actaNumber || "",
    nombreComite: actividad.nombreComite || "",
    ciudad: actividad.ciudad || "Armenia",
    fecha: actividad.fecha ? actividad.fecha.split("T")[0] : "",
    horaInicio: actividad.horaInicio || "",
    horaFin: actividad.horaFin || "",
    lugarEnlace: actividad.lugarEnlace || "",
    direccionRegionalCentro: actividad.direccionRegionalCentro || "",
    agenda: actividad.agenda || "",
    objetivos: actividad.objetivos || "",
    desarrollo: actividad.desarrollo || "",
    conclusiones: actividad.conclusiones || "",
    estado: actividad.estado || "Pendiente",
    compromisos:
      actividad.compromisos && actividad.compromisos.length > 0
        ? actividad.compromisos.map((comp) => ({
            actividadDecision: comp.actividadDecision || "",
            fecha: comp.fecha ? comp.fecha.split("T")[0] : "",
            responsable: comp.responsable || "",
            firmaParticipacion: comp.firmaParticipacion || "",
          }))
        : [{ actividadDecision: "", fecha: "", responsable: "", firmaParticipacion: "" }],
    asistentes:
      actividad.asistentes && actividad.asistentes.length > 0
        ? actividad.asistentes.map((asist) => ({
            nombre: asist.nombre || "",
            dependenciaEmpresa: asist.dependenciaEmpresa || "",
            aprueba: asist.aprueba || "SÍ",
            observacion: asist.observacion || "",
            firmaParticipacion: asist.firmaParticipacion || "",
          }))
        : [],
    version: actividad.version || "02",
    codigo: actividad.codigo || "GOR-F-084",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    /* console.log("Estado showSuccessModal actualizado:", showSuccessModal); */ // Depuración en cada cambio de estado
  }, [showSuccessModal]);

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const handleChange = (e, index, section) => {
    const { name, value } = e.target;

    if (section) {
      setFormData((prev) => {
        const updatedSection = [...prev[section]];
        updatedSection[index] = { ...updatedSection[index], [name]: value };
        return { ...prev, [section]: updatedSection };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleQuillChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addAsistente = () => {
    setFormData((prev) => ({
      ...prev,
      asistentes: [
        ...prev.asistentes,
        { nombre: "", dependenciaEmpresa: "", aprueba: "SÍ", observacion: "", firmaParticipacion: "" },
      ],
    }));
  };

  const validateForm = () => {
    const invalidCompromisos = formData.compromisos.some(
      (comp) =>
        !comp.actividadDecision || !comp.fecha || !comp.responsable || !comp.firmaParticipacion
    );
    if (invalidCompromisos) {
      toast.warn("Todos los campos de los compromisos son obligatorios.")
      /* setError("Todos los campos de los compromisos son obligatorios."); */
      return false;
    }

    const invalidAsistentes = formData.asistentes.slice(2).some(
      (asist) => !asist.nombre || !asist.dependenciaEmpresa || !asist.firmaParticipacion
    );
    if (invalidAsistentes) {
      toast.warn("Los campos nombre, dependencia/empresa y firma son obligatorios para los asistentes adicionales.")
      /* setError("Los campos nombre, dependencia/empresa y firma son obligatorios para los asistentes adicionales."); */
      return false;
    }

    if (formData.asistentes.length < 2) {
      toast.error("Se requieren al menos el instructor y el aprendiz como asistentes.")
      /* setError("Se requieren al menos el instructor y el aprendiz como asistentes."); */
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const idUsuario = sessionStorage.getItem("idUsuario");

      if (!token || !idUsuario) {
        toast.error("Falta información de autenticación.")
        /* setError("Falta información de autenticación"); */
        setLoading(false);
        return;
      }

      const actividadActualizada = {
        ...formData,
        idAprendiz: actividad.idAprendiz, // Aseguramos que idAprendiz no cambie
      };

      /* console.log("Enviando datos actualizados de la actividad:", actividadActualizada); */

      const response = await axios.put(
        `${API_URL}/actividadComplementarias/${formData.idAprendiz}/${formData.idActividad}`,
        actividadActualizada,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      
      setShowSuccessModal(true); // Muestra el modal de éxito
      setFormData((prev) => ({ ...prev, temporalForceUpdate: !prev.temporalForceUpdate })); // Forzar re-render

      if (onActividadActualizada) {
        onActividadActualizada(response.data);
      }

      // Separamos el cierre para asegurar que el modal se muestre primero
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
        
      }, 2000);
    } catch (err) {
      toast.error("Error al actualizar la actividad.")
      /* setError(`Error al actualizar la actividad: ${err.response?.data?.message || err.message}`); */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      {showSuccessModal && (
        <div
          className="success-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1001,
          }}
        >
          <div
            className="success-modal-content"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "5px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2>¡Actividad complementaria editada exitosamente!</h2>
          </div>
        </div>
      )}
      <div className="modal-container">
        <div className="modal-header">
          <h2>Editar Actividad Complementaria</h2>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Sección 1: Encabezado del Acta */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>ACTA No.</label>
                  <input
                    type="text"
                    name="actaNumber"
                    value={formData.actaNumber}
                    onChange={handleChange}
                    placeholder="Número de acta"
                    required
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group wide">
                  <label>NOMBRE DEL COMITÉ O DE LA REUNIÓN</label>
                  <input
                    type="text"
                    name="nombreComite"
                    value={formData.nombreComite}
                    onChange={handleChange}
                    placeholder="Nombre del comité o reunión"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CIUDAD Y FECHA</label>
                  <div className="form-group-pair">
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                      required
                    />
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      required
                      disabled
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>HORA INICIO</label>
                  <input
                    type="time"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>HORA FIN</label>
                  <input
                    type="time"
                    name="horaFin"
                    value={formData.horaFin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group wide">
                  <label>LUGAR Y/O ENLACE</label>
                  <input
                    type="text"
                    name="lugarEnlace"
                    value={formData.lugarEnlace}
                    onChange={handleChange}
                    placeholder="Lugar o enlace de la reunión"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group wide">
                  <label>DIRECCIÓN / REGIONAL / CENTRO</label>
                  <input
                    type="text"
                    name="direccionRegionalCentro"
                    value={formData.direccionRegionalCentro}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Agenda y Objetivos */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group wide">
                  <label>AGENDA O PUNTOS PARA DESARROLLAR</label>
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.agenda}
                    onChange={(value) => handleQuillChange("agenda", value)}
                    placeholder="Describa la agenda o puntos a desarrollar..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group wide">
                  <label>OBJETIVO(S) DE LA REUNIÓN</label>
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.objetivos}
                    onChange={(value) => handleQuillChange("objetivos", value)}
                    placeholder="Describa los objetivos de la reunión..."
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Desarrollo y Conclusiones */}
            <div className="form-section">
              <div className="form-row">
                <div className="form-group wide">
                  <label>DESARROLLO DE LA REUNIÓN</label>
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.desarrollo}
                    onChange={(value) => handleQuillChange("desarrollo", value)}
                    placeholder="Describa el desarrollo de la reunión..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group wide">
                  <label>CONCLUSIONES</label>
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.conclusiones}
                    onChange={(value) => handleQuillChange("conclusiones", value)}
                    placeholder="Describa las conclusiones de la reunión..."
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Compromisos */}
            <div className="form-section">
              <h3>ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</h3>
              <table className="sena-table">
                <thead>
                  <tr>
                    <th>ACTIVIDAD / DECISIÓN</th>
                    <th>FECHA</th>
                    <th>RESPONSABLE</th>
                    <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.compromisos.map((compromiso, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          name="actividadDecision"
                          value={compromiso.actividadDecision}
                          onChange={(e) => handleChange(e, index, "compromisos")}
                          placeholder="Actividad o decisión"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          name="fecha"
                          value={compromiso.fecha}
                          onChange={(e) => handleChange(e, index, "compromisos")}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="responsable"
                          value={compromiso.responsable}
                          onChange={(e) => handleChange(e, index, "compromisos")}
                          placeholder="Nombre del responsable"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="firmaParticipacion"
                          value={compromiso.firmaParticipacion}
                          onChange={(e) => handleChange(e, index, "compromisos")}
                          placeholder="Firma o participación virtual"
                          required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sección 5: Asistentes */}
            <div className="form-section">
              <h3>ASISTENTES Y APROBACIÓN DECISIONES</h3>
              <table className="sena-table">
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>DEPENDENCIA / EMPRESA</th>
                    <th>APRUEBA (SÍ/NO)</th>
                    <th>OBSERVACIÓN</th>
                    <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.asistentes.map((asistente, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          name="nombre"
                          value={asistente.nombre}
                          onChange={(e) => handleChange(e, index, "asistentes")}
                          placeholder="Nombre completo"
                          readOnly={index < 2}
                          required={index >= 2}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="dependenciaEmpresa"
                          value={asistente.dependenciaEmpresa}
                          onChange={(e) => handleChange(e, index, "asistentes")}
                          placeholder="Dependencia o empresa"
                          readOnly={index < 2}
                          required={index >= 2}
                        />
                      </td>
                      <td>
                        <select
                          name="aprueba"
                          value={asistente.aprueba}
                          onChange={(e) => handleChange(e, index, "asistentes")}
                        >
                          <option value="SÍ">SÍ</option>
                          <option value="NO">NO</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="observacion"
                          value={asistente.observacion}
                          onChange={(e) => handleChange(e, index, "asistentes")}
                          placeholder="Observaciones"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="firmaParticipacion"
                          value={asistente.firmaParticipacion}
                          onChange={(e) => handleChange(e, index, "asistentes")}
                          placeholder="Firma o participación virtual"
                          readOnly={index < 2}
                          required={index >= 2}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" className="add-row-button" onClick={addAsistente}>
                Agregar Asistente
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="button-group">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading && <Loader2 className="loading-spinner" />}
                {loading ? "Guardando..." : "Actualizar Actividad"}
              </button>
            </div>
          </form>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EditarActividadComplementaria;