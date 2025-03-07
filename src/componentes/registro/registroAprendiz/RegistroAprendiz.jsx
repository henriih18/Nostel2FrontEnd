/*
import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./RegistroAprendiz.css";

export const RegistroAprendiz = () => {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState([]);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        const cargarFichas = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/fichas");
                setFichas(response.data);
            } catch (error) {
                console.error("Error cargando fichas:", error);
            }
        };
        cargarFichas();
    }, []);

    const [formData, setFormData] = useState({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        fechaNacimiento: "",
        correo: "",
        genero: "",
        contrasena: "",
        telefono: "",
        residencia: "",
        ficha: "" // Guardará la ficha seleccionada
    });


    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        try {
            await axios.post("http://localhost:8080/api/aprendices", formData);
            alert("Registro exitoso. Ahora inicia sesión.");
            navigate("/login");
        } catch (error) {
            if(error.response && error.response.status === 400){
                setError(error.response.data);
            }else {
                setError("Ocurrio un error inesperado.");
            }
        }
    };

    return (
        <div className="registro-container">
            <h1>Registro de Aprendiz</h1>
            <form onSubmit={handleSubmit} className="registro-form">
                <div>
                    <div className="tipoDoc">
                        <label htmlFor="tipoDocumento" >Documento</label>
                        <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required className="tipoDocSel">
                            <option value="" disabled>Seleccione el tipo de documento</option>
                            <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
                            <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
                            <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
                            <option value="PASAPORTE">Pasaporte</option>
                        </select>
                    </div>

                    <input type="number" name="documento" placeholder="Número de documento" onChange={handleChange}
                           required className="docNumber"/>
                </div>

                <div className="regName">
                    <label>Nombres</label>
                    <input type="text" name="nombres" placeholder="Nombres" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="fechaNacimiento" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Correo</label>
                    <input type="email" name="correo" placeholder="Correo" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Contraseña</label>
                    <input type="password" name="contrasena" placeholder="Contraseña" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Teléfono</label>
                    <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} required/>
                </div>

                <div>
                    <label htmlFor="genero">Género</label>
                    <select id="genero" name="genero" value={formData.genero} onChange={handleChange} required>
                        <option value="" disabled>Seleccionar Género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div>
                    <label>Residencia</label>
                    <input type="text" name="residencia" placeholder="Residencia" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Ficha</label>
                    <select name="ficha" value={formData.ficha} onChange={handleChange} required className="opciones">
                        <option value="" disabled>Seleccione su ficha</option>
                        {fichas.map(ficha => (
                            <option key={ficha.idFicha} value={ficha.idFicha} className="opciones"
                                    required>{`${ficha.numeroFicha} ${ficha.nombrePrograma}`}</option>
                        ))}
                    </select>
                </div>

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};
*/
import React, {useState, useEffect, useRef} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./RegistroAprendiz.css";

