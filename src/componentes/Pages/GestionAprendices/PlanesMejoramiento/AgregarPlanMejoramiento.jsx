import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import logoSena from "../../../../assets/images/logoSena.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Heart } from "lucide-react";
import { toast } from "react-toastify";


const AgregarPlanMejoramiento = () => {
  const navigate = useNavigate();
  const { idAprendiz } = useParams();
  const location = useLocation();
  

  const [formData, setFormData] = useState({
    idInstructor: null,
    actaNumber: "",
    nombreComite: "",
    ciudad: "Armenia",
    fecha: new Date().toISOString().split("T")[0],
    horaInicio: "",
    horaFin: "",
    lugarEnlace: "",
    direccionRegionalCentro:
      sessionStorage.getItem("regional") || "Centro de Comercio y Turismo",
    agenda: "",
    objetivos: "",
    desarrollo: "",
    conclusiones: "",
    estado: "Pendiente",
    compromisosPlan: [
      {
        planDecision: "",
        fecha: "",
        responsable: "",
        firmaParticipacion: "",
      },
    ],
    asistentesPlan: [
      {
        nombre: "",
        numeroDocumento: "",
        correoElectronico: "",
        telefonoExt: "",
        planta: false,
        contratista: false,
        otro: "",
        dependenciaEmpresa: "",
        aprueba: "SÍ",
        observacion: "",
        autorizaGrabacion: false,
        firmaParticipacion: "",
      },
    ],
    version: "02",
    codigo: "GOR-F-084",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [asistenciaData, setAsistenciaData] = useState([]);
  const [aprendizData, setAprendizData] = useState(null);
   const [shouldSubmit, setShouldSubmit] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Fetch del Instructor
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");

        if (!token || !idUsuario) {
          toast.error("No hay token de autenticacion")
          /* setError("No hay token de autenticación o ID de usuario disponible"); */
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

        setFormData((prev) => ({
          ...prev,
          idInstructor: response.data.idInstructor,
          asistentesPlan: [
            {
              nombre: `${response.data.nombres} ${response.data.apellidos}`,
              numeroDocumento: response.data.numeroDocente || "",
              correoElectronico: response.data.correo || "",
              telefonoExt: response.data.telefono || "",
              planta: false,
              contratista: false,
              otro: "",
              dependenciaEmpresa: "Instructor",
              aprueba: "SÍ",
              observacion: "",
              autorizaGrabacion: false,
              firmaParticipacion: "",
            },
          ],
        }));
      } catch (err) {
        console.error("Error al obtener datos del instructor:", err);
        if (err.response && err.response.status === 401) {
          toast.error("Sesion expirada. Por favor, inicie sesion nuevamente")
          /* setError("Sesión expirada. Por favor, inicie sesión nuevamente."); */
          sessionStorage.clear();
          navigate("/login");
        } else {
          toast.error("Error al cargar datos del instructor")
          /* setError(
            `Error al cargar datos del instructor: ${
              err.response?.data?.message || err.message
            }`
          ); */
        }
      }
    };

    fetchInstructor();
  }, [navigate]);

  // Fetch del Aprendiz
  useEffect(() => {
    const fetchAprendiz = async () => {
      try {
        const token = sessionStorage.getItem("token");

        if (!token || !idAprendiz) {
          toast.error("No hay token de autenticacion")
          /* setError("No hay token de autenticación o ID de aprendiz disponible"); */
          navigate("/aprendices");
          return;
        }

        const response = await axios.get(
          `${API_URL}/aprendices/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const aprendizData = response.data;
        setAprendizData(aprendizData);

        setFormData((prev) => ({
          ...prev,
          asistentesPlan: [
            ...prev.asistentesPlan,
            {
              nombre: `${aprendizData.nombres} ${aprendizData.apellidos}`,
              numeroDocumento: aprendizData.documento || "",
              correoElectronico: aprendizData.correo || "",
              telefonoExt: aprendizData.telefono || "",
              planta: false,
              contratista: false,
              otro: "",
              dependenciaEmpresa: "Aprendiz",
              aprueba: "SÍ",
              observacion: "",
              autorizaGrabacion: false,
              firmaParticipacion: "",
            },
          ],
        }));
      } catch (err) {
        /* console.error("Error al obtener datos del aprendiz:", err); */
        if (err.response && err.response.status === 404) {
          toast.error("No se encontro ningun aprendiz")
          /* setError("No se encontró un aprendiz con el ID proporcionado."); */
          setTimeout(() => navigate("/aprendices"), 3000);
        } else if (err.response && err.response.status === 401) {
          toast.error("Sesion expirada. Por favor, inicie sesion nuevamente")
          /* setError("Sesión expirada. Por favor, inicie sesión nuevamente."); */
          sessionStorage.clear();
          navigate("/login");
        } else {
          toast.error("Error al cargar datos del Aprendiz")
          /* setError(
            `Error al cargar datos del aprendiz: ${
              err.response?.data?.message || err.message
            }`
          ); */
        }
      }
    };

    if (idAprendiz) {
      fetchAprendiz();
    }
  }, [idAprendiz, navigate]);

  // Pllenado con datos generados por la IA
  useEffect(() => {
    if (location.state && location.state.actividadGenerada && aprendizData) {
      const { actividadGenerada } = location.state;
      /* console.log("Datos recibidos de location.state:", actividadGenerada); // Depuración */

      // Verificar que sea un plan de mejoramiento
      if (actividadGenerada.tipoDocumento !== "plan de mejoramiento") {
        toast.error("Este formulario solo acepta planes de mejoramiento generados por el chatbot.")
        /* setError(
          "Este formulario solo acepta planes de mejoramiento generados por el chatbot."
        ); */
        return;
      }

      // Función para formatear texto para ReactQuill, preservando saltos de línea
      const formatForQuill = (text) => {
        if (!text) return "";
        return text
          .split("\n")
          .map((line) => `<p>${line.trim()}</p>`)
          .join("");
      };

      setFormData((prev) => ({
        ...prev,
        nombreComite: actividadGenerada.nombreComite || prev.nombreComite,
        agenda: formatForQuill(actividadGenerada.agenda) || prev.agenda,
        objetivos:
          formatForQuill(actividadGenerada.objetivos) || prev.objetivos,
        desarrollo:
          formatForQuill(actividadGenerada.desarrollo) || prev.desarrollo,
        conclusiones:
          formatForQuill(actividadGenerada.conclusiones) || prev.conclusiones,
        compromisosPlan: [
          {
            planDecision: "",
            fecha: prev.fecha,
            responsable: `${aprendizData.nombres} ${aprendizData.apellidos}`,
            firmaParticipacion: "",
          },
        ],
      }));
    }
  }, [location.state, aprendizData]);

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

  const hoy = new Date().toISOString().split("T")[0]; 
  const formatFechaModal = (fecha) => {
    const date = new Date(fecha);
    // Dentro de tu componente:
    // e.g. "2025-06-03"

    return {
      dia: date.getDate(),
      mes: date.toLocaleString("default", { month: "long" }),
      anio: date.getFullYear(),
    };
  };
  const fechaModal = formatFechaModal(formData.fecha);

  const handleAsistenciaChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setAsistenciaData((prev) => {
      const updatedAsistencia = [...prev];
      updatedAsistencia[index] = {
        ...updatedAsistencia[index],
        [name]: newValue,
      };
      return updatedAsistencia;
    });
  };

  const addAsistente = () => {
    setFormData((prev) => ({
      ...prev,
      asistentesPlan: [
        ...prev.asistentesPlan,
        {
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

  const removeAsistente = (index) => {
    setFormData((prev) => {
      const nuevos = [...prev.asistentesPlan];
      if (index >= 2) {
        nuevos.splice(index, 1);
      }
      return { ...prev, asistentesPlan: nuevos };
    });
  };

  const addAsistenciaRow = () => {
    setAsistenciaData((prev) => [
      ...prev,
      {
        nombre: "",
        numeroDocumento: "",
        planta: false,
        contratista: false,
        otro: "",
        dependenciaEmpresa: "",
        correoElectronico: "",
        telefonoExt: "",
        autorizaGrabacion: false,
        firmaParticipacion: "",
      },
    ]);
  };

  const handleOpenModal = () => {
    try {
      const hasMissingFields = formData.asistentesPlan.some(
        (asistente) => !asistente.nombre || !asistente.dependenciaEmpresa
      );
      if (hasMissingFields) {
        toast.error("Por favor, completa los campos Nombre y Dependencia/Empresa para todos los asistentes antes de continuar.")
        /* setError(
          "Por favor, completa los campos Nombre y Dependencia/Empresa para todos los asistentes antes de continuar."
        ); */
        return;
      }

      setAsistenciaData(
        formData.asistentesPlan.map((asistente) => ({
          nombre: asistente.nombre,
          numeroDocumento: asistente.numeroDocumento,
          planta: asistente.planta,
          contratista: asistente.contratista,
          otro: asistente.otro,
          dependenciaEmpresa: asistente.dependenciaEmpresa,
          correoElectronico: asistente.correoElectronico,
          telefonoExt: asistente.telefonoExt,
          autorizaGrabacion: asistente.autorizaGrabacion,
          firmaParticipacion: asistente.firmaParticipacion,
        }))
      );
      setShowModal(true);
    } catch (err) {
      toast.error("Error al abrir el modal de registro de asistencia. Por favor, intenta nuevamente.")
      /* setError(
        "Error al abrir el modal de registro de asistencia. Por favor, intenta nuevamente."
      ); */
    }
  };

  const handleModalConfirm = () => {
    const hasEmptyRequiredFields = asistenciaData.some(
      (asistente) =>
        !asistente.nombre ||
        !asistente.numeroDocumento ||
        !asistente.firmaParticipacion
    );
    if (hasEmptyRequiredFields) {
      toast.error("Todos los campos son obligatorios")
      /* setError(
        "Todos los campos obligatorios (Nombre, Número de Documento y Firma) deben estar llenos."
      ); */
      return;
    }

    setFormData((prev) => ({
      ...prev,
      asistentesPlan: asistenciaData.map((asistente) => ({
        ...asistente,
        planta: asistente.planta === true,
      contratista: asistente.contratista === true,
      autorizaGrabacion: asistente.autorizaGrabacion === true,
      aprueba: asistente.aprueba || "SÍ",
      observacion: asistente.observacion || "",
      })),
    }));
    setShowModal(false);
    setShouldSubmit(true);
  };

  useEffect(() => {
      if (shouldSubmit) {
        handleSubmit();
        setShouldSubmit(false);
      }
    }, [formData.asistentes, shouldSubmit]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        toast.error("No se ha identificado al instructor")
        /* setError("No se ha identificado al instructor"); */
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/planMejoramientos/${idAprendiz}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      /* setShowSuccessModal(true); */
      toast.success("¡Plan de mejoramiento guardado exitosamente!")

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(`/aprendices/${idAprendiz}`);
      });
    } catch (err) {
      /* console.error("Error al guardar el plan:", err); */
      if (err.response && err.response.status === 401) {
        setError("Sesión expirada. Por favor, inicie sesión nuevamente.");
        sessionStorage.clear();
        navigate("/login");
      } else {
        toast.error(`Error: ${err.response?.data?.message || err.message}`)
        /* setError(`Error: ${err.response?.data?.message || err.message}`); */
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuillChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="formato-sena-container">
      <div className="header-with-logo">
        <img src={logoSena} alt="Logo SENA" className="sena-logo" />
        <h1 className="document-title">
          SERVICIO NACIONAL DE APRENDIZAJE SENA
          <br />
          PLAN DE MEJORAMIENTO
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleOpenModal();
        }}
        className="sena-form"
      >
        {/* Sección 1: Encabezado del Plan */}
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
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group wide">
              <label>NOMBRE DEL COMITÉ O DEL PLAN</label>
              <input
                type="text"
                name="nombreComite"
                value={formData.nombreComite}
                onChange={handleChange}
                placeholder="Nombre del comité o plan"
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
                  min={hoy}
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
                placeholder="Lugar o enlace del plan"
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
              <label>OBJETIVO(S) DEL PLAN</label>
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={formData.objetivos}
                onChange={(value) => handleQuillChange("objetivos", value)}
                placeholder="Describa los objetivos del plan..."
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Desarrollo y Conclusiones */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group wide">
              <label>DESARROLLO DEL PLAN</label>
              <ReactQuill
                theme="snow"
                modules={quillModules}
                value={formData.desarrollo}
                onChange={(value) => handleQuillChange("desarrollo", value)}
                placeholder="Describa el desarrollo del plan..."
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
                placeholder="Describa las conclusiones del plan..."
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
              {formData.compromisosPlan.map((compromiso, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="planDecision"
                      value={compromiso.planDecision}
                      onChange={(e) =>
                        handleChange(e, index, "compromisosPlan")
                      }
                      placeholder="Actividad o decisión"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="fecha"
                      value={compromiso.fecha}
                      onChange={(e) =>
                        handleChange(e, index, "compromisosPlan")
                      }
                      min={hoy}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="responsable"
                      value={compromiso.responsable}
                      onChange={(e) =>
                        handleChange(e, index, "compromisosPlan")
                      }
                      placeholder="Nombre del responsable"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="firmaParticipacion"
                      value={compromiso.firmaParticipacion}
                      onChange={(e) =>
                        handleChange(e, index, "compromisosPlan")
                      }
                      placeholder="Firma o participación virtual"
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
                <th>Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {formData.asistentesPlan.map((asistente, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="nombre"
                      value={asistente.nombre}
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
                      placeholder="Nombre completo"
                      readOnly={index < 2}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="dependenciaEmpresa"
                      value={asistente.dependenciaEmpresa}
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
                      placeholder="Dependencia o empresa"
                      readOnly={index < 2}
                    />
                  </td>
                  <td>
                    <select
                      name="aprueba"
                      value={asistente.aprueba}
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
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
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
                      placeholder="Observaciones"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="firmaParticipacion"
                      value={asistente.firmaParticipacion}
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
                      placeholder="Firma o participación virtual"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="delete-row-button"
                      disabled={index < 2}
                      onClick={() => {
                        if (index < 2) {
                          alert(
                            "No se puede eliminar al instructor ni al aprendiz"
                          );
                        } else {
                          removeAsistente(index);
                        }
                      }}
                      title={
                        index < 2
                          ? "No se puede eliminar"
                          : "Eliminar asistente"
                      }
                    >
                      ❌
                    </button>
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

        {/* Sección 6: Nota Legal */}
        <div className="form-section">
          <p className="legal-note">
            De acuerdo con La Ley 1581 de 2012, Protección de Datos Personales,
            el Servicio Nacional de Aprendizaje SENA, se compromete a garantizar
            la seguridad y protección de los datos personales que se encuentran
            almacenados en este documento, y les dará el tratamiento
            correspondiente en cumplimiento de lo establecido legalmente.
          </p>
        </div>
        <div className="document-footer">
          <span className="codigo">Código: {formData.codigo}</span>
        </div>

        {/* Botones de Acción */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(`/aprendices/${idAprendiz}`)}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Avanzando" : "Siguiente"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Modal para Registro de Asistencia */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="header-with-logo">
              <img src={logoSena} alt="Logo SENA" className="sena-logo" />
              <h1 className="document-title">
                SERVICIO NACIONAL DE APRENDIZAJE SENA
                <br />
                REGISTRO DE ASISTENCIA
              </h1>
            </div>
            <div className="document-header">
              <span>DÍA: {fechaModal.dia}</span>
              <span>MES: {fechaModal.mes}</span>
              <span>AÑO: {fechaModal.anio}</span>
            </div>
            <div className="form-section">
              <div className="form-row">
                <div className="form-group wide">
                  <label>OBJETIVO(S)</label>
                  <ReactQuill
                    theme="snow"
                    modules={quillModules}
                    value={formData.objetivos}
                    onChange={(value) => handleQuillChange("objetivos", value)}
                    placeholder="Describa los objetivos del plan..."
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="form-section1">
              <h3>ASISTENTES</h3>
              <table className="sena-table1">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>NOMBRES Y APELLIDOS</th>
                    <th>N°. DOCUMENTO</th>
                    <th>PLANTA</th>
                    <th>CONTRATISTA</th>
                    <th>OTRO</th>
                    <th>DEPENDENCIA / EMPRESA</th>
                    <th>CORREO ELECTRÓNICO</th>
                    <th>TELÉFONO / EXT.</th>
                    <th>AUTORIZA GRABACIÓN</th>
                    <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                    <th>Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciaData.map((asistente, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          name="nombre"
                          value={asistente.nombre}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Nombres y apellidos"
                          required
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="numeroDocumento"
                          value={asistente.numeroDocumento}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Número de documento"
                          required
                          readOnly={index < 2}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          name="planta"
                          checked={asistente.planta}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          name="contratista"
                          checked={asistente.contratista}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="otro"
                          value={asistente.otro}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Otro"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="dependenciaEmpresa"
                          value={asistente.dependenciaEmpresa}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Dependencia o empresa"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="correoElectronico"
                          value={asistente.correoElectronico}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Correo electrónico"
                          required
                          readOnly={index < 2}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="telefonoExt"
                          value={asistente.telefonoExt}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Teléfono o extensión"
                          readOnly={index < 2}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          name="autorizaGrabacion"
                          checked={asistente.autorizaGrabacion}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="firmaParticipacion"
                          value={asistente.firmaParticipacion}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          placeholder="Firma o participación virtual"
                          required
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="delete-row-button"
                          onClick={() => {
                            if (index < 2) return;
                            setAsistenciaData((prev) => {
                              const copy = [...prev];
                              copy.splice(index, 1);
                              return copy;
                            });
                          }}
                          disabled={index < 2}
                          title={
                            index < 2
                              ? "No se puede eliminar"
                              : "Eliminar este asistente"
                          }
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="add-row-button"
                onClick={addAsistenciaRow}
              >
                Agregar Asistente
              </button>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={handleModalConfirm}
                disabled={loading}
              >
                {loading && <Loader2 className="loading-spinner" />}
                {loading ? "Guardando..." : "Confirmar y Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <h2>¡Plan de mejoramiento guardado exitosamente!</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgregarPlanMejoramiento;
