import React, {useState, useEffect} from "react";
import {Routes, Route} from "react-router-dom";
import {Container} from "./componentes/Layouts/Container/Container";
import {Home} from "./componentes/Pages/Home/Home";
import {AboutUs} from "./componentes/Pages/AboutUs/AboutUs";
import {Login} from "./componentes/Pages/Login/Login";
import {GestionProgramas} from "./componentes/Pages/GestionProgramas/GestionProgramas.jsx";
import {GestionFichas} from "./componentes/Pages/GestionFichas/GestionFichas.jsx";
import {GestionInstructores} from "./componentes/Pages/GestionInstructores/GestionInstructores.jsx";
import {GestionAprendices} from "./componentes/Pages/GestionAprendices/GestionAprendices.jsx";
import ContainerNavbar from "./componentes/Layouts/ContainerNavbar/ContainerNavbar";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [data, setData] = useState(null);


    useEffect(() => {
        if (isAuthenticated) {
            fetch('http://localhost:3001/api/data')
                .then((response) => response.json())
                .then((data) => setData(data))
                .catch((error) => console.error('Error:', error));
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {

        return <Login onLogin={setIsAuthenticated}/>;
    }

    return (
        <div className="container-app">
            <ContainerNavbar/>
            <Container className="container-main">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/gestion-programas" element={<GestionProgramas/>}/>
                    <Route path="/gestion-fichas" element={<GestionFichas/>}/>
                    <Route path="/gestion-instructores" element={<GestionInstructores/>}/>
                    <Route path="/gestion-aprendices" element={<GestionAprendices/>}/>
                    <Route path="/AboutUs" element={<AboutUs/>}/>
                </Routes>
            </Container>


        </div>
    );
}

export default App;