export const RegistroAprendiz = () => {
    const navigate = useNavigate();
    const [fichas, setFichas] = useState([]);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cargarFichas = async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/fichas");
                setFichas(response.data);
            } catch (error) {
                console.error("Error cargando fichas:", error);
            }
        };
        cargarFichas();
    }, []);

    const [formData, setFormData] = useState({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        fechaNacimiento: "",
        correo: "",
        genero: "",
        contrasena: "",
        telefono: "",
        residencia: "",
        ficha: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFocus = (e) => {
        setErrores((prevErrores) => ({
            ...prevErrores,
            [e.target.name]: "",
        }));
    };

    const validarFormulario = () => {
        let erroresNuevos = {};

        if (!formData.tipoDocumento) erroresNuevos.tipoDocumento = "Seleccione un tipo de documento.";
        if (!formData.documento.trim()) erroresNuevos.documento = "Ingrese un número de documento.";
        if (!formData.nombres.trim()) erroresNuevos.nombres = "Ingrese su nombre.";
        if (!formData.apellidos.trim()) erroresNuevos.apellidos = "Ingrese sus apellidos.";
        if (!formData.fechaNacimiento) erroresNuevos.fechaNacimiento = "Seleccione su fecha de nacimiento.";

        if (!formData.correo.trim()) {
            erroresNuevos.correo = "Ingrese su correo electrónico.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            erroresNuevos.correo = "Ingrese un correo válido.";
        }

        if (!formData.contrasena.trim()) {
            erroresNuevos.contrasena = "Ingrese una contraseña.";
        } else if (formData.contrasena.length < 6) {
            erroresNuevos.contrasena = "La contraseña debe tener al menos 6 caracteres.";
        }

        if (!formData.telefono.trim()) {
            erroresNuevos.telefono = "Ingrese un número de teléfono.";
        } else if (!/^\d+$/.test(formData.telefono)) {
            erroresNuevos.telefono = "El teléfono debe contener solo números.";
        }

        if (!formData.genero) erroresNuevos.genero = "Seleccione un género.";
        if (!formData.residencia.trim()) erroresNuevos.residencia = "Ingrese su dirección de residencia.";
        if (!formData.ficha) erroresNuevos.ficha = "Seleccione una ficha.";

        setErrores(erroresNuevos);
        // Enfocar el primer campo con error


        return Object.keys(erroresNuevos).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrores({});
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            await axios.post("http://localhost:8080/api/aprendices", formData);
            alert("Registro exitoso.");
            navigate("/login");
        } catch (error) {
            if (error.response) {
                if (error.response.data.error) {
                    if (error.response.data.error.includes("correo")) {
                        setErrores({correo: error.response.data.error});
                    } else if (error.response.data.error.includes("documento")) {
                        setErrores({documento: error.response.data.error});
                    } else {
                        setErrores({general: error.response.data.error});
                    }
                } else {
                    setErrores(error.response.data);
                }

            } else {
                setErrores({general: "No se pudo conectar al servidor."});
            }
        }
        setLoading(false);


    };

    return (
        <div className="registro-container">
            <h1>Registro de Aprendiz</h1>
            <form onSubmit={handleSubmit} className="registro-form">
                <div>
                    <div className="tipoDoc">
                        <label htmlFor="tipoDocumento">Documento</label>
                        <select id="tipoDocumento" name="tipoDocumento" value={formData.tipoDocumento}
                                onChange={handleChange} onFocus={handleFocus} /*required*/ className="tipoDocSel">
                            <option value="" disabled>Seleccione el tipo de documento</option>
                            <option value="CEDULA_CIUDADANIA">Cédula de Ciudadanía</option>
                            <option value="TARJETA_IDENTIDAD">Tarjeta de Identidad</option>
                            <option value="CEDULA_EXTRANJERIA">Cédula de Extranjería</option>
                            <option value="PASAPORTE">Pasaporte</option>
                            {errores.tipoDocumento && <p className="error">{errores.tipoDocumento}</p>}
                        </select>
                        {errores.tipoDocumento && <p className="error">{errores.tipoDocumento}</p>}
                    </div>

                    <input type="number" name="documento" placeholder="Número de documento" onChange={handleChange} onFocus={handleFocus}
                        /*required*/ className="docNumber"/>
                    {errores.documento && <p className="error">{errores.documento}</p>}
                </div>

                <div className="regName">
                    <label>Nombres</label>
                    <input type="text" name="nombres" placeholder="Nombres" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.nombres && <p className="error">{errores.nombres}</p>}
                </div>

                <div>
                    <label>Apellidos</label>
                    <input type="text" name="apellidos" placeholder="Apellidos" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.apellidos && <p className="error">{errores.apellidos}</p>}
                </div>

                <div>
                    <label>Fecha de Nacimiento</label>
                    <input type="date" name="fechaNacimiento" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.fechaNacimiento && <p className="error">{errores.fechaNacimiento}</p>}
                </div>

                <div>
                    <label>Correo</label>
                    <input type="email" name="correo" placeholder="Correo" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.correo && <p className="error">{errores.correo}</p>}
                </div>

                <div>
                    <label>Contraseña</label>
                    <input type="password" name="contrasena" placeholder="Contraseña"
                           onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.contrasena && <p className="error">{errores.contrasena}</p>}
                </div>

                <div>
                    <label>Teléfono</label>
                    <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.telefono && <p className="error">{errores.telefono}</p>}
                </div>

                <div>
                    <label htmlFor="genero">Género</label>
                    <select id="genero" name="genero" value={formData.genero} onChange={handleChange}  onFocus={handleFocus} /*required*/>
                        <option value="" disabled>Seleccionar Género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                    {errores.genero && <p className="error">{errores.genero}</p>}
                </div>

                <div>
                    <label>Residencia</label>
                    <input type="text" name="residencia" placeholder="Residencia" onChange={handleChange} onFocus={handleFocus} /*required*//>
                    {errores.residencia && <p className="error">{errores.residencia}</p>}
                </div>

                <div>
                    <label>Ficha</label>
                    <select name="ficha" value={formData.ficha} onChange={handleChange} onFocus={handleFocus} /*required*/
                            className="opciones">
                        <option value="" disabled>Seleccione su ficha</option>
                        {fichas.map(ficha => (
                            <option key={ficha.idFicha} value={ficha.idFicha}
                                    className="opciones">{`${ficha.numeroFicha} ${ficha.nombrePrograma}`}</option>
                        ))}
                    </select>
                    {errores.ficha && <p className="error">{errores.ficha}</p>}
                </div>

                {errores.general && <p className="error">{errores.general}</p>}

                <button type="submit" disabled={loading}>{loading ? "Registrandose..." : "Registrarse"}</button>
            </form>
        </div>
    );
};


