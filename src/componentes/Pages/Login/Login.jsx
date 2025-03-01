import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { NavLink } from 'react-router-dom'

export const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("datos enviados", { correo, contrasena });
    try {
      // Enviar la petición al backend
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        correo: correo,
        contrasena: contrasena,
      });


      const { token, role, correo: correoResp, nombreCompleto } = response.data;

      // Guardar en localStorage para usarlo en peticiones futuras
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("correo", correoResp);
      localStorage.setItem("nombre", nombreCompleto);


      onLogin(true);

      if (role === "ROLE_APRENDIZ") {
        window.location.href = "/aprendices";
        alert("Bienvenido", role)
      } else if (role === "ROLE_INSTRUCTOR") {
        window.location.href = "/instructor";
          alert("Bienvenido", role)
      }
    } catch (error) {
      alert("Credenciales incorrectas o error de servidor");
    }
  };

  return (
    <div className="PrincipalContainer">
      <div className="loginContainer">
        <h1>Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="loginForm">
          <div>
            <label>Correo:</label>
            <input
              type="text"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
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


/*
* que guarde el token en el localStorage
* */