import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const AgregarPlanMejoramiento = ({ idAprendiz, onPlanAgregado }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        descripcion: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        estado: 'PENDIENTE',
        nombreInstructor: '',
        competencia: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [instructor, setInstructor] = useState(null);
    const [competencias, setCompetencias] = useState([]);

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
        
        // Obtener competencias disponibles
        const obtenerCompetencias = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await axios.get('http://localhost:8080/api/competencias', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                
                setCompetencias(response.data);
            } catch (err) {
                console.error('Error al obtener competencias:', err);
            }
        };
        
        obtenerDatosInstructor();
        obtenerCompetencias();
    }, []);

    const handleClose = () => {
        setShowModal(false);
        setError(null);
        setSuccess(false);
    };
    
    const handleShow = () => setShowModal(true);

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

            const planData = {
                ...formData
            };

            console.log('Enviando datos del plan de mejoramiento:', planData);

            const response = await axios.post(
                `http://localhost:8080/api/planesMejoramiento/${idAprendiz}`,
                planData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('Respuesta del servidor:', response.data);

            setSuccess(true);
            setFormData({
                descripcion: '',
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: '',
                estado: 'PENDIENTE',
                nombreInstructor: instructor ? (instructor.nombre && instructor.apellido 
                    ? `${instructor.nombre} ${instructor.apellido}` 
                    : instructor.nombreCompleto || instructor.nombre || '') : '',
                competencia: ''
            });
            
            // Notificar al componente padre que se ha agregado un plan
            if (onPlanAgregado) {
                onPlanAgregado(response.data);
            }
            
            // Cerrar el modal después de 2 segundos
            setTimeout(() => {
                handleClose();
            }, 2000);
            
        } catch (err) {
            console.error('Error al agregar plan de mejoramiento:', err);
            console.error('Detalles del error:', err.response?.data || err.message);
            setError(`Error al agregar el plan de mejoramiento: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button 
                className="add-button"
                onClick={handleShow}
            >
                <span className="icon-plus">+</span>
                Agregar Plan de Mejoramiento
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h2>Agregar Plan de Mejoramiento</h2>
                            <button className="close-button" onClick={handleClose}>×</button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert error">{error}</div>}
                            {success && <div className="alert success">Plan de mejoramiento agregado con éxito</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="descripcion">Descripción del Plan</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows="3"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        required
                                        placeholder="Describa el plan de mejoramiento"
                                    ></textarea>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fechaInicio">Fecha de Inicio</label>
                                    <input
                                        type="date"
                                        id="fechaInicio"
                                        name="fechaInicio"
                                        value={formData.fechaInicio}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="fechaFin">Fecha de Finalización</label>
                                    <input
                                        type="date"
                                        id="fechaFin"
                                        name="fechaFin"
                                        value={formData.fechaFin}
                                        onChange={handleChange}
                                        required
                                        min={formData.fechaInicio}
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
                                        <option value="COMPLETADO">Completado</option>
                                        <option value="VENCIDO">Vencido</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="competencia">Competencia</label>
                                    <select
                                        id="competencia"
                                        name="competencia"
                                        value={formData.competencia}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una competencia</option>
                                        {competencias.map(comp => (
                                            <option key={comp.id} value={comp.nombre}>
                                                {comp.nombre}
                                            </option>
                                        ))}
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
                                        placeholder="Nombre del instructor asignado"
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
                                        {loading ? 'Guardando...' : 'Guardar Plan'}
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

export default AgregarPlanMejoramiento;