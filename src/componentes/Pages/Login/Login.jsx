import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Heart } from "lucide-react";
import "./Login.css";
import logoNostel from "../../../assets/images/logoNostelN.png";

export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo || !contrasena) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      /* // Simulación de login exitoso para demostración
      if (correo === "admin@sena.edu.co" && contrasena === "Admin123!") {
        setLoading(false);
        
        // Simular datos de respuesta exitosa
        const mockResponse = {
          token: "mock-jwt-token-12345",
          rol: "ROLE_ADMIN",
          correo: correo,
          nombreCompleto: "Administrador Sistema",
          idUsuario: "admin-001"
        };

        const { token, rol, correo: correoResp, nombreCompleto, idUsuario } = mockResponse;

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);
        sessionStorage.setItem("idUsuario", idUsuario);

        onLogin(token);
        setError("");
        
        // Navegar al dashboard
        navigate("/");
        return;
      } */

      const response = await axios.post(`${API_URL}/auth/login`, {
        correo,
        contrasena,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);

      const { token, rol, correo: correoResp, nombreCompleto, idUsuario } = response.data;
      console.log("Login response:", response.data);

      if (token && rol) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);
        sessionStorage.setItem("idUsuario", idUsuario);

        onLogin(token);

        // Mostrar mensaje de bienvenida elegante
        setError("");
        
        // Navegar según el rol
        const rutasPorRol = {
          ROLE_APRENDIZ: `/aprendices/${idUsuario}`,
          ROLE_INSTRUCTOR: "/",
          ROLE_ADMIN: "/",
        };

        navigate(rutasPorRol[rol] || "/");
      } else {
        setError("Respuesta del servidor inválida.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error de login:", error);

      if (error.response) {
        console.error("Detalles del error:", error.response.status, error.response.data);
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
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
                onChange={(e) => setCorreo(e.target.value)}
                className="form-input"
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
                onChange={(e) => setContrasena(e.target.value)}
                className="form-input"
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
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )}

          {/* Botón de envío */}
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading && <Loader2 className="loading-spinner" />}
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="login-links">
          <NavLink to="/registroAprendiz" className="login-link">
            Registrarse
          </NavLink>
          <NavLink to="/forgot-password" className="login-link">
            Recuperar Contraseña
          </NavLink>
        </div>
      </div>
    </div>
  );
};

