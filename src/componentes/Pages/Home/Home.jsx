import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Users, FileText, CheckCircle, Bell, Calendar, Clock, AlertCircle
} from "lucide-react";
import "./Home.css";
import { toast } from "react-toastify";

export const Home = () => {
  const [userInfo, setUserInfo] = useState({ nombre: "", rol: "" });
  const [stats, setStats] = useState({ aprendices: 1245, instructores: 89, programas: 24, actividades: 156 });
  const [codigoRegistro, setCodigoRegistro] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const nombre = sessionStorage.getItem("nombre") || "Usuario";
    const rol = sessionStorage.getItem("rol") || "ROLE_USER";
    setUserInfo({ nombre, rol });
  }, []);

  // ✅ FUNC: Obtener código desde el backend
  const fetchCodigo = async () => {
    if (userInfo.rol !== "ROLE_ADMIN") return;
    try {
      const res = await fetch(`${API_URL}/instructores/codigo-actual`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener el código");
      const data = await res.json();
      setCodigoRegistro(data.codigo);
      setTiempoRestante(data.segundosRestantes);
    } catch (error) {
      toast.error("No se pudo obtener el código de registro");
    }
  };

  // ✅ Inicial: obtener código al detectar rol admin
  useEffect(() => {
    if (userInfo.rol === "ROLE_ADMIN") {
      fetchCodigo();
    }
  }, [userInfo.rol]);

  // ✅ Temporizador
  useEffect(() => {
    if (typeof tiempoRestante !== "number" || tiempoRestante <= 0) return;

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          fetchCodigo(); // Reiniciar código y tiempo
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoRestante]);

  // ✅ Mensajes de bienvenida
  const getWelcomeMessage = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return { title: "¡Bienvenido, Administrador!", subtitle: "Gestiona usuarios, instructores y reportes del sistema Nostel." };
      case "ROLE_INSTRUCTOR":
        return { title: "¡Hola, Instructor!", subtitle: "Consulta tus fichas y asigna tareas a tus aprendices." };
      case "ROLE_APRENDIZ":
        return { title: "¡Qué tal, Aprendiz!", subtitle: "Revisa tus actividades, planes y comentarios asignados." };
      default:
        return { title: "¡Bienvenido a Nostel!", subtitle: "Selecciona una opción del menú para comenzar." };
    }
  };

  const { title, subtitle } = getWelcomeMessage(userInfo.rol);

  const formatTiempo = (segundos) => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;

  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};


  return (
    <div className="home-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>{title}</h1>
            <p className="welcome-subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* CÓDIGO DE REGISTRO ADMIN */}
      {userInfo.rol === "ROLE_ADMIN" && codigoRegistro && (
        <div className="admin-code-box">
          <h3 className="titleCodigo">Código de registro:</h3>
          <p className="codigo-text">{codigoRegistro}</p>
          <p className="tiempo-texto">Tiempo restante: {formatTiempo(tiempoRestante)}</p>

          {/* <p className="tiempo-texto">Tiempo restante: {tiempoRestante}s</p> */}
          {/* <div
            key={`${codigoRegistro}-${tiempoRestante}`}
            className="progreso-borde"
            style={{ animationDuration: `${tiempoRestante}s` }}
          ></div> */}
        </div>
      )}
    </div>
  );
};
