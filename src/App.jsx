import React, {useState, useEffect} from "react";
import {Routes, Route} from "react-router-dom";
import {Container} from "./componentes/Layouts/Container/Container";
import {Home} from "./componentes/Pages/Home/Home";
import {AboutUs} from "./componentes/Pages/AboutUs/AboutUs";
import {Login} from "./componentes/Pages/Login/Login";
import {GestionProgramas} from "./componentes/Pages/GestionProgramas/GestionProgramas.jsx";
import { AgregarPrograma } from "./componentes/Pages/GestionProgramas/AgregarPrograma.jsx";
import {GestionFichas} from "./componentes/Pages/GestionFichas/GestionFichas.jsx";
import { AgregarFicha } from "./componentes/Pages/GestionFichas/AgregarFicha.jsx";
import {GestionInstructores} from "./componentes/Pages/GestionInstructores/GestionInstructores.jsx";
import { AgregarInstructor } from "./componentes/Pages/GestionInstructores/AgregarInstructor.jsx";
import {GestionAprendices} from "./componentes/Pages/GestionAprendices/GestionAprendices.jsx";
import ContainerNavbar from "./componentes/Layouts/ContainerNavbar/ContainerNavbar";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem("token") ? true : false;
    });
    const [data, setData] = useState(null);


    useEffect(() => {
        if (isAuthenticated) {
            fetch('http://localhost:3001/api/data')
                .then((response) => response.json())
                .then((data) => setData(data))
                .catch((error) => console.error('Error:', error));
        }
    }, [isAuthenticated]);

    // Función para manejar el login y guardar la sesión
    const handleLogin = (token) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true);
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin}/>;
    }

    return (
        <div className="container-app">
            <ContainerNavbar/>
            <Container className="container-main">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/gestion-programas" element={<GestionProgramas/>}/>
                    <Route path="/agregar-programa" element={<AgregarPrograma />} />
                    <Route path="/gestion-fichas" element={<GestionFichas/>}/>
                    <Route path="/agregar-ficha" element={<AgregarFicha />} />
                    <Route path="/gestion-instructores" element={<GestionInstructores/>}/>
                    <Route path="/agregar-instructor" element={<AgregarInstructor />} />
                    <Route path="/gestion-aprendices" element={<GestionAprendices/>}/>
                    <Route path="/AboutUs" element={<AboutUs/>}/>
                </Routes>
            </Container>


        </div>
    );
}

export default App;
