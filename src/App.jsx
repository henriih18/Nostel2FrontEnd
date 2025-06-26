/* import React, { useState, useEffect } from "react";
import {  Routes, Route } from "react-router-dom";
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

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isAuthenticated) {
      fetch( "http://localhost:3001/data" )
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
 */

// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";
//import ContainerNavbar from "./componentes/Layouts/ContainerNavbar/ContainerNavbar";
import { Container } from "./componentes/Layouts/Container/Container";
import { Home } from "./componentes/Pages/Home/Home";
import { AboutUs } from "./componentes/Pages/AboutUs/AboutUs";
import { Login } from "./componentes/Pages/Login/Login";
import { GestionProgramas } from "./componentes/Pages/GestionProgramas/GestionProgramas";
import { AgregarPrograma } from "./componentes/Pages/GestionProgramas/AgregarPrograma";
import { GestionFichas } from "./componentes/Pages/GestionFichas/GestionFichas";
import { AgregarFicha } from "./componentes/Pages/GestionFichas/AgregarFicha";
import { GestionInstructores } from "./componentes/Pages/GestionInstructores/GestionInstructores";
import  Instructor  from "./componentes/Pages/GestionInstructores/Instructor/Instructor";
import { AgregarInstructor } from "./componentes/Pages/GestionInstructores/AgregarInstructor";
import { GestionAprendices } from "./componentes/Pages/GestionAprendices/GestionAprendices";
import AgregarActividadComplementaria from "./componentes/Pages/GestionAprendices/Actividades/AgregarActividadComplementaria";
import Aprendiz from "./componentes/Pages/GestionAprendices/Aprendiz/Aprendiz";
import AgregarPlanMejoramiento from "./componentes/Pages/GestionAprendices/PlanesMejoramiento/AgregarPlanMejoramiento";
import Comentarios from "./componentes/Pages/GestionAprendices/Comentarios/Comentarios";
import AgregarComentario from "./componentes/Pages/GestionAprendices/Comentarios/AgregarComentario";
import EditarComentario from "./componentes/Pages/GestionAprendices/Comentarios/EditarComentario";
import ChatbotWidget from "./componentes/Chatbot/ChatbotWidget";
/* import ForgotPassword from "./componentes/PasswordReset/ForgotPassword";
import ResetPassword from "./componentes/PasswordReset/ResetPassword";
import PerfilAprendiz from "./componentes/Pages/GestionAprendices/Aprendiz/Aprendiz";
import PerfilInstructor from "./components/PerfilInstructor"; */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("token")
  );
  const [data, setData] = useState(null);

  /* useEffect(() => {
    if (isAuthenticated) {
      axios
        .get( `http://localhost:8080/data` )
        .then((res) => setData(res.data))
        .catch((err) => console.error("Error fetching data:", err));
    }
  }, [isAuthenticated]); */

  const handleLogin = (token) => {
    sessionStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  // Si no está autenticado, muestra el Login (sin rutas protegidas)
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="container-app">
      <Container className="container-main">
        {/* <ContainerNavbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />

          <Route path="/gestion-programas" element={<GestionProgramas />} />
          <Route path="/agregar-programa" element={<AgregarPrograma />} />

          <Route path="/gestion-fichas" element={<GestionFichas />} />
          <Route path="/agregar-ficha" element={<AgregarFicha />} />

          <Route
            path="/gestion-instructores"
            element={<GestionInstructores />}
          />
          <Route path="/agregar-instructor" element={<AgregarInstructor />} />
          <Route path="/instructores/:idInstructor" element={<Instructor />} />

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
          {/* <Route path="/aprendices/:idAprendiz" element={<Aprendiz />} /> */}
          <Route path="/perfil-aprendiz" element={<Aprendiz />} />


          
          {/* <Route path="/perfil-instructor/:id" element={<PerfilInstructor />} /> */}

          {/* Fallback interno: redirige al home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <ChatbotWidget />
    </div>
  );
}

export default App;
