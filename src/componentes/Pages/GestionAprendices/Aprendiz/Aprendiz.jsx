import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ActividadesComplementarias from "../Actividades/ActividadesComplementarias";
import PlanesMejoramiento from "../PlanesMejoramiento/PlanesMejoramiento";
import Comentarios from "../Comentarios/Comentarios";
import "./Aprendiz.css";

const Aprendiz = () => {
  const { idAprendiz } = useParams();
  const [aprendiz, setAprendiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seccion, setSeccion] = useState("informacion");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAprendiz = async () => {
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
          `http://localhost:8080/aprendices/${idAprendiz}`,
          config
        );
        setAprendiz(response.data);
        setLoading(false);
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          sessionStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Error al cargar el aprendiz.");
        }
        setLoading(false);
      }
    };

    fetchAprendiz();
  }, [idAprendiz, navigate]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!aprendiz) return <div>No se encontró el aprendiz</div>;

  return (
    <>
      <div className="containerAprendiz">
        <div className="containerHeaderSelect">
          <h2>Detalles del Aprendiz</h2>

          <select
            className="containerSelect"
            value={seccion}
            onChange={(e) => setSeccion(e.target.value)}
          >
            <option value="informacion">Información del Aprendiz</option>
            <option value="actividades">Actividades Complementarias</option>
            <option value="planes">Planes de Mejoramiento</option>
            <option value="comentarios">Comentarios</option>
          </select>
        </div>

        {seccion === "informacion" && (
          <div className="containerInfo">
            <h3>Información del Aprendiz</h3>
            <div className="info">
              <p>
                <strong>Documento:</strong> {aprendiz.document}
              </p>
              <p>
                <strong>Nombres:</strong> {aprendiz.nombres}
              </p>
              <p>
                <strong>Apellidos:</strong>
                {aprendiz.apellidos}
              </p>
              <p>
                <strong>Fecha Nacimiento: </strong> {aprendiz.fechaNacimiento}{" "}
              </p>
              <p>
                <strong>Genero:</strong> {aprendiz.genero}{" "}
              </p>
              <p>
                <strong>Correo:</strong> {aprendiz.correo}{" "}
              </p>
              <p>
                <strong>Telefono:</strong> {aprendiz.telefono}{" "}
              </p>
              <p>
                <strong>Residencia:</strong> {aprendiz.residencia}{" "}
              </p>

              <button>Editar Informacion</button>
            </div>
          </div>
        )}

        {seccion === "actividades" && (
          <ActividadesComplementarias idAprendiz={idAprendiz} />
        )}
        {seccion === "planes" && <PlanesMejoramiento idAprendiz={idAprendiz} />}
        {seccion === "comentarios" && <Comentarios idAprendiz={idAprendiz} />}
      </div>
    </>
  );
};

export default Aprendiz;
