import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import "./GestionFichas.css"


export const GestionFichas = () => {
    const [fichas, setFichas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFichas();
    }, []);

    const manejarAgregarFicha = () => {
        navigate('/agregar-ficha');
    }

    /*const irAFicha = () => {
        navigate('/ficha')
    }*/

    const fetchFichas = async () => {
        try {
            // Obtener el token del localStorage
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No hay token de autenticación');
                setError('Sesión no válida. Por favor inicie sesión nuevamente.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
                return;
            }

            // Configurar los headers con el token
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // URL correcta con el context-path configurado
            const response = await axios.get('http://localhost:8080/api/fichas', config);
            
            setFichas(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener fichas:', error);
            handleApiError(error);
        }
    };

    const handleApiError = (error) => {
        if (error.response) {
            if (error.response.status === 403 || error.response.status === 401) {
                setError('No tiene permisos para acceder a esta información.');
                localStorage.removeItem('token');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(`Error del servidor: ${error.response.status}`);
            }
        } else if (error.request) {
            setError('No se pudo conectar con el servidor.');
        } else {
            setError('Error al procesar la solicitud.');
        }
        setLoading(false);
    };

    const handleDelete = async (idFicha) => {
        // Mostrar mensaje de confirmación
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta ficha?");
        
        if (confirmar) {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
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

                // Realizar la petición DELETE
                await axios.delete(`http://localhost:8080/api/fichas/${idFicha}`, config);
                
                // Actualizar la lista de fichas después de eliminar
                fetchFichas();
            } catch (error) {
                console.error('Error al eliminar la ficha:', error);
                setError('Error al eliminar la ficha. Por favor, inténtelo de nuevo.');
            }
        }
    };

    if (loading) return <div className="loading-container">Cargando fichas...</div>;
    if (error) return <div className="error-message">{error}</div>;


    return (
        <div className="gestion-fichas-container">
            <h2>Lista de Fichas</h2>


            {fichas.length === 0 ? (
                <p className="no-fichas">No hay fichas registradas.</p>
            ) : (
                <div className="fichas-list">
                    {fichas.map(ficha => (
                        <div key={ficha.idFicha} className="ficha-item">
                            <div className="ficha-info">
                                <div className="ficha-numero">
                                    <strong>Número de Ficha:</strong> {ficha.numeroFicha}
                                </div>
                                <div className="ficha-programa">
                                    <strong>Programa:</strong> {ficha.nombrePrograma}
                                </div>
                                <div className="ficha-ambiente">
                                    <strong>Ambiente:</strong> {ficha.numeroAmbiente}
                                </div>
                                <div className="ficha-aprendices">
                                    <strong>Aprendices:</strong> {ficha.totalAprendices}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(ficha.idFicha)}
                                className="delete-button"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={manejarAgregarFicha} className="agregar-ficha-button">Agregar Ficha</button>
        </div>
    );
};

export default GestionFichas;
