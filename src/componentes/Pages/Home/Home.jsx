import React from 'react';
import './Home.css';
import logo from '../../../assets/images/logoNostelN.png';

export const Home = () => {
  const rol = sessionStorage.getItem('rol');
  const nombre = sessionStorage.getItem('nombre');

  const mensajes = {
    ROLE_ADMIN: {
      titulo: `¡Bienvenido, Administrador!`,
      subtitulo: 'Gestiona usuarios, instructores y reportes del sistema Nostel.'
    },
    ROLE_INSTRUCTOR: {
      titulo: `¡Hola, Instructor!`,
      subtitulo: 'Consulta tus fichas y asigna tareas a tus aprendices.'
    },
    ROLE_APRENDIZ: {
      titulo: `¡Qué tal, Aprendiz!`,
      subtitulo: 'Revisa tus actividades, planes y comentarios asignados.'
    }
  };

  const { titulo, subtitulo } = mensajes[rol] || {
    titulo: `¡Bienvenido a Nostel!`,
    subtitulo: 'Selecciona una opción del menú para comenzar.'
  };

  // Llenamos con 6 elementos distintos
  const floats = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="home-container">
      {floats.map(i => (
        <img
          key={i}
          src={logo}
          alt="Logo Nostel"
          className={`logo-float float-${i + 1}`}
        />
      ))}

      <div className="welcome-card">
        <h1>{titulo}</h1>
        <p className="subtitle">{subtitulo}</p>
      </div>
    </div>
  );
};
