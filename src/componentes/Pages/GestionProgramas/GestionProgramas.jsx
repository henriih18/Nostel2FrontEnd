import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AgregarPrograma } from './AgregarPrograma';


export const GestionProgramas = () => {
  const [programas, setProgramas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerProgramas();
  }, []);

  const manejarAgregarPrograma = () => {
    // Navegar al formulario para agregar un nuevo programa
    navigate('/agregar-programa');
  };

  const obtenerProgramas = async () => {
    try {
      // Obtener el token del localStorage
      const token = sessionStorage.getItem('token');

      if (!token) {
        console.error('No hay token de autenticación');
        setError('Sesión no válida. Por favor inicie sesión nuevamente.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      // Configurar los headers con el token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Realizar la petición para obtener los programas
      const respuesta = await axios.get('http://localhost:8080/api/programas', config);

      // Actualizar el estado con los programas obtenidos
      setProgramas(respuesta.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al obtener programas:', error);

      // Manejo de errores específicos
      if (error.response) {
        if (error.response.status === 403) {
          setError('No tiene permisos para acceder a esta información. Este recurso está restringido.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (error.response.status === 401) {
          setError('Sesión no válida. Por favor inicie sesión nuevamente.');
          localStorage.removeItem('token');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(`Error del servidor: ${error.response.status}. Por favor, inténtelo de nuevo más tarde.`);
        }
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifique su conexión a internet.');
      } else {
        setError(`Error: ${error.message}`);
      }

      setCargando(false);
    }
  };

  if (cargando) return <div className="loading-container">Cargando programas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
      <div className="gestion-programas-container">
        <h2>Lista de Programas Formativos</h2>

        {programas.length === 0 ? (
            <p className="no-programas">No hay programas registrados.</p>
        ) : (
            <ul className="programas-list">
              {programas.map(programa => (
                  <li key={programa.idPrograma} className="programa-item">
                    <div className="programa-nombre">{programa.nombrePrograma}</div>

                  </li>
              ))}
            </ul>
        )}
        <button onClick={manejarAgregarPrograma} className="add-program-button">Agregar Nuevo Programa</button>

      </div>
  );
};

export default GestionProgramas;
