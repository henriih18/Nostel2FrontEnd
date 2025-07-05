import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
//import "./EditarActividad.css" // Asegúrate de que esta ruta sea correcta si la necesitas

export const EditarPlanMejoramiento = ({
  plan,
  onPlanActualizado,
  onClose,
}) => {
  // Función auxiliar para generar un ID único
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  };

  const [formData, setFormData] = useState({
    idPlanMejoramiento: plan.idPlanMejoramiento,
    idAprendiz: plan.idAprendiz,
    idInstructor: plan.idInstructor,
    actaNumber: plan.actaNumber || "",
    nombreComite: plan.nombreComite || "",
    ciudad: plan.ciudad || "Armenia",
    fecha: plan.fecha ? plan.fecha.split("T")[0] : "",
    horaInicio: plan.horaInicio || "",
    horaFin: plan.horaFin || "",
    lugarEnlace: plan.lugarEnlace || "",
    direccionRegionalCentro: plan.direccionRegionalCentro || "",
    agenda: plan.agenda || "",
    objetivos: plan.objetivos || "",
    desarrollo: plan.desarrollo || "",
    conclusiones: plan.conclusiones || "",
    estado: plan.estado || "Pendiente",
    compromisosPlan:
      plan.compromisosPlan && plan.compromisosPlan.length > 0
        ? plan.compromisosPlan.map((comp) => ({
            /* id: comp.id || generateUniqueId(), */ // Asegura un ID único
            planDecision: comp.planDecision || "",
            fecha: comp.fecha ? comp.fecha.split("T")[0] : "",
            responsable: comp.responsable || "",
            firmaParticipacion: comp.firmaParticipacion || "",
          }))
        : [
            {
              /* id: generateUniqueId(),  */// Asegura un ID único para el compromiso inicial
              planDecision: "",
              fecha: "",
              responsable: "",
              firmaParticipacion: "",
            },
          ],
    asistentesPlan:
      plan.asistentesPlan && plan.asistentesPlan.length > 0
        ? plan.asistentesPlan.map((asist) => ({
            /* id: asist.id || generateUniqueId(), // Asegura un ID único */
            nombre: asist.nombre || "",
            numeroDocumento: asist.numeroDocumento || "",
            planta: asist.planta || false,
            contratista: asist.contratista || false,
            otro: asist.otro || "",
            dependenciaEmpresa: asist.dependenciaEmpresa || "",
            correoElectronico: asist.correoElectronico || "",
            telefonoExt: asist.telefonoExt || "",
            autorizaGrabacion: asist.autorizaGrabacion || false,
            aprueba: asist.aprueba || "SÍ",
            observacion: asist.observacion || "",
            firmaParticipacion: asist.firmaParticipacion || "",
          }))
        : [],
    version: plan.version || "02",
    codigo: plan.codigo || "GOR-F-084",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentSection, setCurrentSection] = useState("acta"); // Nueva sección para alternar
  const actaRef = useRef();
  const registroRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log("Estado showSuccessModal actualizado:", showSuccessModal);
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
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (section) {
      setFormData((prev) => {
        const updatedSection = [...prev[section]];
        updatedSection[index] = { ...updatedSection[index], [name]: newValue };
        return { ...prev, [section]: updatedSection };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
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
      asistentesPlan: [
        ...prev.asistentesPlan,
        {
          /* id: generateUniqueId(),  */// Asegura un ID único para el nuevo asistente
          nombre: "",
          numeroDocumento: "",
          planta: false,
          contratista: false,
          otro: "",
          dependenciaEmpresa: "",
          correoElectronico: "",
          telefonoExt: "",
          autorizaGrabacion: false,
          aprueba: "SÍ",
          observacion: "",
          firmaParticipacion: "",
        },
      ],
    }));
  };

  const validateForm = () => {
    const invalidCompromisos = formData.compromisosPlan.some(
      (comp) =>
        !comp.planDecision ||
        !comp.fecha ||
        !comp.responsable ||
        !comp.firmaParticipacion
    );
    if (invalidCompromisos) {
      toast.warn("Todos los campos de los compromisos son obligatorios.");
      return false;
    }

    // Nota: El slice(2) aquí significa que los primeros dos asistentes (instructor y aprendiz)
    // no necesitan cumplir con estas validaciones de nombre, dependenciaEmpresa y firmaParticipacion.
    // Asegúrate de que esto sea el comportamiento deseado.
    const invalidAsistentes = formData.asistentesPlan
      .slice(2)
      .some(
        (asist) =>
          !asist.nombre ||
          !asist.dependenciaEmpresa ||
          !asist.firmaParticipacion
      );
    if (invalidAsistentes) {
      toast.warn(
        "Los campos nombre, dependencia/empresa y firma son obligatorios para los asistentes adicionales."
      );
      return false;
    }

    if (formData.asistentesPlan.length < 2) {
      toast.error(
        "Se requieren al menos el instructor y el aprendiz como asistentes."
      );
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
        toast.error("Falta información de autenticación.");
        setLoading(false);
        return;
      }

      const planActualizado = {
        ...formData,
        idAprendiz: plan.idAprendiz,
      };

      /* console.log("Enviando datos actualizados de la actividad:", actividadActualizada); */

      const response = await axios.put(
        `${API_URL}/planMejoramientos/${formData.idAprendiz}/${formData.idPlanMejoramiento}`,
        
        planActualizado,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowSuccessModal(true);
      setFormData((prev) => ({
        ...prev,
        temporalForceUpdate: !prev.temporalForceUpdate,
      }));

      if (onPlanActualizado) {
        onPlanActualizado(response.data);
      }

      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar el plan:", err); // Añadir log de error
      toast.error("Error al actualizar el plan.");
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
            <h2>¡Plan mejoramiento editado exitosamente!</h2>
          </div>
        </div>
      )}
      <div className="modal-container modal-container-e">
        <div className="modal-header">
          <h2>Editar Plan Mejoramiento</h2>
        </div>
        <div className="modal-body modal-body-e">
          <form onSubmit={handleSubmit}>
            {/* Sección de Acta */}
            {currentSection === "acta" && (
              <div
                ref={actaRef}
                className={`acta-imprimible ${
                  currentSection === "acta"
                    ? "slide-in-left"
                    : "slide-out-right"
                }`}
              >
                {/* Sección 1: Encabezado del Acta */}
                <div className="form-section form-section-g">
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

                  <div className="form-row ">
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
                <div className="form-section form-section-g">
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
                        onChange={(value) =>
                          handleQuillChange("objetivos", value)
                        }
                        placeholder="Describa los objetivos de la reunión..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 3: Desarrollo y Conclusiones */}
                <div className="form-section form-section-g">
                  <div className="form-row">
                    <div className="form-group wide">
                      <label>DESARROLLO DE LA REUNIÓN</label>
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={formData.desarrollo}
                        onChange={(value) =>
                          handleQuillChange("desarrollo", value)
                        }
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
                        onChange={(value) =>
                          handleQuillChange("conclusiones", value)
                        }
                        placeholder="Describa las conclusiones de la reunión..."
                      />
                    </div>
                  </div>
                </div>

                {/* Sección 4: Compromisos */}
                <div className="form-section form-section-g">
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
                      {formData.compromisosPlan.map((compromisoPlan, index) => (
                        <tr key={compromisoPlan.id}> {/* Usando el ID único */}
                          <td>
                            <input
                              type="text"
                              name="planDecision"
                              value={compromisoPlan.planDecision}
                              onChange={(e) =>
                                handleChange(e, index, "compromisosPlan")
                              }
                              placeholder="Actividad o decisión"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              name="fecha"
                              value={compromisoPlan.fecha}
                              onChange={(e) =>
                                handleChange(e, index, "compromisosPlan")
                              }
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="responsable"
                              value={compromisoPlan.responsable}
                              onChange={(e) =>
                                handleChange(e, index, "compromisosPlan")
                              }
                              placeholder="Nombre del responsable"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="firmaParticipacion"
                              value={compromisoPlan.firmaParticipacion}
                              onChange={(e) =>
                                handleChange(e, index, "compromisosPlan")
                              }
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
                <div className="form-section form-section-g">
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
                      {formData.asistentesPlan.map((asistentePlan, index) => (
                        <tr key={index}> {/* Usando el ID único */}
                          <td>
                            <input
                              type="text"
                              name="nombre"
                              value={asistentePlan.nombre}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Nombre completo"
                              readOnly={index < 2}
                              required={index >= 2}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="dependenciaEmpresa"
                              value={asistentePlan.dependenciaEmpresa}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Dependencia o empresa"
                              readOnly={index < 2}
                              required={index >= 2}
                            />
                          </td>
                          <td>
                            <select
                              name="aprueba"
                              value={asistentePlan.aprueba}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                            >
                              <option value="SÍ">SÍ</option>
                              <option value="NO">NO</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              name="observacion"
                              value={asistentePlan.observacion}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Observaciones"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="firmaParticipacion"
                              value={asistentePlan.firmaParticipacion}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Firma o participación virtual"
                              readOnly={index < 2}
                              required={index >= 2}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="add-row-button"
                    onClick={addAsistente}
                  >
                    Agregar Asistente
                  </button>
                </div>
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
                <div className="form-section">
                  <div className="form-row">
                    <div className="form-group wide">
                      <label>OBJETIVO(S) DE LA REUNIÓN</label>
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        value={formData.objetivos}
                        onChange={(value) =>
                          handleQuillChange("objetivos", value)
                        }
                        placeholder="Describa los objetivos de la reunión..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>REGISTRO DE ASISTENCIA</h3>
                  <table className="registro-full-table">
                    <thead>
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
                      {formData.asistentesPlan.map((asistentePlan, index) => (
                        <tr key={asistentePlan.id}> {/* Usando el ID único */}
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              name="nombre"
                              value={asistentePlan.nombre}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Nombre completo"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="numeroDocumento"
                              value={asistentePlan.numeroDocumento}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Número de documento"
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              name="planta"
                              checked={asistentePlan.planta}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              name="contratista"
                              checked={asistentePlan.contratista}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="otro"
                              value={asistentePlan.otro}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Otro / ¿Cuál?"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="dependenciaEmpresa"
                              value={asistentePlan.dependenciaEmpresa}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Dependencia o empresa"
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              name="correoElectronico"
                              value={asistentePlan.correoElectronico}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Correo electrónico"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="telefonoExt"
                              value={asistentePlan.telefonoExt}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Teléfono/Ext."
                            />
                          </td>
                          <td>
                            <input
                              type="checkbox"
                              name="autorizaGrabacion"
                              checked={asistentePlan.autorizaGrabacion}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              name="firmaParticipacion"
                              value={asistentePlan.firmaParticipacion}
                              onChange={(e) =>
                                handleChange(e, index, "asistentesPlan")
                              }
                              placeholder="Firma o participación virtual"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="add-row-button"
                    onClick={addAsistente}
                  >
                    Agregar Asistente
                  </button>
                </div>
              </div>
            )}

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
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading && <Loader2 className="loading-spinner" />}
                {loading ? "Guardando..." : "Actualizar Plan"}
              </button>
            </div>
          </form>
          {/* Navegación entre secciones */}
          <div className="modal-navigation">
            {currentSection === "acta" ? (
              <button
                className="nav-button"
                onClick={() => setCurrentSection("registro")}
              >
                → Registro de Asistencia
              </button>
            ) : (
              <button
                className="nav-button"
                onClick={() => setCurrentSection("acta")}
              >
                ← Plan de Mejoramiento
              </button>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EditarPlanMejoramiento;
