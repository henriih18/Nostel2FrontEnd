import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Heart,
} from "lucide-react";
import "./Login.css";
import logoNostel from "../../../assets/images/logoNostelN.png";
import { toast } from "react-toastify";



export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [inputError, setInputError] = useState({
    correo: false,
    contrasena: false,
  });
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    /* setInputError(true); */

    const camposVacios = {
      correo: !correo,
      contrasena: !contrasena,
    };

    if (camposVacios.correo || camposVacios.contrasena) {
      setInputError(camposVacios);
      toast.warn("Por favor, completa todos los campos.");

      /* setError("Por favor, completa todos los campos."); */
      return;
    }

    setInputError({ correo: false, contrasena: false });

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          correo,
          contrasena,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);

      const {
        token,
        rol,
        correo: correoResp,
        nombreCompleto,
        idUsuario,
      } = response.data;
      /* console.log("Login response:", response.data); */

      if (token && rol) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);
        sessionStorage.setItem("idUsuario", idUsuario);

        onLogin(token);

        // Mostrar mensaje de bienvenida elegante
        /* setError(""); */

        // Navegar según el rol
        const rutasPorRol = {
          ROLE_APRENDIZ: `/aprendices/${idUsuario}`,
          ROLE_INSTRUCTOR: "/",
          ROLE_ADMIN: "/",
        };

        navigate(rutasPorRol[rol] || "/");
      } else {
        toast.error("Respuesta del servidor invalida");
        /* setError("Respuesta del servidor inválida."); */
      }
    } catch (error) {
      setLoading(false);
      /* console.error("Error de login:", error); */

      if (error.response) {
        /* console.error("Detalles del error:", error.response.status, error.response.data); */
        toast.error(
          "Credenciales incorrectas. Verifica tu correo y contraseña."
        );
        /* setError("Credenciales incorrectas. Verifica tu correo y contraseña."); */
      } else {
        toast.error("Error de conexión. Verifica tu conexión a internet.");
        /* setError("Error de conexión. Verifica tu conexión a internet."); */
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header con logo */}
        <div className="login-header">
          <div className="login-logo">
            <img src={logoNostel} alt="Logo Nostel" className="logo-image" />
          </div>
          <h1 className="login-title">Nostel</h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo de correo */}
          <div className="form-group">
            <label htmlFor="correo">Correo electrónico</label>
            <div className="input-wrapper">
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  if (inputError.correo) {
                    setInputError((prev) => ({ ...prev, correo: false }));
                  }
                }}
                className={`form-input ${
                  inputError.correo ? "input-error" : ""
                }`}
                placeholder="tu@correo.com"
                disabled={loading}
              />
              <Mail className="input-icon" />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="contrasena"
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  if (inputError.contrasena) {
                    setInputError((prev) => ({ ...prev, contrasena: false }));
                  }
                }}
                className={`form-input ${
                  inputError.contrasena ? "input-error" : ""
                }`}
                placeholder="Tu contraseña"
                disabled={loading}
              />
              <Lock className="input-icon" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Mensaje de error */}
          {/* {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )} */}

          {/* Botón de envío */}
          <button type="submit" disabled={loading} className="login-button">
            {loading && <Loader2 className="loading-spinner" />}
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="login-links">
          {/* <NavLink to="/registroAprendiz" className="login-link">
            Registrarse
          </NavLink> */}
          <button
            type="button"
            className="login-link"
            onClick={() => setShowRegistroModal(true)}
          >
            Registrarse
          </button>

          <NavLink to="/forgot-password" className="login-link">
            Recuperar Contraseña
          </NavLink>
        </div>
      </div>
      {showRegistroModal && (
  <div className="modal-overlay-r">
    <div className="modal-content-r">
      <h2>¿Quién se va a registrar?</h2>
      <div className="modal-buttons-r">
        <button
          onClick={() => navigate("/registroAprendiz")}
          className="registro-btn-r"
        >
          Aprendiz
        </button>
        <button
          onClick={() => navigate("/registroInstructor")}
          className="registro-btn-r"
        >
          Instructor
        </button>
      </div>
      <button
        className="close-modal-r"
        onClick={() => setShowRegistroModal(false)}
      >
        Cancelar
      </button>
    </div>
  </div>
)}

    </div>
  );
};
