import React from "react";
import "./Navbar.css";
import logoSenaN from "../../../assets/images/logoNostelN.png";
import { NavLink, useNavigate } from "react-router-dom";

export const Navbar = () => {
  /* const handleLogout = () => {
    console.log("Cerrando sesión...");
    sessionStorage.removeItem("token");
    window.location.reload();
  }; */

  const navigate = useNavigate();
  const handleLogout = () => {
    console.log("Cerrando sesión...");
    sessionStorage.removeItem("token"); // Eliminar el token
    navigate("/login"); // Navegar a la página de login
  };
  return (
    <>
      <nav className="navBar">
        <img src={logoSenaN} alt="" />
        <ul>
          <li>
            <NavLink to="/">Inicio</NavLink>
          </li>
          <li>
            <NavLink to="/gestion-aprendices">Aprendices</NavLink>
          </li>
          <li>
            <NavLink to="/gestion-fichas">Fichas</NavLink>
          </li>
          <li>
            <NavLink to="/gestion-instructores">Instructores</NavLink>
          </li>
          <li>
            <NavLink to="/gestion-programas">Programas</NavLink>
          </li>
          <li>
            <NavLink to="/aboutUs">Acerca de Nosotros</NavLink>
          </li>
        </ul>
        <button className="botonSalir" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>
    </>
  );
};

export default Navbar;
