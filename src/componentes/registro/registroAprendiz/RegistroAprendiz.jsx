import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistroAprendiz.css";

export const RegistroAprendiz = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;



  useEffect(() => {
    const cargarFichas = async () => {
      try {
        const response = await axios.get(`${API_URL}/fichas/disponibles`);
        
        console.log("Respuesta de fichas:", response.data);
        setFichas(response.data);
      } catch (error) {
        console.error("Error cargando fichas:", error);
        if (error.response) {
          console.error(
            "Detalles del error:",
            error.response.status,
            error.response.data
          );
          setErrores({
            general: `Error al cargar fichas: ${error.response.status}`,
          });
        } else {
          setErrores({
            general: "No se pudo conectar al servidor para cargar fichas.",
          });
        }
      }
    };
    cargarFichas();
  }, []);

  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    correo: "",
    genero: "",
    contrasena: "",
    telefono: "",
    residencia: "",
    numeroFicha: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFocus = (e) => {
    setErrores((prevErrores) => ({
      ...prevErrores,
      [e.target.name]: "",
    }));
  };

  const validarFormulario = () => {
    let erroresNuevos = {};

    if (!formData.tipoDocumento)
      erroresNuevos.tipoDocumento = "Seleccione un tipo de documento.";
    if (!formData.documento)
      erroresNuevos.documento = "Ingrese un número de documento.";
    if (!formData.nombres.trim()) erroresNuevos.nombres = "Ingrese su nombre.";
    if (!formData.apellidos.trim())
      erroresNuevos.apellidos = "Ingrese sus apellidos.";
    if (!formData.fechaNacimiento)
      erroresNuevos.fechaNacimiento = "Seleccione su fecha de nacimiento.";

    if (!formData.correo.trim()) {
      erroresNuevos.correo = "Ingrese su correo electrónico.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      erroresNuevos.correo = "Ingrese un correo válido.";
    }

    if (!formData.contrasena.trim()) {
      erroresNuevos.contrasena = "Ingrese una contraseña.";
    } else if (formData.contrasena.length < 8) {
      erroresNuevos.contrasena =
        "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!formData.telefono.trim()) {
      erroresNuevos.telefono = "Ingrese un número de teléfono.";
    } else if (!/^\d+$/.test(formData.telefono)) {
      erroresNuevos.telefono = "El teléfono debe contener solo números.";
    }

    if (!formData.genero) erroresNuevos.genero = "Seleccione un género.";
    if (!formData.residencia.trim())
      erroresNuevos.residencia = "Ingrese su dirección de residencia.";
    if (!formData.numeroFicha)
      erroresNuevos.numeroFicha = "Seleccione una ficha.";

    setErrores(erroresNuevos);

    return Object.keys(erroresNuevos).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Resetear errores antes de la validación
    setErrores({});

    // Validar formulario y retornar si hay errores
    if (!validarFormulario()) {
      console.log("Errores de validación:", errores);
      return;
    }

    setLoading(true);

    try {
      console.log("Datos enviados:", formData);
      await axios.post(`${API_URL}/aprendices/RegistroAprendiz`, formData);
      alert("Registro exitoso.");
      // Enviar correo utilizando la función de Azure
      await enviarCorreo(formData.correo);
      navigate("/login");
    } catch (error) {
      console.error("Error en la respuesta:", error.response);

      if (error.response && error.response.data) {
        // Capturar todos los errores de validación del backend
        const data = error.response.data;

        // Si la respuesta es un objeto con campos específicos de error
        if (typeof data === "object") {
          const nuevosErrores = {};

          // Recorrer todas las propiedades del objeto de error
          Object.keys(data).forEach((campo) => {
            nuevosErrores[campo] = data[campo];
          });

          // Si hay errores generales que no corresponden a un campo específico
          if (data.message || data.error) {
            nuevosErrores.general = data.message || data.error;
          }

          setErrores(nuevosErrores);
          console.log("Errores del backend:", nuevosErrores);
        }
        // Si la respuesta es un mensaje de error general
        else if (typeof data === "string") {
          setErrores({ general: data });
        }
        // Si no podemos interpretar la respuesta
        else {
          setErrores({ general: "Ocurrió un error desconocido." });
        }
      } else {
        setErrores({ general: "No se pudo conectar al servidor." });
      }
    }
    setLoading(false);
  };

  const enviarCorreo = async (correo) => {
    if (!correo) {
      console.error("El correo es inválido.");
      return;
    }

    try {
      const emailData = {
        subject: "Registro Exitoso",
        to: correo,
        dataTemplate: { name: formData.nombres || "Usuario" },
        template: "registro.html",
      };

      await axios.post("https://nostel.up.railway.app/httpTrigger1", emailData);
      console.log("Correo enviado exitosamente");
    } catch (error) {
      console.error(
        "Error al enviar el correo:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="registro-container">
      <h1 className="login-title">Registro de Aprendiz</h1>

      <form onSubmit={handleSubmit} className="registro-form">
        {/* Sección de Información Personal */}
        <div className="form-section">
          <h2 className="form-section-title">Información Personal</h2>

          <div className="form-row">
            <div className="field-group-pair">
              <div className="field-group">
                <label htmlFor="tipoDocumento">Tipo de Documento</label>
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className="tipoDocSel"
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  <option value="CEDULA_CIUDADANIA">
                    Cédula de Ciudadanía
                  </option>
                  <option value="TARJETA_IDENTIDAD">
                    Tarjeta de Identidad
                  </option>
                  <option value="CEDULA_EXTRANJERIA">
                    Cédula de Extranjería
                  </option>
                  <option value="PASAPORTE">Pasaporte</option>
                </select>
                {errores.tipoDocumento && (
                  <p className="error">{errores.tipoDocumento}</p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="documento">Número de Documento</label>
                <input
                  id="documento"
                  type="number"
                  name="documento"
                  placeholder="Ingrese número"
                  value={formData.documento}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.documento && (
                  <p className="error">{errores.documento}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group-pair">
              <div className="field-group">
                <label htmlFor="nombres">Nombres</label>
                <input
                  id="nombres"
                  type="text"
                  name="nombres"
                  placeholder="Ingrese nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.nombres && <p className="error">{errores.nombres}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  id="apellidos"
                  type="text"
                  name="apellidos"
                  placeholder="Ingrese apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.apellidos && (
                  <p className="error">{errores.apellidos}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group-pair">
              <div className="field-group">
                <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.fechaNacimiento && (
                  <p className="error">{errores.fechaNacimiento}</p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="genero">Género</label>
                <select
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  onFocus={handleFocus}
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
                {errores.genero && <p className="error">{errores.genero}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Contacto */}
        <div className="form-section">
          <h2 className="form-section-title">Información de Contacto</h2>

          <div className="form-row">
            <div className="field-group-pair">
              <div className="field-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  placeholder="ejemplo@correo.com"
                  value={formData.correo}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.correo && <p className="error">{errores.correo}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  name="telefono"
                  placeholder="Número de teléfono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onFocus={handleFocus}
                />
                {errores.telefono && (
                  <p className="error">{errores.telefono}</p>
                )}
              </div>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="residencia">Dirección de Residencia</label>
            <input
              id="residencia"
              type="text"
              name="residencia"
              placeholder="Dirección completa"
              value={formData.residencia}
              onChange={handleChange}
              onFocus={handleFocus}
            />
            {errores.residencia && (
              <p className="error">{errores.residencia}</p>
            )}
          </div>
        </div>

        {/* Sección de Acceso y Programa */}
        <div className="form-section">
          <h2 className="form-section-title">Acceso y Programa</h2>

          <div className="field-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              placeholder="Mínimo 8 caracteres"
              value={formData.contrasena}
              onChange={handleChange}
              onFocus={handleFocus}
            />
            {errores.contrasena && (
              <p className="error">{errores.contrasena}</p>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="numeroFicha">Ficha de Programa</label>
            <select
              id="numeroFicha"
              name="numeroFicha"
              value={formData.numeroFicha}
              onChange={handleChange}
              onFocus={handleFocus}
            >
              <option value="" disabled>
                Seleccione su ficha
              </option>

              {fichas.map((ficha) => (
                <option
                  key={ficha.idFicha}
                  value={ficha.numeroFicha}
                >{`${ficha.numeroFicha} - ${ficha.nombrePrograma}`}</option>
              ))}
            </select>
            {errores.numeroFicha && (
              <p className="error">{errores.numeroFicha}</p>
            )}
          </div>
        </div>

        {/* Mensajes de error generales */}
        {errores.general && (
          <p className="error general-error">{errores.general}</p>
        )}

        {/* Botón de envío */}
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Completar Registro"}
        </button>
      </form>
    </div>
  );
};
