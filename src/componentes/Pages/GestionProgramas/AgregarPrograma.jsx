import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AgregarPrograma = () => {
    const [nombrePrograma, setNombrePrograma] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
   

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

            const nuevoPrograma = { nombrePrograma };

            await axios.post(`${API_URL}/programas`, nuevoPrograma, config);

            // Redirigir a la lista de programas después de agregar
            navigate('/gestion-programas');
        } catch (error) {
            console.error('Error al agregar programa:', error);
            setError('Hubo un problema al agregar el programa. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className="agregar-programa-container">
            <h2>Agregar Nuevo Programa</h2>
            <form onSubmit={manejarSubmit}>
                <div className="form-group">
                    <label htmlFor="nombrePrograma">Nombre del Programa:</label>
                    <input
                        type="text"
                        id="nombrePrograma"
                        value={nombrePrograma}
                        onChange={(e) => setNombrePrograma(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="submit-button">Agregar Programa</button>
            </form>
        </div>
    );
};

export default AgregarPrograma;