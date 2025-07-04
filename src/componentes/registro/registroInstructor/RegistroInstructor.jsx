import React, { useState } from "react";
import axios from "axios";
 // Usa el mismo estilo
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const RegistroInstructor = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    numeroDocente: "",
    area: "",
    correo: "",
    contrasena: "",
    telefono: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();


  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (Object.values(formData).some((field) => !field)) {
      toast.warn("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/instructores/RegistroInstructor`, formData);
      
      toast.success("Instructor registrado exitosamente");
      setFormData({
        nombres: "",
        apellidos: "",
        numeroDocente: "",
        area: "",
        correo: "",
        contrasena: "",
        telefono: "",
      });
      navigate("/login")
    } catch (err) {
      const msg = err.response?.data?.message || "Error al registrar instructor";
      toast.error(msg);
    }
  };

  return (
    <div className="registro-container">
      <form className="registro-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Registro de Instructores</h1>

        <div className="form-section">
          <div className="form-row">
            <div className="field-group">
              <label>Nombres</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres del instructor"
                required
              />
            </div>
            <div className="field-group">
              <label>Apellidos</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Apellidos del instructor"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Número Docente</label>
              <input
                type="number"
                name="numeroDocente"
                value={formData.numeroDocente}
                onChange={handleChange}
                placeholder="Número de documento"
                required
              />
            </div>
            <div className="field-group">
              <label>Área</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Área de formación"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="Correo del instructor"
                required
              />
            </div>
            <div className="field-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Contraseña"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Teléfono de contacto"
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" className="registro-button">
          Registrar Instructor
        </button>
      </form>
    </div>
  );
};

export default RegistroInstructor;
