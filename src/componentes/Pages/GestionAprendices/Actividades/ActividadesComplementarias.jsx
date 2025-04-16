/* import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AgregarActividadComplementaria from './AgregarActividadComplementaria';
import EditarActividadComplementaria from './EditarActividadComplementaria';

const ActividadesComplementarias = ({ idAprendiz: propIdAprendiz }) => {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actividadEditar, setActividadEditar] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [instructor, setInstructor] = useState(null);
    const [idAprendiz, setIdAprendiz] = useState(propIdAprendiz);

    // Obtener el ID del aprendiz del token
    useEffect(() => {
        if (!propIdAprendiz) {
            const idAprendizFromStorage = sessionStorage.getItem('idAprendiz');
            if (idAprendizFromStorage) {
                setIdAprendiz(idAprendizFromStorage);
            } else {
                setError('No se pudo obtener el ID del aprendiz.');
            }
        }
    }, [propIdAprendiz]);

    const fetchActividades = async () => {
        if (!idAprendiz) return;
        
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/actividadComplementarias/${idAprendiz}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setActividades(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar actividades:', err);
            setError('Error al cargar las actividades complementarias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idAprendiz) {
            fetchActividades();
        }
    }, [idAprendiz]);

    const handleActividadAgregada = (nuevaActividad) => {
        setActividades(prevActividades => [...prevActividades, nuevaActividad]);
    };

    const handleActividadActualizada = (actividadActualizada) => {
        setActividades(prevActividades => 
            prevActividades.map(a => a.idActividad === actividadActualizada.idActividad ? actividadActualizada : a)
        );
        setShowEditModal(false);
        setActividadEditar(null);
    };

    const handleEditarActividad = (actividad) => {
        setActividadEditar(actividad);
        setShowEditModal(true);
    };

    const handleConfirmDelete = (idActividad) => {
        setConfirmDelete(idActividad);
    };

    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };

    const handleEliminarActividad = async (idActividad) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            await axios.delete(`http://localhost:8080/api/actividadComplementarias/${idAprendiz}/${idActividad}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setActividades(prevActividades => prevActividades.filter(a => a.idActividad !== idActividad));
            setConfirmDelete(null);
        } catch (err) {
            console.error('Error al eliminar actividad:', err);
            alert('Error al eliminar la actividad complementaria.');
        }
    };

    const esAutor = (nombreInstructorActividad) => {
        if (!instructor) return false;

        const nombreCompleto = instructor.nombres && instructor.apellidos
            ? `${instructor.nombres} ${instructor.apellidos}`
            : instructor.nombreCompleto || instructor.nombres || '';

        return (
            nombreInstructorActividad?.trim().toLowerCase() ===
            nombreCompleto.trim().toLowerCase()
        );
    };

    useEffect(() => {
        const obtenerDatosInstructor = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const idInstructor = sessionStorage.getItem('idUsuario');

                if (!token || !idInstructor) return;

                const response = await axios.get(`http://localhost:8080/api/instructores/${idInstructor}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Instructor cargado:', response.data);
                setInstructor(response.data);
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
            }
        };

        obtenerDatosInstructor();
    }, []);

    if (!idAprendiz) {
        return <div className="error-message">No se pudo obtener el ID del aprendiz.</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return <span className="estado pendiente">Pendiente</span>;
            case 'Entregado':
                return <span className="estado completada">Entregado</span>;
            case 'Calificado':
                return <span className="estado vencida">Calificado</span>;
            default:
                return <span className="estado">{estado}</span>;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Actividades Complementarias</h3>
                {idAprendiz && (
                    <AgregarActividadComplementaria
                        idAprendiz={idAprendiz}
                        onActividadAgregada={handleActividadAgregada}
                    />
                )}
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="loading-state">
                        <p>Cargando actividades...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                    </div>
                ) : actividades.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay actividades complementarias asignadas.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Actividad</th>
                                    <th>Fecha Asignación</th>
                                    <th>Fecha Entrega</th>
                                    <th>Estado</th>
                                    <th>Instructor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actividades.map(actividad => (
                                    <tr key={actividad.idActividad}>
                                        <td>{actividad.actividad}</td>
                                        <td>{formatDate(actividad.fechaAsignacion)}</td>
                                        <td>{formatDate(actividad.fechaEntrega)}</td>
                                        <td>{getEstadoLabel(actividad.estado)}</td>
                                        <td>{actividad.nombreInstructor}</td>
                                        <td>
                                            {esAutor(actividad.nombreInstructor) && (
                                                <div className="acciones-container">
                                                    <button
                                                        className="btn-editar"
                                                        onClick={() => handleEditarActividad(actividad)}
                                                    >
                                                        <span className="icon-edit">✎</span>
                                                        Editar
                                                    </button>

                                                    {confirmDelete === actividad.idActividad ? (
                                                        <div className="confirm-delete">
                                                            <span>¿Confirmar?</span>
                                                            <button
                                                                className="btn-confirm"
                                                                onClick={() => handleEliminarActividad(actividad.idActividad)}
                                                            >
                                                                Sí
                                                            </button>
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={handleCancelDelete}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => handleConfirmDelete(actividad.idActividad)}
                                                        >
                                                            <span className="icon-delete">✖</span>
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showEditModal && actividadEditar && (
                <EditarActividadComplementaria
                    actividad={actividadEditar}
                    onActividadActualizada={handleActividadActualizada}
                    onClose={() => {
                        setShowEditModal(false);
                        setActividadEditar(null);
                    }}
                />
            )}
        </div>
    );
};

export default ActividadesComplementarias;

 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AgregarActividadComplementaria from './AgregarActividadComplementaria';
import EditarActividadComplementaria from './EditarActividadComplementaria';

const ActividadesComplementarias = ({ idAprendiz: propIdAprendiz }) => {
    const navigate = useNavigate(); // Importar y usar el hook useNavigate
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actividadEditar, setActividadEditar] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [instructor, setInstructor] = useState(null);
    const [idAprendiz, setIdAprendiz] = useState(propIdAprendiz);

    // Obtener el ID del aprendiz del token
    useEffect(() => {
        if (!propIdAprendiz) {
            const idAprendizFromStorage = sessionStorage.getItem('idAprendiz');
            if (idAprendizFromStorage) {
                setIdAprendiz(idAprendizFromStorage);
            } else {
                setError('No se pudo obtener el ID del aprendiz.');
            }
        }
    }, [propIdAprendiz]);

    const fetchActividades = async () => {
        if (!idAprendiz) return;
        
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');

            if (!token) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            const response = await axios.get(`http://localhost:8080/api/actividadComplementarias/${idAprendiz}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setActividades(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar actividades:', err);
            setError('Error al cargar las actividades complementarias.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idAprendiz) {
            fetchActividades();
        }
    }, [idAprendiz]);

    const handleActividadAgregada = (nuevaActividad) => {
        // Ahora podemos usar navigate correctamente
        navigate(`/agregar-actividad/${idAprendiz}`);
    };

    const handleActividadActualizada = (actividadActualizada) => {
        setActividades(prevActividades => 
            prevActividades.map(a => a.idActividad === actividadActualizada.idActividad ? actividadActualizada : a)
        );
        setShowEditModal(false);
        setActividadEditar(null);
    };

    const handleEditarActividad = (actividad) => {
        setActividadEditar(actividad);
        setShowEditModal(true);
    };

    const handleConfirmDelete = (idActividad) => {
        setConfirmDelete(idActividad);
    };

    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };

    const handleEliminarActividad = async (idActividad) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            await axios.delete(`http://localhost:8080/api/actividadComplementarias/${idAprendiz}/${idActividad}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            setActividades(prevActividades => prevActividades.filter(a => a.idActividad !== idActividad));
            setConfirmDelete(null);
        } catch (err) {
            console.error('Error al eliminar actividad:', err);
            alert('Error al eliminar la actividad complementaria.');
        }
    };

    const esAutor = (nombreInstructorActividad) => {
        if (!instructor) return false;

        const nombreCompleto = instructor.nombres && instructor.apellidos
            ? `${instructor.nombres} ${instructor.apellidos}`
            : instructor.nombreCompleto || instructor.nombres || '';

        return (
            nombreInstructorActividad?.trim().toLowerCase() ===
            nombreCompleto.trim().toLowerCase()
        );
    };

    useEffect(() => {
        const obtenerDatosInstructor = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const idInstructor = sessionStorage.getItem('idUsuario');

                if (!token || !idInstructor) return;

                const response = await axios.get(`http://localhost:8080/api/instructores/${idInstructor}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Instructor cargado:', response.data);
                setInstructor(response.data);
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
            }
        };

        obtenerDatosInstructor();
    }, []);

    if (!idAprendiz) {
        return <div className="error-message">No se pudo obtener el ID del aprendiz.</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    };

    const getEstadoLabel = (estado) => {
        switch (estado) {
            case 'Pendiente':
                return <span className="estado pendiente">Pendiente</span>;
            case 'Entregado':
                return <span className="estado completada">Entregado</span>;
            case 'Calificado':
                return <span className="estado vencida">Calificado</span>;
            default:
                return <span className="estado">{estado}</span>;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Actividades Complementarias</h3>
                {idAprendiz && (
                    <AgregarActividadComplementaria
                        idAprendiz={idAprendiz}
                        onActividadAgregada={handleActividadAgregada}
                    />
                )}
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="loading-state">
                        <p>Cargando actividades...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                    </div>
                ) : actividades.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay actividades complementarias asignadas.</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Actividad</th>
                                    <th>Fecha Asignación</th>
                                    <th>Fecha Entrega</th>
                                    <th>Estado</th>
                                    <th>Instructor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actividades.map(actividad => (
                                    <tr key={actividad.idActividad}>
                                        <td>{actividad.actividad}</td>
                                        <td>{formatDate(actividad.fechaAsignacion)}</td>
                                        <td>{formatDate(actividad.fechaEntrega)}</td>
                                        <td>{getEstadoLabel(actividad.estado)}</td>
                                        <td>{actividad.nombreInstructor}</td>
                                        <td>
                                            {esAutor(actividad.nombreInstructor) && (
                                                <div className="acciones-container">
                                                    <button
                                                        className="btn-editar"
                                                        onClick={() => handleEditarActividad(actividad)}
                                                    >
                                                        <span className="icon-edit">✎</span>
                                                        Editar
                                                    </button>

                                                    {confirmDelete === actividad.idActividad ? (
                                                        <div className="confirm-delete">
                                                            <span>¿Confirmar?</span>
                                                            <button
                                                                className="btn-confirm"
                                                                onClick={() => handleEliminarActividad(actividad.idActividad)}
                                                            >
                                                                Sí
                                                            </button>
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={handleCancelDelete}
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn-eliminar"
                                                            onClick={() => handleConfirmDelete(actividad.idActividad)}
                                                        >
                                                            <span className="icon-delete">✖</span>
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showEditModal && actividadEditar && (
                <EditarActividadComplementaria
                    actividad={actividadEditar}
                    onActividadActualizada={handleActividadActualizada}
                    onClose={() => {
                        setShowEditModal(false);
                        setActividadEditar(null);
                    }}
                />
            )}
        </div>
    );
};

export default ActividadesComplementarias;