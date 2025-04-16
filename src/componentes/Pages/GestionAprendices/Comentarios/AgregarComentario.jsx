import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AgregarComentario = ({ idAprendiz, onComentarioAgregado }) => {
    const [comentarios, setComentarios] = useState([]);
    const [comentarioEditando, setComentarioEditando] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        contenido: '',
        tipo: 'OBSERVACION',
        nombreInstructor: '',
        id: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [instructor, setInstructor] = useState(null);

    // Obtener comentarios del aprendiz
    useEffect(() => {
        const obtenerComentarios = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !idAprendiz) return;
                
                const response = await axios.get(`http://localhost:8080/api/comentarios/aprendiz/${idAprendiz}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                setComentarios(response.data);
            } catch (err) {
                console.error('Error al obtener comentarios:', err);
            }
        };
        
        obtenerComentarios();
    }, [idAprendiz, success]);

    // Obtener información del instructor al cargar el componente
    useEffect(() => {
        const obtenerDatosInstructor = async () => {
            try {
                const token = localStorage.getItem('token');
                const idInstructor = localStorage.getItem('idUsuario');
                
                if (!token || !idInstructor) {
                    console.log('No se encontró token o ID de instructor');
                    return;
                }
                
                console.log('Obteniendo datos del instructor con ID:', idInstructor);
                
                const response = await axios.get(`http://localhost:8080/api/instructores/${idInstructor}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                console.log('Datos del instructor obtenidos:', response.data);
                
                // Guardar los datos del instructor
                setInstructor(response.data);
                
                // Actualizar el formulario con el nombre del instructor
                const nombreCompleto = response.data.nombre && response.data.apellido 
                    ? `${response.data.nombre} ${response.data.apellido}` 
                    : response.data.nombreCompleto || response.data.nombre || '';
                
                setFormData(prevData => ({
                    ...prevData,
                    nombreInstructor: nombreCompleto
                }));
                
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
                console.error('Detalles del error:', err.response?.data || err.message);
            }
        };
        
        obtenerDatosInstructor();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setError(null);
        setSuccess(false);
        setComentarioEditando(null);
        setFormData({
            contenido: '',
            tipo: 'OBSERVACION',
            nombreInstructor: instructor ? (instructor.nombre && instructor.apellido 
                ? `${instructor.nombre} ${instructor.apellido}` 
                : instructor.nombreCompleto || instructor.nombre || '') : '',
            id: null
        });
    };
    
    const handleShow = () => setShowModal(true);
    
    const handleEdit = (comentario) => {
        setComentarioEditando(comentario);
        setFormData({
            contenido: comentario.contenido,
            tipo: comentario.tipo,
            nombreInstructor: comentario.nombreInstructor,
            id: comentario.id
        });
        setShowModal(true);
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro que desea eliminar este comentario?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No hay token de autenticación');
                return;
            }
            
            await axios.delete(`http://localhost:8080/api/comentarios/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            // Actualizar la lista de comentarios
            setComentarios(comentarios.filter(c => c.id !== id));
            
            // Notificar al componente padre
            if (onComentarioAgregado) {
                onComentarioAgregado();
            }
            
        } catch (err) {
            console.error('Error al eliminar comentario:', err);
            alert(`Error al eliminar el comentario: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                setLoading(false);
                return;
            }

            // Preparar datos del comentario
            const comentarioData = {
                ...formData,
                fecha: new Date().toISOString() // Agregar la fecha actual
            };

            let response;
            
            if (comentarioEditando) {
                // Actualizar comentario existente
                console.log('Actualizando comentario:', comentarioData);
                response = await axios.put(
                    `http://localhost:8080/api/comentarios/${formData.id}`,
                    comentarioData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } else {
                // Crear nuevo comentario
                console.log('Enviando datos del comentario:', comentarioData);
                response = await axios.post(
                    `http://localhost:8080/api/comentarios/${idAprendiz}`,
                    comentarioData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }

            console.log('Respuesta del servidor:', response.data);

            setSuccess(true);
            setFormData({
                contenido: '',
                tipo: 'OBSERVACION',
                nombreInstructor: instructor ? (instructor.nombre && instructor.apellido 
                    ? `${instructor.nombre} ${instructor.apellido}` 
                    : instructor.nombreCompleto || instructor.nombre || '') : '',
                id: null
            });
            
            setComentarioEditando(null);
            
            // Notificar al componente padre que se ha agregado o actualizado un comentario
            if (onComentarioAgregado) {
                onComentarioAgregado(response.data);
            }
            
            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (err) {
            console.error('Error al agregar comentario:', err);
            console.error('Detalles del error:', err.response?.data || err.message);
            setError(`Error al agregar el comentario: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comentarios-container">
            <button 
                className="add-button"
                onClick={handleShow}
            >
                <span className="icon-plus">+</span>
                Agregar Comentario
            </button>

            <div className="comentarios-list">
                {comentarios.length > 0 ? (
                    comentarios.map(comentario => (
                        <div key={comentario.id} className="comentario-item">
                            <div className="comentario-header">
                                <span className={`tipo-comentario ${comentario.tipo.toLowerCase()}`}>
                                    {comentario.tipo.replace('_', ' ')}
                                </span>
                                <span className="fecha-comentario">
                                    {new Date(comentario.fecha).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="comentario-contenido">{comentario.contenido}</div>
                            <div className="comentario-footer">
                                <span className="instructor-nombre">{comentario.nombreInstructor}</span>
                                <div className="comentario-acciones">
                                    <button 
                                        className="edit-button"
                                        onClick={() => handleEdit(comentario)}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleDelete(comentario.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-comentarios">No hay comentarios para este aprendiz</p>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>{comentarioEditando ? 'Editar Comentario' : 'Agregar Comentario'}</h2>
                            <button className="close-button" onClick={handleClose}>×</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert error">{error}</div>}
                            {success && <div className="alert success">Comentario agregado con éxito</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="contenido">Comentario</label>
                                    <textarea
                                        id="contenido"
                                        name="contenido"
                                        rows="4"
                                        value={formData.contenido}
                                        onChange={handleChange}
                                        required
                                        placeholder="Escriba su comentario aquí"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tipo">Tipo de Comentario</label>
                                    <select
                                        id="tipo"
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="OBSERVACION">Observación</option>
                                        <option value="FELICITACION">Felicitación</option>
                                        <option value="LLAMADO_ATENCION">Llamado de Atención</option>
                                        <option value="SUGERENCIA">Sugerencia</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="nombreInstructor">Nombre del Instructor</label>
                                    <input
                                        type="text"
                                        id="nombreInstructor"
                                        name="nombreInstructor"
                                        value={formData.nombreInstructor}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nombre del instructor"
                                        readOnly={instructor !== null}
                                        className={instructor !== null ? "readonly-input" : ""}
                                    />
                                    {instructor !== null && (
                                        <small className="form-text text-info">
                                            Este campo se ha completado automáticamente con tu información.
                                        </small>
                                    )}
                                </div>

                                <div className="button-group">
                                    <button 
                                        type="button" 
                                        className="cancel-button"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        className="submit-button"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : comentarioEditando ? 'Actualizar Comentario' : 'Guardar Comentario'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgregarComentario;
