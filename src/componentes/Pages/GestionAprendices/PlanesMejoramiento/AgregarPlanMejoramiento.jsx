import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AgregarPlanMejoramiento.css';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export const AgregarPlanMejoramiento = ({ onPlanAgregado }) => {
    const navigate = useNavigate();
    const { idAprendiz } = useParams();

    const [idInstructor, setIdInstructor] = useState(null);
    const [formData, setFormData] = useState({
        regional: sessionStorage.getItem('regional') || '',
        centroFormacion: sessionStorage.getItem('centroFormacion') || '',
        version: '02',
        codigo: 'GFPI-F-024',
        nombrePrograma: '',
        codigoPrograma: '',
        proyectoAsociado: '',
        numeroFicha: '',
        fase: '',
        actividadProyecto: '',
        observaciones: '',
        aprendiz: {
            nombre: '',
            tipoDI: '',
            numeroDI: ''
        },
        instructor: {
            nombre: '',
            numeroDI: ''
        },
        resultadosAprendizaje: '',
        competencias: [],
        descripcion: '',
        fechaInicio: '2025-05-15',
        fechaFin: '2025-08-20',
        lugar: 'Centro de Formación',
        evidencias: {
            conocimiento: '',
            desempeño: '',
            producto: ''
        },
        recoleccionEvidencias: {
            fecha: '',
            hora: '',
            lugar: ''
        },
        valoracionEvidencias: {
            pertinencia: false,
            vigencia: false,
            autenticidad: false,
            calidad: false
        },
        juicioEvaluativo: 'APROBADO',
        logroAprendizaje: true,
        firmaAprendiz: '',
        firmaInstructor: '',
        firmaJefe: {
            nombre: '',
            firma: ''
        },
        concertacion: {
            ciudad: '',
            fecha: new Date().toISOString().split('T')[0]
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [competenciasList] = useState([
        'Competencia 1', 'Competencia 2', 'Competencia 3'
    ]);

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
                    instructor: {
                        nombre: `${response.data.nombres} ${response.data.apellidos}`,
                        numeroDI: response.data.numeroDocente
                    },
                    firmaInstructor: `${response.data.nombres} ${response.data.apellidos}`
                }));
                setIdInstructor(response.data.idInstructor);
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
                    aprendiz: {
                        nombre: `${aprendizData.nombres} ${aprendizData.apellidos}`,
                        tipoDI: aprendizData.tipoDocumento || '',
                        numeroDI: aprendizData.documento || ''
                    },
                    nombrePrograma: aprendizData.programaFormacion || '',
                    codigoPrograma: aprendizData.codigoPrograma || '',
                    numeroFicha: aprendizData.numeroFicha || '',
                    firmaAprendiz: `${aprendizData.nombres} ${aprendizData.apellidos}`
                }));
            } catch (err) {
                console.error('Error al obtener datos del aprendiz:', err);
                if (err.response && err.response.status === 404) {
                    setError('No se encontró un aprendiz con el ID proporcionado. Por favor, seleccione otro aprendiz.');
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
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

    const handleCheckboxChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCompetenciaChange = (competencia) => {
        setFormData(prev => {
            const nuevasCompetencias = prev.competencias.includes(competencia)
                ? prev.competencias.filter(c => c !== competencia)
                : [...prev.competencias, competencia];
            
            return {
                ...prev,
                competencias: nuevasCompetencias
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = sessionStorage.getItem('token');

            if (!token || !idAprendiz || !idInstructor) {
                setError('Faltan datos de autenticación o IDs necesarios.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `http://localhost:8080/api/planesMejoramiento/${idAprendiz}`,
                {
                    ...formData,
                    idInstructor,
                    idAprendiz
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
                if (onPlanAgregado) {
                    onPlanAgregado(response.data);
                } else {
                    navigate(`/aprendices/${idAprendiz}`);
                }
            }, 2000);
        } catch (err) {
            console.error('Error al guardar:', err);
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
            <h1 className="document-title">
                SERVICIO NACIONAL DE APRENDIZAJE SENA<br />
                SISTEMA INTEGRADO DE GESTIÓN<br />
                Procedimiento Ejecución de la Formación Profesional Integral<br />
                PLAN DE MEJORAMIENTO
            </h1>

            <div className="document-header">
                <span className="version">Versión: {formData.version}</span>
                <span className="codigo">Código: {formData.codigo}</span>
            </div>

            <form onSubmit={handleSubmit} className="sena-form">
                {/* Sección 1: Información Institucional */}
                <div className="form-section institutional">
                    <div className="form-row">
                        <div className="form-group">
                            <label>REGIONAL</label>
                            <input
                                type="text"
                                name="regional"
                                value={formData.regional}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>CENTRO DE FORMACIÓN</label>
                            <input
                                type="text"
                                name="centroFormacion"
                                value={formData.centroFormacion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>COMITÉ EVALUACIÓN Y SEGUIMIENTO</label>
                            <input
                                type="text"
                                value="COMITÉ DE EVALUACIÓN"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>FECHA</label>
                            <input
                                type="date"
                                name="concertacion.fecha"
                                value={formData.concertacion.fecha}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>ACTA No.</label>
                            <input
                                type="text"
                                name="actaNumber"
                                placeholder="Número de acta"
                                required
                            />
                        </div>
                        <div className="form-group juicio-evaluativo">
                            <label>JUICIO DE EVALUACIÓN</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="juicioEvaluativo"
                                        value="APROBADO"
                                        checked={formData.juicioEvaluativo === 'APROBADO'}
                                        onChange={() => handleCheckboxChange('juicioEvaluativo', 'APROBADO')}
                                    />
                                    APROBADO
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="juicioEvaluativo"
                                        value="NO APROBADO"
                                        checked={formData.juicioEvaluativo === 'NO APROBADO'}
                                        onChange={() => handleCheckboxChange('juicioEvaluativo', 'NO APROBADO')}
                                    />
                                    NO APROBADO
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección 2: Información General */}
                <div className="form-section general-info">
                    <h3>INFORMACIÓN GENERAL</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Programa de Formación</label>
                            <input
                                type="text"
                                name="programaFormacion"
                                value={formData.programaFormacion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Código</label>
                            <input
                                type="text"
                                name="codigoPrograma"
                                value={formData.codigoPrograma}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Proyecto asociado</label>
                            <input
                                type="text"
                                name="proyectoAsociado"
                                value={formData.proyectoAsociado}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>No. de Ficha</label>
                            <input
                                type="text"
                                name="numeroFicha"
                                value={formData.numeroFicha}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>FASE</label>
                            <input
                                type="text"
                                name="fase"
                                value={formData.fase}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group wide">
                            <label>Actividad del Proyecto a desarrollar</label>
                            <input
                                type="text"
                                name="actividadProyecto"
                                value={formData.actividadProyecto}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>ETAPA</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="etapa"
                                        value="LECTIVA"
                                        onChange={handleChange}
                                    />
                                    LECTIVA
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="etapa"
                                        value="PRODUCTIVA"
                                        onChange={handleChange}
                                    />
                                    PRODUCTIVA
                                </label>
                            </div>
                        </div>
                        <div className="form-group wide">
                            <label>Observaciones</label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows="2"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 3: Datos Personales */}
                <div className="form-section personal-data">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Aprendiz</label>
                            <input
                                type="text"
                                name="aprendiz.nombre"
                                value={formData.aprendiz.nombre}
                                onChange={handleChange}
                                required
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Tipo D.I.</label>
                            <select
                                name="aprendiz.tipoDI"
                                value={formData.aprendiz.tipoDI}
                                onChange={handleChange}
                                required
                                disabled
                            >
                                <option value="" disabled>
                                    Tipo de documento
                                </option>
                                <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
                                <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
                                <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>No. D.I.</label>
                            <input
                                type="text"
                                name="aprendiz.numeroDI"
                                value={formData.aprendiz.numeroDI}
                                onChange={handleChange}
                                required
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Instructor</label>
                            <input
                                type="text"
                                name="instructor.nombre"
                                value={formData.instructor.nombre}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>No. D.I.</label>
                            <input
                                type="text"
                                name="instructor.numeroDI"
                                value={formData.instructor.numeroDI}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 4: Resultados y Competencias */}
                <div className="form-section results">
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>Resultado(s) de Aprendizaje</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.resultadosAprendizaje}
                                onChange={(value) => setFormData({...formData, resultadosAprendizaje: value})}
                                placeholder="Describa los resultados de aprendizaje..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <label>COMPETENCIA(s)</label>
                            <div className="competencies-grid">
                                {competenciasList.map(competencia => (
                                    <label key={competencia} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.competencias.includes(competencia)}
                                            onChange={() => handleCompetenciaChange(competencia)}
                                        />
                                        {competencia}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección 5: Actividades y Evidencias */}
                <div className="form-section activities">
                    <h3>PLAN DE MEJORAMIENTO</h3>
                    
                    <div className="form-row">
                        <div className="form-group wide">
                            <label>Descripción del Plan de Mejoramiento</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.descripcion}
                                onChange={(value) => setFormData({...formData, descripcion: value})}
                                placeholder="Describa el plan de mejoramiento detalladamente..."
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>FECHA Inicio</label>
                            <input
                                type="date"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>FECHA Fin</label>
                            <input
                                type="date"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleChange}
                                min={formData.fechaInicio}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>LUGAR</label>
                            <select
                                name="lugar"
                                value={formData.lugar}
                                onChange={handleChange}
                                required
                            >
                                <option value="Centro de Formación">Centro de Formación</option>
                                <option value="Empresa">Empresa</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>EVIDENCIAS DE APRENDIZAJE - Conocimiento</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.evidencias.conocimiento}
                                onChange={(value) => setFormData({
                                    ...formData,
                                    evidencias: {...formData.evidencias, conocimiento: value}
                                })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>EVIDENCIAS DE APRENDIZAJE - Desempeño</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.evidencias.desempeño}
                                onChange={(value) => setFormData({
                                    ...formData,
                                    evidencias: {...formData.evidencias, desempeño: value}
                                })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>EVIDENCIAS DE APRENDIZAJE - Producto</label>
                            <ReactQuill
                                theme="snow"
                                modules={quillModules}
                                value={formData.evidencias.producto}
                                onChange={(value) => setFormData({
                                    ...formData,
                                    evidencias: {...formData.evidencias, producto: value}
                                })}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <h4>RECOLECCIÓN DE EVIDENCIAS</h4>
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                name="recoleccionEvidencias.fecha"
                                value={formData.recoleccionEvidencias.fecha}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora</label>
                            <input
                                type="time"
                                name="recoleccionEvidencias.hora"
                                value={formData.recoleccionEvidencias.hora}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Lugar</label>
                            <input
                                type="text"
                                name="recoleccionEvidencias.lugar"
                                value={formData.recoleccionEvidencias.lugar}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <h4>VERIFICACIÓN Y VALORACIÓN DE EVIDENCIAS</h4>
                        <div className="valoracion-grid">
                            <div className="valoracion-item">
                                <label>P - Pertinencia</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="pertinencia"
                                            checked={formData.valoracionEvidencias.pertinencia}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    pertinencia: true
                                                }
                                            })}
                                        /> SÍ
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="pertinencia"
                                            checked={!formData.valoracionEvidencias.pertinencia}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    pertinencia: false
                                                }
                                            })}
                                        /> NO
                                    </label>
                                </div>
                            </div>
                            
                            <div className="valoracion-item">
                                <label>V - Vigencia</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="vigencia"
                                            checked={formData.valoracionEvidencias.vigencia}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    vigencia: true
                                                }
                                            })}
                                        /> SÍ
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="vigencia"
                                            checked={!formData.valoracionEvidencias.vigencia}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    vigencia: false
                                                }
                                            })}
                                        /> NO
                                    </label>
                                </div>
                            </div>
                            
                            <div className="valoracion-item">
                                <label>A - Autenticidad</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="autenticidad"
                                            checked={formData.valoracionEvidencias.autenticidad}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    autenticidad: true
                                                }
                                            })}
                                        /> SÍ
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="autenticidad"
                                            checked={!formData.valoracionEvidencias.autenticidad}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    autenticidad: false
                                                }
                                            })}
                                        /> NO
                                    </label>
                                </div>
                            </div>
                            
                            <div className="valoracion-item">
                                <label>C - Calidad</label>
                                <div className="radio-group">
                                    <label>
                                        <input
                                            type="radio"
                                            name="calidad"
                                            checked={formData.valoracionEvidencias.calidad}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    calidad: true
                                                }
                                            })}
                                        /> SÍ
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="calidad"
                                            checked={!formData.valoracionEvidencias.calidad}
                                            onChange={() => setFormData({
                                                ...formData,
                                                valoracionEvidencias: {
                                                    ...formData.valoracionEvidencias,
                                                    calidad: false
                                                }
                                            })}
                                        /> NO
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>¿LOGRÓ EL APRENDIZAJE?</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="logroAprendizaje"
                                        checked={formData.logroAprendizaje}
                                        onChange={() => setFormData({...formData, logroAprendizaje: true})}
                                    /> SÍ
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="logroAprendizaje"
                                        checked={!formData.logroAprendizaje}
                                        onChange={() => setFormData({...formData, logroAprendizaje: false})}
                                    /> NO
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección 6: Firmas y Compromiso */}
                <div className="form-section signatures">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Compromiso y Firma del Aprendiz</label>
                            <input
                                type="text"
                                name="firmaAprendiz"
                                value={formData.firmaAprendiz}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                                required
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Firma del Instructor</label>
                            <input
                                type="text"
                                value={formData.firmaInstructor}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Jefe inmediato</label>
                            <input
                                type="text"
                                name="firmaJefe.nombre"
                                value={formData.firmaJefe.nombre}
                                onChange={handleChange}
                                placeholder="Nombre del jefe"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group wide">
                            <p className="commitment-text">
                                Me comprometo a desarrollar este Plan de Mejoramiento y soy consciente de que este compromiso es parte integral del Reglamento de Aprendices SENA (artículo 27 N°2). Asumo las consecuencias que acarrea su incumplimiento y como constancia de aprobación y compromiso, firmo.
                            </p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Empresa</label>
                            <input
                                type="text"
                                name="empresa"
                                placeholder="Nombre de la empresa (si aplica)"
                            />
                        </div>
                        <div className="form-group">
                            <label>CONCERTACIÓN</label>
                            <input
                                type="text"
                                name="concertacion.ciudad"
                                value={formData.concertacion.ciudad}
                                onChange={handleChange}
                                placeholder="Ciudad"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>FECHA</label>
                            <input
                                type="date"
                                name="concertacion.fecha"
                                value={formData.concertacion.fecha}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
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
                        {loading ? 'Guardando...' : 'Guardar Plan de Mejoramiento'}
                    </button>
                </div>
            </form>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Plan de mejoramiento guardado exitosamente!</div>}
        </div>
    );
};

export default AgregarPlanMejoramiento;