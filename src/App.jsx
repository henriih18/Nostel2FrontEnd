import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Container } from "./componentes/Layouts/Container/Container";
import { Home } from "./componentes/Pages/Home/Home";
import { AboutUs } from "./componentes/Pages/AboutUs/AboutUs";
import { Login } from "./componentes/Pages/Login/Login";
import { GestionProgramas } from "./componentes/Pages/GestionProgramas/GestionProgramas.jsx";
import { AgregarPrograma } from "./componentes/Pages/GestionProgramas/AgregarPrograma.jsx";
import { GestionFichas } from "./componentes/Pages/GestionFichas/GestionFichas.jsx";
import { AgregarFicha } from "./componentes/Pages/GestionFichas/AgregarFicha.jsx";
import { GestionInstructores } from "./componentes/Pages/GestionInstructores/GestionInstructores.jsx";
import { AgregarInstructor } from "./componentes/Pages/GestionInstructores/AgregarInstructor.jsx";
import { GestionAprendices } from "./componentes/Pages/GestionAprendices/GestionAprendices.jsx";
import { AgregarActividadComplementaria } from "./componentes/Pages/GestionAprendices/Actividades/AgregarActividadComplementaria.jsx";
import ContainerNavbar from "./componentes/Layouts/ContainerNavbar/ContainerNavbar";
import Aprendiz from "./componentes/Pages/GestionAprendices/Aprendiz/Aprendiz";
import AgregarPlanMejoramiento from "./componentes/Pages/GestionAprendices/PlanesMejoramiento/AgregarPlanMejoramiento.jsx";
import AgregarComentario from "./componentes/Pages/GestionAprendices/Comentarios/AgregarComentario.jsx";
import EditarComentario from "./componentes/Pages/GestionAprendices/Comentarios/EditarComentario.jsx";
import Comentarios from "./componentes/Pages/GestionAprendices/Comentarios/Comentarios.jsx";
import ChatbotWidget from "./componentes/Chatbot/ChatbotWidget.jsx";
import ForgotPassword from "./componentes/PasswordReset/ForgotPassword.jsx";
import ResetPassword from "./componentes/PasswordReset/ResetPassword.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("token") ? true : false;
  });
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("http://localhost:3001/api/data")
        .then((response) => response.json())
        .then((data) => setData(data))
        .catch((error) => console.error("Error:", error));
    }
  }, [isAuthenticated]);

  // Función para manejar el login y guardar la sesión
  const handleLogin = (token) => {
    sessionStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container-app">
      <ContainerNavbar />
      <Container className="container-main">
        <Routes>
          

          <Route path="/" element={<Home />} />
          <Route path="/gestion-programas" element={<GestionProgramas />} />

          <Route path="/agregar-programa" element={<AgregarPrograma />} />

          <Route path="/gestion-fichas" element={<GestionFichas />} />
          <Route path="/agregar-ficha" element={<AgregarFicha />} />

          <Route
            path="/gestion-instructores"
            element={<GestionInstructores />}
          />
          <Route path="/agregar-instructor" element={<AgregarInstructor />} />

          <Route path="/gestion-aprendices" element={<GestionAprendices />} />
          <Route
            path="/agregar-actividad/:idAprendiz"
            element={<AgregarActividadComplementaria />}
          />
          <Route
            path="/agregar-plan/:idAprendiz"
            element={<AgregarPlanMejoramiento />}
          />
          <Route
            path="/aprendices/:idAprendiz/comentarios"
            element={<Comentarios />}
          />
          <Route
            path="/agregar-comentario/:idAprendiz"
            element={<AgregarComentario />}
          />
          <Route
            path="/aprendices/:idAprendiz/comentarios/:idComentario/editar"
            element={<EditarComentario />}
          />
          <Route path="/aprendices/:idAprendiz" element={<Aprendiz />} />

          <Route path="/AboutUs" element={<AboutUs />} />
        </Routes>
      </Container>
      <ChatbotWidget />
    </div>
  );
}

export default App;

/*
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './componentes/Pages/Login/Login';
import Navbar from './componentes/Layout/Navbar/Navbar';
// Importa tus otros componentes aquí

function App() {
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  // Función para manejar el inicio de sesión exitoso
  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  // Componente para rutas protegidas
  const ProtectedRoute = ({ children, allowedRoles }) => {
    const userToken = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('rol');
    
    if (!userToken) {
      return <Navigate to="/" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      El Navbar se mostrará en todas las páginas 
      <Navbar />
      
      <Routes>
         Ruta pública - Login 
        <Route path="/" element={!token ? <Login onLogin={handleLogin} /> : 
          <Navigate to={
            sessionStorage.getItem('rol') === "ROLE_APRENDIZ" ? "/aprendices" : 
            sessionStorage.getItem('rol') === "ROLE_INSTRUCTOR" ? "/instructor" : 
            sessionStorage.getItem('rol') === "ROLE_ADMIN" ? "/admin" : "/"
          } />
        } />
        
         Ruta de registro 
        <Route path="/registroAprendiz" element={<RegistroAprendiz />} />
        
        Rutas protegidas 
        <Route path="/aprendices" element={
          <ProtectedRoute allowedRoles={["ROLE_APRENDIZ"]}>
            <DashboardAprendiz />
          </ProtectedRoute>
        } />
        
        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={["ROLE_INSTRUCTOR"]}>
            <DashboardInstructor />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        
         Ruta para página no encontrada
        <Route path="*" element={<PaginaNoEncontrada />} />
      </Routes>
    </Router>
  );
}

// Componentes temporales para las rutas que no has implementado aún
// Reemplaza estos con tus componentes reales
const DashboardAprendiz = () => <div>Dashboard Aprendiz</div>;
const DashboardInstructor = () => <div>Dashboard Instructor</div>;
const DashboardAdmin = () => <div>Dashboard Admin</div>;
const RegistroAprendiz = () => <div>Registro de Aprendiz</div>;
const PaginaNoEncontrada = () => <div>Página no encontrada</div>;

export default App; */
