

import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import './AgregarComentario.css';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Heart } from "lucide-react";
import { toast } from 'react-toastify';


export const AgregarComentario = ({ onComentarioAgregado }) => {
    const navigate = useNavigate();
    const { idAprendiz } = useParams();

    const [formData, setFormData] = useState({
        fechaComentario: new Date().toISOString().split('T')[0],
        comentario: '',
        nombreInstructor: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showModal , setShowModal] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
   

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const idUsuario = sessionStorage.getItem('idUsuario');

                if (!token || !idUsuario) {
                    toast.error("No hay token de autenticación o ID de usuario disponible")
                    /* setError('No hay token de autenticación o ID de usuario disponible'); */
                    /* setShowModal(true); */
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/instructores/usuario/${idUsuario}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                setFormData(prev => ({
                    ...prev,
                    nombreInstructor: `${response.data.nombres} ${response.data.apellidos}`
                }));
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
                if (err.response && err.response.status === 401) {
                    toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
                    
                    sessionStorage.clear();
                    navigate('/login');
                } else {
                    toast.error(`Error al cargar datos del instructor.`);
                    
                }
            }
        };

        fetchInstructor();
    }, [navigate]);

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

            if (!token || !idAprendiz) {
                toast.error('Faltan datos de autenticación o ID de aprendiz.');
                setShowModal(true);
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `${API_URL}/comentarios/${idAprendiz}`,
                {
                    idAprendiz: idAprendiz,
                    fechaComentario: formData.fechaComentario,
                    comentario: formData.comentario
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success("Comentario guardado con exito")

            /* setSuccess(true);
            setShowModal(true); */

            setTimeout(() => {
                setShowModal(false);
                if (onComentarioAgregado) {
                    onComentarioAgregado(response.data);
                } else {
                    navigate(`/aprendices/${idAprendiz}`);
                }
                
            });
        } catch (err) {
            /* console.error('Error al guardar comentario:', err); */
            if (err.response && err.response.status === 401) {
                toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
                setShowModal(true);
                sessionStorage.clear();
                navigate('/login');
            } else {
                /* setError(`Error: ${err.response?.data?.message || err.message}`); */
                setShowModal(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="formato-sena-container">
            <h1 className="document-title">
                SERVICIO NACIONAL DE APRENDIZAJE SENA<br />
                SISTEMA INTEGRADO DE GESTIÓN<br />
                Comentario
            </h1>

            <form onSubmit={handleSubmit} className="sena-form">
                <div className="form-section">
                    <h3>Agregar Comentario</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha del Comentario</label>
                            <input
                                type="date"
                                name="fechaComentario"
                                value={formData.fechaComentario}
                                onChange={handleChange}
                                required
                                min={ new Date().toISOString().split('T')[0] }
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label>Instructor</label>
                            <input
                                type="text"
                                name="idInstructor"
                                value={formData.nombreInstructor}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>Comentario</label>
                            <textarea
                                
                                name="comentario"
                                
                                value={formData.comentario}
                                onChange={handleChange}
                                placeholder="Escribe el comentario detalladamente..."
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate(`/aprendices/${idAprendiz}`)}
                        disabled={loading || showModal}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading || showModal}
                    >
                        {loading && <Loader2 className="loading-spinner" />}
                        {loading ? 'Guardando...' : 'Guardar Comentario'}
                    </button>
                </div>
            </form>

            {/* Modal para mensajes de error o éxito */}
            {showModal && (
                <div className="success-modal-overlay" onClick={closeModal}>
                    <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
                        {error && <p className="modal-error">{error}</p>}
                        {success && <h2 className="modal-success">Comentario guardado exitosamente!</h2>}
                        
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgregarComentario; 