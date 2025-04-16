

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AgregarActividadComplementaria = ({ idAprendiz, onActividadAgregada }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        actividad: '',
        fechaAsignacion: new Date().toISOString().split('T')[0],
        fechaEntrega: '',
        estado: 'PENDIENTE',
        nombreInstructor: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [instructor, setInstructor] = useState(null);

    // Obtener información del instructor al cargar el componente
    useEffect(() => {
        const fetchInstructor = async () => {
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

                setInstructor({
                    id: idInstructor,
                    nombreCompleto: `${response.data.nombres} ${response.data.apellidos}`
                });

                // Seteamos nombre en el form
                setFormData(prev => ({
                    ...prev,
                    nombreInstructor: `${response.data.nombres} ${response.data.apellidos}`
                }));
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
            }
        };

        fetchInstructor();
    }, []);

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setError(null);
        setSuccess(false);
        setFormData({
            actividad: '',
            fechaAsignacion: new Date().toISOString().split('T')[0],
            fechaEntrega: '',
            estado: 'PENDIENTE',
            nombreInstructor: instructor?.nombreCompleto || ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = sessionStorage.getItem('token');
            const idInstructor = instructor?.id;

            if (!token || !idInstructor) {
                setError('Faltan datos de autenticación.');
                setLoading(false);
                return;
            }

            const actividadData = {
                actividad: formData.actividad,
                fechaAsignacion: formData.fechaAsignacion,
                fechaEntrega: formData.fechaEntrega,
                estado: formData.estado,
                nombreInstructor: formData.nombreInstructor,
                idInstructor: idInstructor,
                idAprendiz: idAprendiz
            };

            const response = await axios.post(
                `http://localhost:8080/api/actividadComplementarias/${idAprendiz}`,
                actividadData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setSuccess(true);
            if (onActividadAgregada) onActividadAgregada(response.data);

            setTimeout(() => handleClose(), 2000);
        } catch (err) {
            console.error('Error al agregar actividad:', err);
            setError(`Error al agregar la actividad: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className="add-button" onClick={handleShow}>
                <span className="icon-plus">+</span> Agregar Actividad Complementaria
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Agregar Actividad Complementaria</h2>
                            <button className="close-button" onClick={handleClose}>×</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert error">{error}</div>}
                            {success && <div className="alert success">Actividad agregada con éxito</div>}

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
                                        Este campo se ha completado automáticamente.
                                    </small>
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
                                        {loading ? 'Guardando...' : 'Guardar Actividad'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AgregarActividadComplementaria;
 

