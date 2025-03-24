
import React, { useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from 'react-router-dom';
import "./Login.css";

export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // URL correcta con el context-path configurado
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        correo: correo,
        contrasena: contrasena,
      });

      const { token, rol, correo: correoResp, nombreCompleto } = response.data;

      if (token && rol) {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("rol", rol);
        sessionStorage.setItem("correo", correoResp);
        sessionStorage.setItem("nombre", nombreCompleto);

        onLogin(token);

        setTimeout(() => {
          if (rol === "ROLE_APRENDIZ") {
            alert("Bienvenido " + rol);
            navigate("/aprendices");
          } else if (rol === "ROLE_INSTRUCTOR") {
            alert("Bienvenido " + rol);
            navigate("/instructor");
          } else if (rol === "ROLE_ADMIN") {
            alert("Bienvenido " + rol);
            navigate("/admin");
          } else {
            alert("Rol desconocido, acceso restringido.");
          }
        });
      } else {
        alert("Respuesta del servidor inválida.");
      }
    } catch (error) {
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
              <label>Correo:</label>
              <input type="text" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </div>
            <div>
              <label>Contraseña:</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            </div>
            <button type="submit">Iniciar Sesión</button>
          </form>
          <ul className="registro">
            <li><NavLink to={"/registroAprendiz"}>Registrarse</NavLink></li>
          </ul>
        </div>
      </div>
  );
};

