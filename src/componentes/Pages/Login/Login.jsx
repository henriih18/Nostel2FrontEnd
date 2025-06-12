import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/login`, {
        correo,
        contrasena,
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

      setLoading(false);

      const { token, rol, correo: correoResp, nombreCompleto, idUsuario } = response.data;

      if (token && rol) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);
        sessionStorage.setItem("idUsuario", idUsuario);

        onLogin(token);

        alert("Bienvenido " + rol);

         /* const rutasPorRol = {
          ROLE_APRENDIZ: `/aprencides/${idAprendiz}`,
          ROLE_INSTRUCTOR: "/",
          ROLE_ADMIN: "/",
        };

        navigate(rutasPorRol[rol] || "/");  */
      } else {
        alert("Respuesta del servidor inválida.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error de login:", error);

      if (error.response) {
        console.error("Detalles del error:", error.response.status, error.response.data);
      }

      alert("Credenciales incorrectas o error de servidor.");
    }
  };

  return (
    <div className="PrincipalContainer">
      <div className="loginContainer">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="loginForm">
          <div>
            <label htmlFor="correo">Correo:</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
        <ul className="registro">
          <li>
            <NavLink to="/registroAprendiz">Registrarse</NavLink>
            <NavLink to="/forgot-password">Recuperar Contraseña</NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};




/* 


import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./Login.css";

export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Estados para el modal de bienvenida
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [nextRoute, setNextRoute] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo || !contrasena) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { correo, contrasena },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setLoading(false);

      // Extraemos rol y nombreCompleto de la respuesta
      const { token, rol, correo: correoResp, nombreCompleto, idUsuario } =
        response.data;

      if (token && rol) {
        // Guardamos en sessionStorage
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);
        sessionStorage.setItem("idUsuario", idUsuario);

        onLogin(token);

        // Aquí definimos el mensaje y mostramos el modal (3 segundos)
        setWelcomeMessage(`¡Bienvenido ${rol}, ${nombreCompleto}!`);
        

        // Mapeo de rutas según rol (si lo necesitas)
        const rutasPorRol = {
          ROLE_APRENDIZ: "/aprendices/:idApreniz",
          ROLE_INSTRUCTOR: "/",
          ROLE_ADMIN: "/",
        };
        setNextRoute(rutasPorRol[rol] || "/");
        setShowWelcomeModal(true);
      } else {
        alert("Respuesta del servidor inválida.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error de login:", error);
      if (error.response) {
        console.error(
          "Detalles del error:",
          error.response.status,
          error.response.data
        );
      }
      alert("Credenciales incorrectas o error de servidor.");
    }
  };

  // Cuando se muestre el modal, autoocultarlo tras 3 segundos
  useEffect(() => {
    if (showWelcomeModal) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeModal, nextRoute, navigate]);

  const closeWelcomeModal = () => {
    setShowWelcomeModal(false);
     if (nextRoute) {
      navigate(nextRoute);
     }
  };

  return (
    <div className="PrincipalContainer">
      <div className="loginContainer">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="loginForm">
          <div>
            <label htmlFor="correo">Correo:</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="contrasena">Contraseña:</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
        <ul className="registro">
          <li>
            <NavLink to="/registroAprendiz">Registrarse</NavLink>
            <NavLink to="/recuperarContrasena">Recuperar Contraseña</NavLink>
          </li>
        </ul>
      </div>

      
      {showWelcomeModal && (
        <div className="overlay-modal">
          <div className="modal-content">
            <h2>{welcomeMessage}</h2>
            <button onClick={closeWelcomeModal}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
};
 */