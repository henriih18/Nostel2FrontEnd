import React, { useState, useEffect } from "react";
import axios from "axios";
//import "./AgregarActividad.css"; // Usamos el mismo CSS que AgregarActividadComplementaria
import { useNavigate, useParams } from "react-router-dom";
import logoSena from "../../../../assets/images/logoSena.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const AgregarPlanMejoramiento = () => {
  const navigate = useNavigate();
  const { idAprendiz } = useParams();

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
        responsable: "", // Se llenará con el nombre del aprendiz
        firmaParticipacion: "",
      },
    ],
    asistentesPlan: [
      {
        nombre: "",
        numeroDocumento: "",
        correoElectronico: "",
        telefonoExt: "",
        planta: "",
        contratista: "",
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
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [asistenciaData, setAsistenciaData] = useState([]); // Inicializamos como vacío

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // Cargar datos del instructor
  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");
        if (!token || !idUsuario) {
          setError("No hay token de autenticación o ID de usuario disponible");
          navigate("/login");
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
        setFormData((prev) => ({
          ...prev,
          idInstructor: response.data.idInstructor,
          asistentesPlan: [
            {
              nombre: `${response.data.nombres} ${response.data.apellidos}`,
              numeroDocumento: response.data.numeroDocente || "",
              correoElectronico: response.data.correo || "",
              telefonoExt: response.data.telefono || "",
              planta: "",
              contratista: "",
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
        setError(
          `Error al cargar datos del instructor: ${
            err.response?.data?.message || err.message
          }`
        );
      }
    };
    fetchInstructor();
  }, [navigate]);

  // Cargar datos del aprendiz y asegurarlo como primer asistente, además llenar "responsable"
  useEffect(() => {
    const fetchAprendiz = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token || !idAprendiz) {
          setError("No hay token de autenticación o ID de aprendiz disponible");
          navigate("/aprendices");
          return;
        }
        const response = await axios.get(
          `http://localhost:8080/api/aprendices/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const aprendizData = response.data;
        const aprendizNombre = `${aprendizData.nombres} ${aprendizData.apellidos}`;
        setFormData((prev) => {
          const updatedAsistentes = [
            {
              nombre: aprendizNombre,
              numeroDocumento: aprendizData.documento || "",
              correoElectronico: aprendizData.correo || "",
              telefonoExt: aprendizData.telefono || "",
              planta: "",
              contratista: "",
              otro: "",
              dependenciaEmpresa: "Aprendiz",
              aprueba: "SÍ",
              observacion: "",
              autorizaGrabacion: false,
              firmaParticipacion: "",
            },
            ...prev.asistentesPlan,
          ].filter((asistente, index, self) =>
            index === self.findIndex((a) => a.nombre === asistente.nombre)
          ); // Eliminar duplicados
          return {
            ...prev,
            asistentesPlan: updatedAsistentes,
            compromisosPlan: prev.compromisosPlan.map((compromiso) => ({
              ...compromiso,
              responsable: aprendizNombre, // Llenar el responsable con el nombre del aprendiz
            })),
          };
        });
      } catch (err) {
        console.error("Error al obtener datos del aprendiz:", err);
        if (err.response && err.response.status === 404) {
          setError("No se encontró un aprendiz con el ID proporcionado.");
          setTimeout(() => navigate("/aprendices"), 3000);
        } else {
          setError(
            `Error al cargar datos del aprendiz: ${
              err.response?.data?.message || err.message
            }`
          );
        }
      }
    };
    if (idAprendiz) fetchAprendiz();
  }, [idAprendiz, navigate]);

  const handleChange = (e, index, section) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    if (section) {
      setFormData((prev) => {
        const updated = [...prev[section]];
        updated[index] = { ...updated[index], [name]: newValue };
        return { ...prev, [section]: updated };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
  };

  const addAsistente = () => {
    setFormData((prev) => ({
      ...prev,
      asistentesPlan: [
        ...prev.asistentesPlan,
        {
          nombre: "",
          numeroDocumento: "",
          correoElectronico: "",
          telefonoExt: "",
          planta: "",
          contratista: "",
          otro: "",
          dependenciaEmpresa: "",
          aprueba: "SÍ",
          observacion: "",
          autorizaGrabacion: false,
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

  const handleOpenModal = () => {
    const hasMissingFields = formData.asistentesPlan.some(
      (asistente) => !asistente.nombre || !asistente.dependenciaEmpresa
    );
    if (hasMissingFields) {
      setError(
        "Por favor, completa los campos Nombre y Dependencia/Empresa para todos los asistentes antes de continuar."
      );
      return;
    }
    setAsistenciaData(
      formData.asistentesPlan.map((asistente) => ({ ...asistente }))
    );
    setShowModal(true);
  };

  const handleAsistenciaChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setAsistenciaData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: newValue };
      return updated;
    });
  };

  const addAsistenciaRow = () => {
    setAsistenciaData((prev) => [
      ...prev,
      {
        nombre: "",
        numeroDocumento: "",
        planta: "",
        contratista: "",
        otro: "",
        dependenciaEmpresa: "",
        correoElectronico: "",
        telefonoExt: "",
        autorizaGrabacion: false,
        firmaParticipacion: "",
      },
    ]);
  };

  const handleModalConfirm = () => {
    const hasEmptyRequiredFields = asistenciaData.some(
      (asistente) =>
        !asistente.nombre ||
        !asistente.numeroDocumento ||
        !asistente.firmaParticipacion ||
        !asistente.dependenciaEmpresa // Validación adicional
    );
    if (hasEmptyRequiredFields) {
      setError(
        "Todos los campos obligatorios (Nombre, Número de Documento, Dependencia/Empresa y Firma) deben estar llenos."
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      asistentesPlan: asistenciaData.map((asistente) => ({
        ...asistente,
        aprueba: asistente.aprueba || "SÍ",
        observacion: asistente.observacion || "",
      })),
    }));
    setShowModal(false);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No se ha identificado al instructor");
      console.log("Datos a enviar (frontend):", formData);
      const response = await axios.post(
        `http://localhost:8080/api/planMejoramientos/${idAprendiz}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Respuesta del backend:", response);
      setSuccess(true);
      setTimeout(() => navigate(`/aprendices/${idAprendiz}`), 2000);
    } catch (err) {
      console.error("Error completo:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFechaModal = (fecha) => {
    const date = new Date(fecha);
    return {
      dia: date.getDate(),
      mes: date.toLocaleString("default", { month: "long" }),
      anio: date.getFullYear(),
    };
  };
  const fechaModal = formatFechaModal(formData.fecha);

  return (
    <div className="formato-sena-container">
      <div className="header-with-logo">
        <img src={logoSena} alt="Logo SENA" className="sena-logo" />
        <h1 className="document-title">
          SERVICIO NACIONAL DE APRENDIZAJE SENA
          <br />
          FORMATO DE PLAN DE MEJORAMIENTO
        </h1>
      </div>

      <div className="document-header">
        {/* <span className="version">Versión: {formData.version}</span>
        <span className="codigo">Código: {formData.codigo}</span> */}
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
                onChange={(value) => setFormData({ ...formData, agenda: value })}
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
                onChange={(value) => setFormData({ ...formData, objetivos: value })}
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
                onChange={(value) => setFormData({ ...formData, desarrollo: value })}
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
                onChange={(value) => setFormData({ ...formData, conclusiones: value })}
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
                      onChange={(e) => handleChange(e, index, "compromisosPlan")}
                      placeholder="Actividad o decisión"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="fecha"
                      value={compromiso.fecha}
                      onChange={(e) => handleChange(e, index, "compromisosPlan")}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="responsable"
                      value={compromiso.responsable}
                      onChange={(e) => handleChange(e, index, "compromisosPlan")}
                      placeholder="Nombre del responsable"
                      readOnly // El responsable se llena automáticamente con el nombre del aprendiz
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="firmaParticipacion"
                      value={compromiso.firmaParticipacion}
                      onChange={(e) => handleChange(e, index, "compromisosPlan")}
                      placeholder="Firma o participación virtual"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botón de agregar compromiso eliminado */}
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
                      readOnly={index < 2} // Aprendiz e Instructor de solo lectura
                      required
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
                      required
                    />
                  </td>
                  <td>
                    <select
                      name="aprueba"
                      value={asistente.aprueba}
                      onChange={(e) => handleChange(e, index, "asistentesPlan")}
                      
                    >
                      <option disabled>Seleccione</option>
                      <option value="">SÍ</option>
                      <option value="">NO</option>
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
                          alert("No se puede eliminar al aprendiz ni al instructor");
                        } else if (window.confirm("¿Estás seguro de eliminar este asistente?")) {
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
            {loading ? "Guardando..." : "Guardar Plan"}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Plan guardado correctamente!</div>}

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
                    onChange={(value) =>
                      setFormData({ ...formData, objetivos: value })
                    }
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
                        <select
                          name="planta"
                          value={asistente.planta}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          required
                        >
                          <option disabled value="">Seleccione</option>
                          <option value="SÍ">SÍ</option>
                          <option value="NO">NO</option>
                        </select>
                      </td>
                      <td>
                        <select
                          name="contratista"
                          value={asistente.contratista}
                          onChange={(e) => handleAsistenciaChange(e, index)}
                          required
                        >
                          <option disabled value="">Seleccione</option>
                          <option value="SÍ">SÍ</option>
                          <option value="NO">NO</option>
                        </select>
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
                {loading ? "Guardando..." : "Confirmar y Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgregarPlanMejoramiento;