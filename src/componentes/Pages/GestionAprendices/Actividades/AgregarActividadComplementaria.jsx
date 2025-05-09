import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AgregarActividad.css'; // Reusamos el CSS existente, ajusta según necesidades
import { useNavigate, useParams } from 'react-router-dom';
import logoSena from '../../../../assets/images/logoNostel-Photoroom.png';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const AgregarActividadComplementaria = () => {
    const navigate = useNavigate();
    const { idAprendiz } = useParams();

    const [formData, setFormData] = useState({
        idInstructor: null,
        actaNumber: '',
        nombreComite: '',
        ciudad: 'Armenia',
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '',
        horaFin: '',
        lugarEnlace: '',
        direccionRegionalCentro: sessionStorage.getItem('regional') || 'Centro de Comercio y Turismo',
        agenda: '',
        objetivos: '',
        desarrollo: '',
        conclusiones: '',
        estado: 'Pendiente',
        compromisos: [
            { actividadDecision: '', fecha: '', responsable: '', firmaParticipacion: '' }
        ],
        asistentes: [
            { nombre: '', dependenciaEmpresa: '', aprueba: 'SÍ', observacion: '', firmaParticipacion: '' }
        ],
        version: '02',
        codigo: 'GOR-F-084',
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
        const fetchInstructor = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const idUsuario = sessionStorage.getItem('idUsuario');

                if (!token || !idUsuario) {
                    setError('No hay token de autenticación o ID de usuario disponible');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/instructores/usuario/${idUsuario}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                setFormData(prev => ({
                    ...prev,
                    idInstructor: response.data.idInstructor,
                    asistentes: [
                        {
                            nombre: `${response.data.nombres} ${response.data.apellidos}`,
                            dependenciaEmpresa: 'SENA',
                            aprueba: 'SÍ',
                            observacion: '',
                            firmaParticipacion: `${response.data.nombres} ${response.data.apellidos}`
                        }
                    ]
                }));
            } catch (err) {
                console.error('Error al obtener datos del instructor:', err);
                if (err.response && err.response.status === 401) {
                    setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                    sessionStorage.clear();
                    navigate('/login');
                } else {
                    setError(`Error al cargar datos del instructor: ${err.response?.data?.message || err.message}`);
                }
            }
        };

        fetchInstructor();
    }, [navigate]);

    useEffect(() => {
        const fetchAprendiz = async () => {
            try {
                const token = sessionStorage.getItem('token');

                if (!token || !idAprendiz) {
                    setError('No hay token de autenticación o ID de aprendiz disponible');
                    navigate('/aprendices');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/aprendices/${idAprendiz}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const aprendizData = response.data;

                setFormData(prev => ({
                    ...prev,
                    asistentes: [
                        ...prev.asistentes,
                        {
                            nombre: `${aprendizData.nombres} ${aprendizData.apellidos}`,
                            dependenciaEmpresa: 'Aprendiz SENA',
                            aprueba: 'SÍ',
                            observacion: '',
                            firmaParticipacion: `${aprendizData.nombres} ${aprendizData.apellidos}`
                        }
                    ]
                }));
            } catch (err) {
                console.error('Error al obtener datos del aprendiz:', err);
                if (err.response && err.response.status === 404) {
                    setError('No se encontró un aprendiz con el ID proporcionado.');
                    setTimeout(() => navigate('/aprendices'), 3000);
                } else if (err.response && err.response.status === 401) {
                    setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                    sessionStorage.clear();
                    navigate('/login');
                } else {
                    setError(`Error al cargar datos del aprendiz: ${err.response?.data?.message || err.message}`);
                }
            }
        };

        if (idAprendiz) {
            fetchAprendiz();
        }
    }, [idAprendiz, navigate]);

    const handleChange = (e, index, section) => {
        const { name, value } = e.target;

        if (section) {
            setFormData(prev => {
                const updatedSection = [...prev[section]];
                updatedSection[index] = { ...updatedSection[index], [name]: value };
                return { ...prev, [section]: updatedSection };
            });
        } else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const addCompromiso = () => {
        setFormData(prev => ({
            ...prev,
            compromisos: [
                ...prev.compromisos,
                { actividadDecision: '', fecha: '', responsable: '', firmaParticipacion: '' }
            ]
        }));
    };

    const addAsistente = () => {
        setFormData(prev => ({
            ...prev,
            asistentes: [
                ...prev.asistentes,
                { nombre: '', dependenciaEmpresa: '', aprueba: 'SÍ', observacion: '', firmaParticipacion: '' }
            ]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = sessionStorage.getItem('token');
            const idUsuario = sessionStorage.getItem('idUsuario');

            if (!token) {
                setError('No se ha identificado al instructor');
                setLoading(false);
                return;
            }

            // 1. Log de datos antes de enviar
        console.log('Datos a enviar (frontend):', {
            ...formData,
            idUsuario: idUsuario, // Para verificar coincidencia con backend
            timestamp: new Date().toISOString()
        });

            // Enviar todo el objeto formData directamente
            const response = await axios.post(
                `http://localhost:8080/api/actividadComplementarias/${idAprendiz}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // 2. Log de respuesta
        console.log('Respuesta del backend:', {
            data: response.data,
            status: response.status,
            headers: response.headers
        });

            setSuccess(true);
            setTimeout(() => {
                navigate(`/aprendices/${idAprendiz}`);
            }, 2000);
        } catch (err) {

             // 3. Log de errores
        console.error('Error completo:', {
            message: err.message,
            response: err.response?.data,
            stack: err.stack
        });
        

            console.error('Error al guardar el acta:', err);
            if (err.response && err.response.status === 401) {
                setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
                sessionStorage.clear();
                navigate('/login');
            } else {
                setError(`Error: ${err.response?.data?.message || err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="formato-sena-container">
            <div className="header-with-logo">
                <img src={logoSena} alt="Logo SENA" className="sena-logo" />
                <h1 className="document-title">
                    SERVICIO NACIONAL DE APRENDIZAJE SENA<br />
                    FORMATO DE ACTA
                </h1>
            </div>

            <div className="document-header">
                <span className="version">Versión: {formData.version}</span>
                <span className="codigo">Código: {formData.codigo}</span>
            </div>

            <form onSubmit={handleSubmit} className="sena-form">
                {/* Sección 1: Encabezado del Acta */}
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group">
                            <label>ACTA No.</label>
                            <input
                                type="text"
                                name="actaNumber"
                                value={formData.actaNumber}
                                onChange={handleChange}
                                placeholder="Número de acta"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>NOMBRE DEL COMITÉ O DE LA REUNIÓN</label>
                            <input
                                type="text"
                                name="nombreComite"
                                value={formData.nombreComite}
                                onChange={handleChange}
                                placeholder="Nombre del comité o reunión"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>CIUDAD Y FECHA</label>
                            <div className="form-group-pair">
                                <input
                                    type="text"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                    placeholder="Ciudad"
                                    required
                                />
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>HORA INICIO</label>
                            <input
                                type="time"
                                name="horaInicio"
                                value={formData.horaInicio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>HORA FIN</label>
                            <input
                                type="time"
                                name="horaFin"
                                value={formData.horaFin}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>LUGAR Y/O ENLACE</label>
                            <input
                                type="text"
                                name="lugarEnlace"
                                value={formData.lugarEnlace}
                                onChange={handleChange}
                                placeholder="Lugar o enlace de la reunión"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>DIRECCIÓN / REGIONAL / CENTRO</label>
                            <input
                                type="text"
                                name="direccionRegionalCentro"
                                value={formData.direccionRegionalCentro}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 2: Agenda y Objetivos */}
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>AGENDA O PUNTOS PARA DESARROLLAR</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.agenda}
                                onChange={(value) => setFormData({ ...formData, agenda: value })}
                                placeholder="Describa la agenda o puntos a desarrollar..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>OBJETIVO(S) DE LA REUNIÓN</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.objetivos}
                                onChange={(value) => setFormData({ ...formData, objetivos: value })}
                                placeholder="Describa los objetivos de la reunión..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 3: Desarrollo y Conclusiones */}
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>DESARROLLO DE LA REUNIÓN</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.desarrollo}
                                onChange={(value) => setFormData({ ...formData, desarrollo: value })}
                                placeholder="Describa el desarrollo de la reunión..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>CONCLUSIONES</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.conclusiones}
                                onChange={(value) => setFormData({ ...formData, conclusiones: value })}
                                placeholder="Describa las conclusiones de la reunión..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 4: Compromisos */}
                <div className="form-section">
                    <h3>ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</h3>
                    <table className="sena-table">
                        <thead>
                            <tr>
                                <th>ACTIVIDAD / DECISIÓN</th>
                                <th>FECHA</th>
                                <th>RESPONSABLE</th>
                                <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.compromisos.map((compromiso, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            name="actividadDecision"
                                            value={compromiso.actividadDecision}
                                            onChange={(e) => handleChange(e, index, 'compromisos')}
                                            placeholder="Actividad o decisión"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={compromiso.fecha}
                                            onChange={(e) => handleChange(e, index, 'compromisos')}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="responsable"
                                            value={compromiso.responsable}
                                            onChange={(e) => handleChange(e, index, 'compromisos')}
                                            placeholder="Nombre del responsable"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="firmaParticipacion"
                                            value={compromiso.firmaParticipacion}
                                            onChange={(e) => handleChange(e, index, 'compromisos')}
                                            placeholder="Firma o participación virtual"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" className="add-row-button" onClick={addCompromiso}>
                        Agregar Compromiso
                    </button>
                </div>

                {/* Sección 5: Asistentes */}
                <div className="form-section">
                    <h3>ASISTENTES Y APROBACIÓN DECISIONES</h3>
                    <table className="sena-table">
                        <thead>
                            <tr>
                                <th>NOMBRE</th>
                                <th>DEPENDENCIA / EMPRESA</th>
                                <th>APRUEBA (SÍ/NO)</th>
                                <th>OBSERVACIÓN</th>
                                <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.asistentes.map((asistente, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={asistente.nombre}
                                            onChange={(e) => handleChange(e, index, 'asistentes')}
                                            placeholder="Nombre completo"
                                            readOnly={index < 2} // Instructor y Aprendiz son readonly
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="dependenciaEmpresa"
                                            value={asistente.dependenciaEmpresa}
                                            onChange={(e) => handleChange(e, index, 'asistentes')}
                                            placeholder="Dependencia o empresa"
                                            readOnly={index < 2}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            name="aprueba"
                                            value={asistente.aprueba}
                                            onChange={(e) => handleChange(e, index, 'asistentes')}
                                        >
                                            <option value="SÍ">SÍ</option>
                                            <option value="NO">NO</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="observacion"
                                            value={asistente.observacion}
                                            onChange={(e) => handleChange(e, index, 'asistentes')}
                                            placeholder="Observaciones"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="firmaParticipacion"
                                            value={asistente.firmaParticipacion}
                                            onChange={(e) => handleChange(e, index, 'asistentes')}
                                            placeholder="Firma o participación virtual"
                                            readOnly={index < 2}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" className="add-row-button" onClick={addAsistente}>
                        Agregar Asistente
                    </button>
                </div>

                {/* Sección 6: Nota Legal */}
                <div className="form-section">
                    <p className="legal-note">
                        De acuerdo con La Ley 1581 de 2012, Protección de Datos Personales, el Servicio Nacional de Aprendizaje SENA, se compromete a garantizar la seguridad y protección de los datos personales que se encuentran almacenados en este documento, y les dará el tratamiento correspondiente en cumplimiento de lo establecido legalmente.
                    </p>
                </div>

                {/* Botones de Acción */}
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
                        {loading ? 'Guardando...' : 'Guardar Acta'}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Acta guardada exitosamente!</div>}
        </div>
    );
};

export default AgregarActividadComplementaria;