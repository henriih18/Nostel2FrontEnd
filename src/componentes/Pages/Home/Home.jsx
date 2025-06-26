import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Activity,
  Bell,
  Plus,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./Home.css";

export const Home = () => {
  const [userInfo, setUserInfo] = useState({
    nombre: "",
    rol: "",
  });

  const [stats, setStats] = useState({
    aprendices: 1245,
    instructores: 89,
    programas: 24,
    actividades: 156,
  });

  useEffect(() => {
    const nombre = sessionStorage.getItem("nombre") || "Usuario";
    const rol = sessionStorage.getItem("rol") || "ROLE_USER";
    setUserInfo({ nombre, rol });
  }, []);

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

  const getWelcomeMessage = (role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return {
          title: "¡Bienvenido, Administrador!",
          subtitle:
            "Gestiona usuarios, instructores y reportes del sistema Nostel.",
        };
      case "ROLE_INSTRUCTOR":
        return {
          title: "¡Hola, Instructor!",
          subtitle: "Consulta tus fichas y asigna tareas a tus aprendices.",
        };
      case "ROLE_APRENDIZ":
        return {
          title: "¡Qué tal, Aprendiz!",
          subtitle: "Revisa tus actividades, planes y comentarios asignados.",
        };
      default:
        return {
          title: "¡Bienvenido a Nostel!",
          subtitle: "Selecciona una opción del menú para comenzar.",
        };
    }
  };

  const { title, subtitle } = getWelcomeMessage(userInfo.rol);

  const recentActivities = [
    {
      icon: Users,
      title: "Nuevo aprendiz registrado",
      description:
        "Juan Pérez se ha registrado en el programa de Desarrollo Web",
      time: "Hace 2 horas",
    },
    {
      icon: FileText,
      title: "Plan de mejoramiento creado",
      description: "Se creó un nuevo plan para el aprendiz María González",
      time: "Hace 4 horas",
    },
    {
      icon: CheckCircle,
      title: "Actividad completada",
      description: "Carlos Rodríguez completó la actividad de JavaScript",
      time: "Hace 6 horas",
    },
    {
      icon: Bell,
      title: "Recordatorio de evaluación",
      description: "Evaluación programada para mañana a las 10:00 AM",
      time: "Hace 1 día",
    },
  ];

  const notifications = [
    {
      icon: AlertCircle,
      title: "Evaluaciones pendientes",
      message: "Tienes 3 evaluaciones por revisar",
    },
    {
      icon: Calendar,
      title: "Reunión programada",
      message: "Reunión de coordinación a las 3:00 PM",
    },
    {
      icon: Clock,
      title: "Plazo próximo",
      message: "Entrega de informes en 2 días",
    },
  ];

  return (
    <div className="home-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1>{title}</h1>
            <p className="welcome-subtitle">{subtitle}</p>
          </div>
          {/* <div className="dashboard-actions">
            <NavLink to="/gestion-aprendices" className="action-button primary">
              <Plus size={16} />
              Nuevo Aprendiz
            </NavLink>
            <NavLink to="/settings" className="action-button">
              <Settings size={16} />
              Configuración
            </NavLink>
          </div> */}
        </div>
      </div>

      {/* Grid de Estadísticas */}
      {/* <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Total Aprendices</h3>
              <div className="stat-value">{stats.aprendices.toLocaleString()}</div>
            </div>
            <div className="stat-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="stat-change positive">
            <TrendingUp className="change-icon" />
            +12% este mes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Instructores</h3>
              <div className="stat-value">{stats.instructores}</div>
            </div>
            <div className="stat-icon">
              <UserCheck size={24} />
            </div>
          </div>
          <div className="stat-change positive">
            <TrendingUp className="change-icon" />
            +5% este mes
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Programas</h3>
              <div className="stat-value">{stats.programas}</div>
            </div>
            <div className="stat-icon">
              <GraduationCap size={24} />
            </div>
          </div>
          <div className="stat-change neutral">
            <Activity className="change-icon" />
            Sin cambios
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-info">
              <h3>Actividades</h3>
              <div className="stat-value">{stats.actividades}</div>
            </div>
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="stat-change positive">
            <TrendingUp className="change-icon" />
            +8% esta semana
          </div>
        </div>
      </div> */}

      {/* Grid Principal */}
      <div className="dashboard-grid">
        {/* Panel de Actividad Reciente */}
        {/* <div className="activity-panel">
          <div className="panel-header">
            <h2 className="panel-title">Actividad Reciente</h2>
            <NavLink to="/activity" className="panel-action">Ver todo</NavLink>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <activity.icon size={16} />
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-description">{activity.description}</div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Sidebar con acciones rápidas y notificaciones */}
        <div>
          {/* <div className="quick-actions-panel">
            <div className="panel-header">
              <h2 className="panel-title">Acciones Rápidas</h2>
            </div>
            <div className="quick-actions-grid">
              <NavLink to="/gestion-aprendices" className="quick-action">
                <Users className="quick-action-icon" />
                <span className="quick-action-label">Gestionar Aprendices</span>
              </NavLink>
              <NavLink to="/gestion-fichas" className="quick-action">
                <BookOpen className="quick-action-icon" />
                <span className="quick-action-label">Ver Fichas</span>
              </NavLink>
              <NavLink to="/gestion-instructores" className="quick-action">
                <UserCheck className="quick-action-icon" />
                <span className="quick-action-label">Instructores</span>
              </NavLink>
              <NavLink to="/gestion-programas" className="quick-action">
                <GraduationCap className="quick-action-icon" />
                <span className="quick-action-label">Programas</span>
              </NavLink>
            </div>
          </div> */}

          {/* Panel de Notificaciones */}
          {/* <div className="notifications-panel">
            <div className="panel-header">
              <h2 className="panel-title">Notificaciones</h2>
              <NavLink to="/notifications" className="panel-action">Ver todas</NavLink>
            </div>
            {notifications.map((notification, index) => (
              <div key={index} className="notification-item">
                <notification.icon className="notification-icon" />
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};
