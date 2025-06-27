import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Instructor.css";

const Instructor = () => {
  const { idInstructor } = useParams(); // id del usuario
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInstructor = async () => {
      const token = sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const response = await axios.get(
          `${API_URL}/instructores/${idInstructor}`,
          config
        );
        setInstructor(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          sessionStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Error al cargar el instructor.");
        }
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [idInstructor, navigate]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!instructor) return <div>No se encontró el instructor</div>;

  return (
    <div className="containerInstructor">
      <h2>Perfil del Instructor</h2>
      <div className="info">
        <p><strong>Documento:</strong> {instructor.numeroDocente}</p>
        <p><strong>Nombres:</strong> {instructor.nombres}</p>
        <p><strong>Apellidos:</strong> {instructor.apellidos}</p>
        <p><strong>Correo:</strong> {instructor.correo}</p>
        <p><strong>Teléfono:</strong> {instructor.telefono}</p>
        <p><strong>Área:</strong> {instructor.area}</p>
        <button>Editar Información</button>
      </div>
    </div>
  );
};

export default Instructor;
