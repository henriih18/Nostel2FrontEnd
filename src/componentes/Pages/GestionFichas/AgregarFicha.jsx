import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AgregarFicha.css'; // Asegúrate de tener un archivo CSS para estilos

export const AgregarFicha = () => {
    const [programas, setProgramas] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    

    useEffect(() => {
        const cargarProgramas = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/programas`);
                setProgramas(response.data);
            } catch (error) {
                console.error("Error cargando programas:", error);
            }
        };
        cargarProgramas();
    }, []);

    const [data, setData] = useState({
        numeroFicha: "",
        nombrePrograma: "",
        horario: "",
        fechaInicio: "",
        fechaFin: "",
        numeroAmbiente: ""
    });

    const manejarSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = sessionStorage.getItem('token');

            if (!token) {
                console.error('No hay token de autenticación');
                setError('Sesión no válida. Por favor inicie sesión nuevamente.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const nuevaFicha = {
                numeroFicha: parseInt(data.numeroFicha, 10),
                nombrePrograma: data.nombrePrograma,
                horario: data.horario,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                numeroAmbiente: parseInt(data.numeroAmbiente, 10)
            };

            /* await axios.post('http://localhost:8080/api/fichas', nuevaFicha, config); */
            await axios.post(`${API_URL}/fichas`, nuevaFicha, config);

            // Redirigir a la lista de fichas después de agregar
            navigate('/gestion-fichas');
        } catch (error) {
            console.error('Error al agregar ficha:', error);
            setError('Hubo un problema al agregar la ficha. Por favor, inténtelo de nuevo.');
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    return (
        <div className="agregar-ficha-container">
            <h2>Agregar Nueva Ficha</h2>
            <form onSubmit={manejarSubmit}>
                <div className="form-group">
                    <label htmlFor="numeroFicha">Número de Ficha:</label>
                    <input
                        type="number"
                        id="numeroFicha"
                        value={data.numeroFicha}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="nombrePrograma">Nombre del Programa:</label>
                    <select
                        id="nombrePrograma"
                        value={data.nombrePrograma}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un programa</option>
                        {programas.map(programa => (
                            <option key={programa.idPrograma} value={programa.nombrePrograma}>
                                {programa.nombrePrograma}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="horario">Horario:</label>
                    <input
                        type="text"
                        id="horario"
                        value={data.horario}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fechaInicio">Fecha de Inicio:</label>
                    <input
                        type="date"
                        id="fechaInicio"
                        value={data.fechaInicio}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="fechaFin">Fecha de Fin:</label>
                    <input
                        type="date"
                        id="fechaFin"
                        value={data.fechaFin}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="numeroAmbiente">Número de Ambiente:</label>
                    <input
                        type="number"
                        id="numeroAmbiente"
                        value={data.numeroAmbiente}
                        onChange={handleChange}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="submit-button">Agregar Ficha</button>
            </form>
        </div>
    );
};

export default AgregarFicha;