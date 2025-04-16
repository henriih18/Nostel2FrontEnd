import React, { useState } from 'react';
import axios from 'axios';

const EditarActividadComplementaria = ({ actividad, onActividadActualizada, onClose }) => {
    const [formData, setFormData] = useState({
        idActividad: actividad.idActividad,
        actividad: actividad.actividad,
        fechaAsignacion: actividad.fechaAsignacion ? actividad.fechaAsignacion.split('T')[0] : '',
        fechaEntrega: actividad.fechaEntrega ? actividad.fechaEntrega.split('T')[0] : '',
        estado: actividad.estado,
        nombreInstructor: actividad.nombreInstructor
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
            const token = sessionStorage.getItem('token');
            const idInstructor = sessionStorage.getItem('idUsuario');

            if (!token || !idInstructor) {
                setError('Falta información de autenticación');
                setLoading(false);
                return;
            }

            const actividadActualizada = {
                ...formData,
                idInstructor: idInstructor
            };

            console.log('Enviando datos actualizados de la actividad:', actividadActualizada);

            const response = await axios.put(
                `http://localhost:8080/api/actividadComplementarias/${formData.idActividad}`,
                actividadActualizada,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Respuesta del servidor:', response.data);
            setSuccess(true);

            if (onActividadActualizada) {
                onActividadActualizada(response.data);
            }

            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error('Error al actualizar actividad:', err);
            setError(`Error al actualizar la actividad: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Editar Actividad Complementaria</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">Actividad actualizada con éxito</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="actividad">Descripción de la Actividad</label>
                            <textarea
                                id="actividad"
                                name="actividad"
                                rows="3"
                                value={formData.actividad}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fechaAsignacion">Fecha de Asignación</label>
                            <input
                                type="date"
                                id="fechaAsignacion"
                                name="fechaAsignacion"
                                value={formData.fechaAsignacion}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fechaEntrega">Fecha de Entrega</label>
                            <input
                                type="date"
                                id="fechaEntrega"
                                name="fechaEntrega"
                                value={formData.fechaEntrega}
                                onChange={handleChange}
                                required
                                min={formData.fechaAsignacion}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="estado">Estado</label>
                            <select
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                required
                            >
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="COMPLETADA">Completada</option>
                                <option value="VENCIDA">Vencida</option>
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
                                No se puede cambiar el instructor asignado.
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
                                {loading ? 'Guardando...' : 'Actualizar Actividad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarActividadComplementaria;
