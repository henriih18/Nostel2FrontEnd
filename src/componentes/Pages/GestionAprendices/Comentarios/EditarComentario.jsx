import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditarComentario = () => {
    const navigate = useNavigate();
    const { idAprendiz, idComentario } = useParams();

    const [formData, setFormData] = useState({
        fechaComentario: '',
        comentario: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    useEffect(() => {
        const fetchComentario = async () => {
            setLoading(true);
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setError('No hay token de autenticación.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8080/api/comentarios/${idAprendiz}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                const comentario = response.data.find(c => c.idComentario === parseInt(idComentario));
                if (!comentario) {
                    throw new Error('Comentario no encontrado');
                }
                setFormData({
                    fechaComentario: comentario.fechaComentario,
                    comentario: comentario.comentario,
                });
            } catch (err) {
                console.error('Error al cargar comentario:', err);
                setError('Error al cargar el comentario.');
                navigate(`/aprendices/${idAprendiz}`);
            } finally {
                setLoading(false);
            }
        };

        fetchComentario();
    }, [idAprendiz, idComentario, navigate]);

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
            if (!token) {
                setError('No hay token de autenticación.');
                navigate('/login');
                return;
            }

             axios.put(
                `http://localhost:8080/api/comentarios/${idAprendiz}/${idComentario}`,
                {
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

            setSuccess(true);

            setTimeout(() => {
                setSuccess(false);
                navigate(`/aprendices/${idAprendiz}`);
            }, 2000);
        } catch (err) {
            console.error('Error al actualizar comentario:', err);
            if (err.response && err.response.status === 401) {
                setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                sessionStorage.clear();
                navigate('/login');
            } else if (err.response && err.response.data.message) {
                setError(`Error: ${err.response.data.message}`);
            } else {
                setError('Error al actualizar el comentario.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formato-sena-container">
            <h1 className="document-title">
                SERVICIO NACIONAL DE APRENDIZAJE SENA<br />
                SISTEMA INTEGRADO DE GESTIÓN<br />
                Editar Comentario
            </h1>

            <form onSubmit={handleSubmit} className="sena-form">
                <div className="form-section">
                    <h3>Editar Comentario</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha del Comentario</label>
                            <input
                                type="date"
                                name="fechaComentario"
                                value={formData.fechaComentario}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>Comentario</label>
                            <input
                                type='textarea'
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

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Comentario actualizado exitosamente!</div>}
        </div>
    );
};

export default EditarComentario;