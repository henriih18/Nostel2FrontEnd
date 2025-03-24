import React from 'react'
import './Navbar.css'
import { NavLink } from 'react-router-dom'

export const Navbar = () => {

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("token"); // Eliminar el token
    window.location.reload(); // Recargar la página para volver al login
  };
  return (
    <nav>
      <ul>
        <li><NavLink to='/'>Inicio</NavLink></li>
        <li><NavLink to='/gestion-aprendices'>Aprendices</NavLink></li>
        <li><NavLink to='/gestion-fichas'>Fichas</NavLink></li>
        <li><NavLink to='/gestion-instructores'>Instructores</NavLink></li>
        <li><NavLink to='/gestion-programas'>Programas</NavLink></li>
        <li><NavLink to='/aboutUs'>Acerca de Nosotros</NavLink></li>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </ul>

    </nav>
  )
}

export default Navbar;