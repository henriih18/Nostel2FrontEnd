// Comentarios.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import AgregarComentario from './AgregarComentario';
import EditarComentario from './EditarComentario';

const Comentarios = ({ idAprendiz }) => {
    const [comentarios, setComentarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comentarioEditar, setComentarioEditar] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [instructor, setInstructor] = useState(null);
    
    const fetchComentarios = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get(`http://localhost:8080/api/comentarios/${idAprendiz}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setComentarios(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al cargar comentarios:', err);
            setError('Error al cargar los comentarios.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComentarios();
    }, [idAprendiz]);

    // Función para manejar cuando se agrega un nuevo comentario
    const handleComentarioAgregado = (nuevoComentario) => {
        // Actualizar la lista de comentarios
        setComentarios([...comentarios, nuevoComentario]);
    };

    // Función para manejar cuando se actualiza un comentario
    const handleComentarioActualizado = (comentarioActualizado) => {
        // Actualizar la lista de comentarios
        setComentarios(comentarios.map(c => 
            c.idComentario === comentarioActualizado.idComentario ? comentarioActualizado : c
        ));
        setShowEditModal(false);
        setComentarioEditar(null);
    };

    // Función para abrir el modal de edición
    const handleEditarComentario = (comentario) => {
        setComentarioEditar(comentario);
        setShowEditModal(true);
    };

    // Función para confirmar eliminación
    const handleConfirmDelete = (idComentario) => {
        setConfirmDelete(idComentario);
    };

    // Función para cancelar eliminación
    const handleCancelDelete = () => {
        setConfirmDelete(null);
    };

    // Función para eliminar un comentario
    const handleEliminarComentario = async (idComentario) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return;
            
            await axios.delete(`http://localhost:8080/api/comentarios/${idComentario}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            // Actualizar la lista de comentarios
            setComentarios(comentarios.filter(c => c.idComentario !== idComentario));
            setConfirmDelete(null);
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            alert('Error al eliminar el comentario.');
        }
    };

    // Verificar si el usuario actual es el autor del comentario
    const esAutor = (nombreInstructor) => {
        if (!instructor) return false;
        const nombreCompleto = instructor.nombre && instructor.apellido 
            ? `${instructor.nombre} ${instructor.apellido}` 
            : instructor.nombreCompleto || instructor.nombre || '';
        return nombreInstructor === nombreCompleto;
    };

    // Obtener información del instructor al cargar el componente
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
                
                setInstructor(response.data);
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
            }
        };
        
        obtenerDatosInstructor();
    }, []);

    if (loading) return <div>Cargando comentarios...</div>;
    if (error) return <div>{error}</div>;

    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'No definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Comentarios</h3>
                <AgregarComentario 
                    idAprendiz={idAprendiz} 
                    onComentarioAgregado={handleComentarioAgregado} 
                />
            </div>
            <div className="card-body">
                {comentarios.length === 0 ? (
                    <div className="empty-state">
                        <p>No hay comentarios registrados.</p>
                    </div>
                ) : (
                    <div className="comentarios-container">
                        {comentarios.map(comentario => (
                            <div key={comentario.idComentario} className="comentario-card">
                                <div className="comentario-header">
                                    <span className="comentario-autor">{comentario.nombreInstructor}</span>
                                    <span className="comentario-fecha">{formatDate(comentario.fecha)}</span>
                                </div>
                                <div className="comentario-contenido">
                                    {comentario.contenido}
                                </div>
                                <div className="comentario-footer">
                                    <span className={`tipo-badge ${comentario.tipo.toLowerCase()}`}>
                                        {comentario.tipo}
                                    </span>
                                    
                                    {/* Mostrar botones solo si el usuario actual es el autor */}
                                    {esAutor(comentario.nombreInstructor) && (
                                        <div className="comentario-acciones">
                                            <button 
                                                className="btn-editar"
                                                onClick={() => handleEditarComentario(comentario)}
                                            >
                                                <span className="icon-edit">✎</span>
                                                Editar
                                            </button>
                                            
                                            {confirmDelete === comentario.idComentario ? (
                                                <div className="confirm-delete">
                                                    <span>¿Confirmar eliminación?</span>
                                                    <button 
                                                        className="btn-confirm"
                                                        onClick={() => handleEliminarComentario(comentario.idComentario)}
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
                                                    onClick={() => handleConfirmDelete(comentario.idComentario)}
                                                >
                                                    <span className="icon-delete">✖</span>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Modal para editar comentario */}
            {showEditModal && comentarioEditar && (
                <EditarComentario 
                    comentario={comentarioEditar}
                    onComentarioActualizado={handleComentarioActualizado}
                    onClose={() => {
                        setShowEditModal(false);
                        setComentarioEditar(null);
                    }}
                />
            )}
        </div>
    );
};

export default Comentarios;
