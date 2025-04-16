import React, { useState } from 'react';
import axios from 'axios';

const EditarComentario = ({ comentario, onComentarioActualizado, onClose }) => {
    const [formData, setFormData] = useState({
        idComentario: comentario.idComentario,
        contenido: comentario.contenido,
        tipo: comentario.tipo,
        nombreInstructor: comentario.nombreInstructor,
        fecha: comentario.fecha
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

            console.log('Enviando datos actualizados del comentario:', formData);

            const response = await axios.put(
                `http://localhost:8080/api/comentarios/${formData.idComentario}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Respuesta del servidor:', response.data);

            setSuccess(true);
            
            // Notificar al componente padre que se ha actualizado el comentario
            if (onComentarioActualizado) {
                onComentarioActualizado(response.data);
            }
            
            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                onClose();
            }, 2000);
            
        } catch (err) {
            console.error('Error al actualizar comentario:', err);
            console.error('Detalles del error:', err.response?.data || err.message);
            setError(`Error al actualizar el comentario: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Editar Comentario</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">Comentario actualizado con éxito</div>}
                    
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
                                readOnly
                                className="readonly-input"
                            />
                            <small className="form-text text-info">
                                No se puede cambiar el autor del comentario.
                            </small>
                        </div>

                        <div className="button-group">
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="submit-button"
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Actualizar Comentario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarComentario;