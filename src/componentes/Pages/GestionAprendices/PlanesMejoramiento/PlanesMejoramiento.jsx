import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AgregarPlanMejoramiento from './AgregarPlanMejoramiento';

const PlanesMejoramiento = ({ idAprendiz }) => {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchPlanes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get(`http://localhost:8080/api/planesMejoramiento/${idAprendiz}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setPlanes(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al cargar planes de mejoramiento:', err);
            setError('Error al cargar los planes de mejoramiento.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanes();
    }, [idAprendiz]);

    // Función para manejar cuando se agrega un nuevo plan
    const handlePlanAgregado = (nuevoPlan) => {
        // Actualizar la lista de planes
        setPlanes([...planes, nuevoPlan]);
    };

    if (loading) return <div>Cargando planes de mejoramiento...</div>;
    if (error) return <div>{error}</div>;

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    // Función para mostrar el estado de forma amigable
    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'PENDIENTE':
                return <span className="estado pendiente">Pendiente</span>;
            case 'COMPLETADO':
                return <span className="estado completada">Completado</span>;
            case 'VENCIDO':
                return <span className="estado vencida">Vencido</span>;
            default:
                return <span className="estado">{estado}</span>;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Planes de Mejoramiento</h3>
                <AgregarPlanMejoramiento 
                    idAprendiz={idAprendiz} 
                    onPlanAgregado={handlePlanAgregado} 
                />
            </div>
            <div className="card-body">
                {planes.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay planes de mejoramiento asignados.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Fecha Inicio</th>
                                    <th>Fecha Fin</th>
                                    <th>Estado</th>
                                    <th>Instructor</th>
                                    <th>Competencia</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planes.map(plan => (
                                    <tr key={plan.idPlanMejoramiento}>
                                        <td>{plan.descripcion}</td>
                                        <td>{formatDate(plan.fechaInicio)}</td>
                                        <td>{formatDate(plan.fechaFin)}</td>
                                        <td>{getEstadoLabel(plan.estado)}</td>
                                        <td>{plan.nombreInstructor}</td>
                                        <td>{plan.competencia}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanesMejoramiento;