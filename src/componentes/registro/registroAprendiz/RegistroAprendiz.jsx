import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import "./RegistroAprendiz.css"


export const RegistroAprendiz = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        documento: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        fechaNacimiento: "",
        correo: "",
        genero: "",
        contrasena: "",
        telefono: "",
        residencia: "",
        grupoEtnico: "",
        numeroFicha: "",
        nombrePrograma: "",
        numeroAmbiente: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/api/aprendices", formData);
            alert("Registro exitoso. Ahora inicia sesión.");
            navigate("/login"); // Redirige a la página de Login o Home
        } catch (error) {
            alert("Error en el registro, intenta de nuevo.");
        }
    };

    return (
        <div className="registro-container">
            <h1>Registro de Aprendiz</h1>
            <form onSubmit={handleSubmit} className="registro-form">
                <div>
                    <label>Documento</label>
                    <input type="int" name="documento" placeholder="Numero de documento" onChange={handleChange}  required />
                </div>

                <div>
                    <label>Primer Nombre</label>
                    <input type="text" name="primerNombre" placeholder="Primer Nombre" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Segundo Nombre</label>
                    <input type="text" name="segundoNombre" onChange={handleChange}/>
                </div>

                <div>
                    <label>Primer Apellido</label>
                    <input type="text" name="primerApellido" placeholder="Primer Apellido" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Segundo Apellido</label>
                    <input type="text" name="segundoApellido" placeholder="Segundo Apellido" onChange={handleChange} required/>
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
                    <label>Telefono</label>
                    <input type="text" name="telefono" placeholder="Teléfono" onChange={handleChange} required/>
                </div>

                <div>
                    <label>Genero</label>
                    <select name="genero" value={formData.genero} onChange={handleChange} required>
                        <option value="" disabled hiden>Seleccionar Género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div>
                    <label>Residencia</label>
                    <input type="text" name="residencia" placeholder="Residencia" onChange={handleChange} required/>
                </div>
{/*

                <div>
                    <label>Grupo Etnico</label>
                    <input type="text" name="grupoEtnico" placeholder="Grupo Étnico" onChange={handleChange}/>
                </div>
*/}

                <div>
                    <label>Ficha</label>
                    <input type="number" name="numeroFicha" placeholder="Número de Ficha" onChange={handleChange} required/>
                </div>

                {/*<div>
                    <label>Nombre de Programa</label>
                    <input type="text" name="nombrePrograma" placeholder="Nombre del Programa" onChange={handleChange}/>
                </div>

                <div>
                    <label>Numero de Ambiente</label>
                    <input type="number" name="numeroAmbiente" placeholder="Número de Ambiente" onChange={handleChange}/>
                </div>*/}

                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};
