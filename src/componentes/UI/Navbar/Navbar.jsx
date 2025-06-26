/* 
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  Info,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";
import logoNostel from "../../../assets/images/logoNostelN.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    rol: "",
    correo: "",
  });

  const navigate = useNavigate();

  const capitalizarNombre = (nombre) => {
    if (!nombre) return "";
    return nombre
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const rol = sessionStorage.getItem("rol");
    const correo = sessionStorage.getItem("correo");
    const idUsuario = sessionStorage.getItem("idUsuario");
    const token = sessionStorage.getItem("token");

    const obtenerNombre = async () => {
      try {
        let endpoint = "";

        switch (rol) {
          case "ROLE_APRENDIZ":
            endpoint = `http://localhost:8080/aprendices/usuario/${idUsuario}`;
            break;
          case "ROLE_INSTRUCTOR":
            endpoint = `http://localhost:8080/instructores/usuario/${idUsuario}`;
            break;
          default:
            return;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const nombre = `${data.nombres} ${data.apellidos}` || "Usuario";
        const nombreFormateado = capitalizarNombre(nombre);

        setUserInfo({ nombre: nombreFormateado, rol, correo });
      } catch (error) {
        console.error("Error al obtener nombre del usuario:", error);
        setUserInfo({ nombre: "Usuario", rol, correo });
      }
    };

    if (rol && idUsuario) {
      obtenerNombre();
    }
  }, []);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    sessionStorage.clear();
    navigate("/login");
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const closeNavbar = () => {
    setIsOpen(false);
  };

  const formatRole = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "Administrador";
      case "ROLE_INSTRUCTOR":
        return "Instructor";
      case "ROLE_APRENDIZ":
        return "Aprendiz";
      
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = [
    {
      section: "Principal",
      items: [
        { to: "/", icon: Home, label: "Inicio" },
        ...(userInfo.rol === "ROLE_ADMIN"
          ? [
              { to: "/gestion-aprendices", icon: Users, label: "Aprendices" },
              { to: "/gestion-fichas", icon: BookOpen, label: "Fichas" },
              {
                to: "/gestion-instructores",
                icon: UserCheck,
                label: "Instructores",
              },
              {
                to: "/gestion-programas",
                icon: GraduationCap,
                label: "Programas",
              },
            ]
          : userInfo.rol === "ROLE_INSTRUCTOR"
          ? [
              {
                to: "/gestion-aprendices",
                icon: Users,
                label: "Aprendices",
              },
              {
                to: "/perfil-instructor",
                icon: UserCheck,
                label: "Mi Perfil",
              },
            ]
          : userInfo.rol === "ROLE_APRENDIZ"
          ? [
              {
                to: "/perfil-aprendiz",
                icon: Users,
                label: "Mi Perfil",
              },
            ]
          : []),
      ],
    },
    {
      section: "Sistema",
      items: [{ to: "/about-us", icon: Info, label: "Acerca de Nosotros" }],
    },
  ];

  return (
    <div className="navbar">
      <button
        className="navbar-mobile-toggle"
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`navbar-mobile-overlay ${isOpen ? "active" : ""}`}
        onClick={closeNavbar}
      />

      <nav className={`navbar-container ${isOpen ? "active" : ""}`}>
        <div className="navbar-header">
          <div className="navbar-logo">
            <div>
              <img src={logoNostel} alt="Logo Nostel" className="logo-image" />
            </div>
            <div>
              <div className="navbar-title">Nostel</div>
            </div>
          </div>

          <div className="user-info">
            <div className="user-avatar">{getInitials(userInfo.nombre)}</div>
            <div className="user-name">{userInfo.nombre}</div>
            <div className="user-role">{formatRole(userInfo.rol)}</div>
          </div>
        </div>

        <div className="navbar-nav">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <ul className="nav-list">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="nav-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={closeNavbar}
                    >
                      <item.icon className="nav-icon" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="navbar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
 */

