/* 

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistroAprendiz.css";

export const RegistroAprendiz = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarFichas = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/fichas");
        setFichas(response.data);
      } catch (error) {
        console.error("Error cargando fichas:", error);
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
    } else if (formData.contrasena.length < 6) {
      erroresNuevos.contrasena =
        "La contraseña debe tener al menos 6 caracteres.";
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

      await axios.post("http://localhost:8080/api/aprendices", formData);
      alert("Registro exitoso.");
      // Enviar correo utilizando la función de Azure
      await enviarCorreo(formData.correo);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const data = error.response.data;

        if (data.correo) {
          setErrores({ correo: data.correo }); // Mensaje del backend
        } else if (data.documento) {
          setErrores({ documento: data.documento });
        } else if (data.general) {
          setErrores({ general: data.general });
        } else {
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
        dataTemplate: { name: formData.nombres || "Usuario" }, // Evitar errores si `nombres` es undefined
        template: "registro.html",
      };

      await axios.post("http://localhost:7071/api/httpTrigger1", emailData);
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
      <h1>Registro de Aprendiz</h1>
      <form onSubmit={handleSubmit} className="registro-form">
        <div>
          <div className="tipoDoc">
            <label htmlFor="tipoDocumento">Documento</label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              onFocus={handleFocus}
              className="tipoDocSel"
            >
              <option value="" disabled>
                Tipo de documento
              </option>
              <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
              <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            {errores.tipoDocumento && (
              <p className="error">{errores.tipoDocumento}</p>
            )}
          </div>

          <input
            type="number"
            name="documento"
            placeholder="Número de documento"
            value={formData.documento}
            onChange={handleChange}
            onFocus={handleFocus}
            className="docNumber"
          />
          {errores.documento && <p className="error">{errores.documento}</p>}
        </div>

        <div className="regName">
          <label>Nombres</label>
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.nombres && <p className="error">{errores.nombres}</p>}
        </div>

        <div>
          <label>Apellidos</label>
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.apellidos && <p className="error">{errores.apellidos}</p>}
        </div>

        <div>
          <label>Fecha de Nacimiento</label>
          <input
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

        <div>
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.correo && <p className="error">{errores.correo}</p>}
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.contrasena && <p className="error">{errores.contrasena}</p>}
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.telefono && <p className="error">{errores.telefono}</p>}
        </div>

        <div>
          <label htmlFor="genero">Género</label>
          <select
            id="genero"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            onFocus={handleFocus}
          >
            <option value="" disabled>
              Seleccionar Género
            </option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errores.genero && <p className="error">{errores.genero}</p>}
        </div>

        <div>
          <label>Residencia</label>
          <input
            type="text"
            name="residencia"
            placeholder="Residencia"
            value={formData.residencia}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.residencia && <p className="error">{errores.residencia}</p>}
        </div>

        <div>
          <label>Ficha</label>
          <select
            name="numeroFicha"
            value={formData.numeroFicha}
            onChange={handleChange}
            onFocus={handleFocus}
            className="opciones"
          >
            <option value="" disabled>
              Seleccione su ficha
            </option>

            {fichas.map((ficha) => (
              <option
                key={ficha.idFicha}
                value={ficha.numeroFicha}
                className="opciones"
              >{`${ficha.numeroFicha} ${ficha.nombrePrograma}`}</option>
            ))}
          </select>
          {errores.numeroFicha && (
            <p className="error">{errores.numeroFicha}</p>
          )}
        </div>

        {errores.general && <p className="error general-error">{errores.general}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrandose..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};
 */

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistroAprendiz.css";

export const RegistroAprendiz = () => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState([]);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarFichas = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/fichas");
        setFichas(response.data);
      } catch (error) {
        console.error("Error cargando fichas:", error);
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
      await axios.post("http://localhost:8080/api/aprendices", formData);
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
        if (typeof data === 'object') {
          const nuevosErrores = {};
          
          // Recorrer todas las propiedades del objeto de error
          Object.keys(data).forEach(campo => {
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
        else if (typeof data === 'string') {
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
        dataTemplate: { name: formData.nombres || "Usuario" }, // Evitar errores si `nombres` es undefined
        template: "registro.html",
      };

      await axios.post("http://localhost:7071/api/httpTrigger1", emailData);
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
      <h1>Registro de Aprendiz</h1>
      <form onSubmit={handleSubmit} className="registro-form">
        <div>
          <div className="tipoDoc">
            <label htmlFor="tipoDocumento">Documento</label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              onFocus={handleFocus}
              className="tipoDocSel"
            >
              <option value="" disabled>
                Tipo de documento
              </option>
              <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
              <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
              <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
            {errores.tipoDocumento && (
              <p className="error">{errores.tipoDocumento}</p>
            )}
          </div>

          <input
            type="number"
            name="documento"
            placeholder="Número de documento"
            value={formData.documento}
            onChange={handleChange}
            onFocus={handleFocus}
            className="docNumber"
          />
          {errores.documento && <p className="error">{errores.documento}</p>}
        </div>

        <div className="regName">
          <label>Nombres</label>
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.nombres && <p className="error">{errores.nombres}</p>}
        </div>

        <div>
          <label>Apellidos</label>
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={formData.apellidos}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.apellidos && <p className="error">{errores.apellidos}</p>}
        </div>

        <div>
          <label>Fecha de Nacimiento</label>
          <input
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

        <div>
          <label>Correo</label>
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.correo && <p className="error">{errores.correo}</p>}
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.contrasena && <p className="error">{errores.contrasena}</p>}
        </div>

        <div>
          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.telefono && <p className="error">{errores.telefono}</p>}
        </div>

        <div>
          <label htmlFor="genero">Género</label>
          <select
            id="genero"
            name="genero"
            value={formData.genero}
            onChange={handleChange}
            onFocus={handleFocus}
          >
            <option value="" disabled>
              Seleccionar Género
            </option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errores.genero && <p className="error">{errores.genero}</p>}
        </div>

        <div>
          <label>Residencia</label>
          <input
            type="text"
            name="residencia"
            placeholder="Residencia"
            value={formData.residencia}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errores.residencia && <p className="error">{errores.residencia}</p>}
        </div>

        <div>
          <label>Ficha</label>
          <select
            name="numeroFicha"
            value={formData.numeroFicha}
            onChange={handleChange}
            onFocus={handleFocus}
            className="opciones"
          >
            <option value="" disabled>
              Seleccione su ficha
            </option>

            {fichas.map((ficha) => (
              <option
                key={ficha.idFicha}
                value={ficha.numeroFicha}
                className="opciones"
              >{`${ficha.numeroFicha} ${ficha.nombrePrograma}`}</option>
            ))}
          </select>
          {errores.numeroFicha && (
            <p className="error">{errores.numeroFicha}</p>
          )}
        </div>

        {errores.general && <p className="error general-error">{errores.general}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registrandose..." : "Registrarse"}
        </button>
      </form>
    </div>
  );    }