/* import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  Info,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";
import logoNostel from "../../../assets/images/logoNostelN.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    rol: "",
    correo: "",
  });

  const navigate = useNavigate();

  const capitalizarNombre = (nombre) => {
    if (!nombre) return "";
    return nombre
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const rol = sessionStorage.getItem("rol");
    const correo = sessionStorage.getItem("correo");
    const idUsuario = sessionStorage.getItem("idUsuario");
    const token = sessionStorage.getItem("token");

    const obtenerNombre = async () => {
      try {
        let endpoint = "";

        switch (rol) {
          case "ROLE_APRENDIZ":
            endpoint = `http://localhost:8080/aprendices/usuario/${idUsuario}`;
            break;
          case "ROLE_INSTRUCTOR":
            endpoint = `http://localhost:8080/instructores/usuario/${idUsuario}`;
            break;
          case "ROLE_ADMIN":
            endpoint = `http://localhost:8080/admins/usuario/${idUsuario}`;
            break;
          default:
            return;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const nombre = `${data.nombres} ${data.apellidos}` || "Usuario";
        const nombreFormateado = capitalizarNombre(nombre);

        setUserInfo({ nombre: nombreFormateado, rol, correo });
      } catch (error) {
        console.error("Error al obtener nombre del usuario:", error);
        setUserInfo({ nombre: "Usuario", rol, correo });
      }
    };

    if (rol && idUsuario) {
      obtenerNombre();
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const toggleNavbar = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);

  const formatRole = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "Administrador";
      case "ROLE_INSTRUCTOR":
        return "Instructor";
      case "ROLE_APRENDIZ":
        return "Aprendiz";
      default:
        return "Usuario";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = [
    {
      section: "Principal",
      items: [
        { to: "/", icon: Home, label: "Inicio" },
        ...(userInfo.rol === "ROLE_ADMIN"
          ? [
              { to: "/gestion-aprendices", icon: Users, label: "Aprendices" },
              { to: "/gestion-fichas", icon: BookOpen, label: "Fichas" },
              { to: "/gestion-instructores", icon: UserCheck, label: "Instructores" },
              { to: "/gestion-programas", icon: GraduationCap, label: "Programas" },
            ]
          : userInfo.rol === "ROLE_INSTRUCTOR"
          ? [
              { to: "/gestion-aprendices", icon: Users, label: "Aprendices" },
              { to: "/gestion-fichas", icon: BookOpen, label: "Fichas" },
              { to: "/perfil-instructor", icon: UserCheck, label: "Mi Perfil" },
            ]
          : userInfo.rol === "ROLE_APRENDIZ"
          ? [
              { to: "/perfil-aprendiz", icon: Users, label: "Mi Perfil" },
            ]
          : []),
      ],
    },
    {
      section: "Sistema",
      items: [{ to: "/about-us", icon: Info, label: "Acerca de Nosotros" }],
    },
  ];

  return (
    <div className="navbar">
      <button
        className="navbar-mobile-toggle"
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`navbar-mobile-overlay ${isOpen ? "active" : ""}`}
        onClick={closeNavbar}
      />

      <nav className={`navbar-container ${isOpen ? "active" : ""}`}>
        <div className="navbar-header">
          <div className="navbar-logo">
            <img src={logoNostel} alt="Logo Nostel" className="logo-image" />
            <div className="navbar-title">Nostel</div>
          </div>

          <div className="user-info">
            <div className="user-avatar">{getInitials(userInfo.nombre)}</div>
            <div className="user-name">{userInfo.nombre}</div>
            <div className="user-role">{formatRole(userInfo.rol)}</div>
          </div>
        </div>

        <div className="navbar-nav">
          {navigationItems.map((section, i) => (
            <div key={i} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <ul className="nav-list">
                {section.items.map((item, j) => (
                  <li key={j} className="nav-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                      onClick={closeNavbar}
                    >
                      <item.icon className="nav-icon" />
                      <span>{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="navbar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar; */

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  Info,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "./Navbar.css";
import logoNostel from "../../../assets/images/logoNostelN.png";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    rol: "",
    correo: "",
    idUsuario: "",
    idAprendiz: "",
    idInstructor: "",
  });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const capitalizarNombre = (nombre) => {
    if (!nombre) return "";
    return nombre
      .toLowerCase()
      .split(" ")
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const rol = sessionStorage.getItem("rol");
    const correo = sessionStorage.getItem("correo");
    const idUsuario = sessionStorage.getItem("idUsuario");
    const token = sessionStorage.getItem("token");

    const obtenerNombre = async () => {
      try {
        let endpoint = "";

        switch (rol) {
          case "ROLE_APRENDIZ":
            endpoint = `${API_URL}/aprendices/usuario/${idUsuario}`;
            break;
          case "ROLE_INSTRUCTOR":
            endpoint = `${API_URL}/instructores/usuario/${idUsuario}`;
            break;
          case "ROLE_ADMIN":
            endpoint = `${API_URL}/admins/usuario/${idUsuario}`;
            break;
          default:
            return;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        const nombre = `${data.nombres} ${data.apellidos}` || "Usuario";
        const nombreFormateado = capitalizarNombre(nombre);

        setUserInfo({ nombre: nombreFormateado, rol, correo, idUsuario, idAprendiz: data.idAprendiz, idInstructor: data.idInstructor });
      } catch (error) {
        console.error("Error al obtener nombre del usuario:", error);
        setUserInfo({ nombre: "Usuario", rol, correo, idUsuario });
      }
    };

    if (rol && idUsuario) {
      obtenerNombre();
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const toggleNavbar = () => setIsOpen(!isOpen);
  const closeNavbar = () => setIsOpen(false);

  const formatRole = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return "Administrador";
      case "ROLE_INSTRUCTOR":
        return "Instructor";
      case "ROLE_APRENDIZ":
        return "Aprendiz";
      default:
        return "Usuario";
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = [
    {
      section: "Principal",
      items: [
        { to: "/", icon: Home, label: "Inicio" },
        ...(userInfo.rol === "ROLE_ADMIN"
          ? [
              { to: "/gestion-aprendices", icon: Users, label: "Aprendices" },
              { to: "/gestion-fichas", icon: BookOpen, label: "Fichas" },
              { to: "/gestion-instructores", icon: UserCheck, label: "Instructores" },
              { to: "/gestion-programas", icon: GraduationCap, label: "Programas" },
            ]
          : userInfo.rol === "ROLE_INSTRUCTOR"
          ? [
              { to: "/gestion-aprendices", icon: Users, label: "Aprendices" },
              { to: "/gestion-fichas", icon: BookOpen, label: "Fichas" },
              {
                to: `/instructores/${userInfo.idInstructor}`,
                icon: UserCheck,
                label: "Mi Perfil",
              },
            ]
          : userInfo.rol === "ROLE_APRENDIZ"
          ? [
              {
                to: `/aprendices/${userInfo.idAprendiz}`,
                icon: Users,
                label: "Mi Perfil",
              },
            ]
          : []),
      ],
    },
    {
      section: "Sistema",
      items: [{ to: "/about-us", icon: Info, label: "Acerca de Nosotros" }],
    },
  ];

  return (
    <div className="navbar">
      <button
        className="navbar-mobile-toggle"
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`navbar-mobile-overlay ${isOpen ? "active" : ""}`}
        onClick={closeNavbar}
      />

      <nav className={`navbar-container ${isOpen ? "active" : ""}`}>
        <div className="navbar-header">
          <div className="navbar-logo">
            <img src={logoNostel} alt="Logo Nostel" className="logo-image" />
            <div className="navbar-title">Nostel</div>
          </div>

          <div className="user-info">
            <div className="user-avatar">{getInitials(userInfo.nombre)}</div>
            <div className="user-name">{userInfo.nombre}</div>
            <div className="user-role">{formatRole(userInfo.rol)}</div>
          </div>
        </div>

        <div className="navbar-nav">
          {navigationItems.map((section, i) => (
            <div key={i} className="nav-section">
              <div className="nav-section-title">{section.section}</div>
              <ul className="nav-list">
                {section.items.map((item, j) => (
                  <li key={j} className="nav-item">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                      onClick={closeNavbar}
                    >
                      <item.icon className="nav-icon" />
                      <span>{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="navbar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="logout-icon" />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

