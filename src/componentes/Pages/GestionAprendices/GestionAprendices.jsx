/*
import React from 'react';

export const GestionAprendices = () => {
  return <div>Gestión de Actividades Complementarias</div>;
};

export default GestionAprendices;*/

import { useEffect, useState } from 'react';
import axios from 'axios';

export const GestionAprendices = () => {
  const [aprendices, setAprendices] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/aprendices')
      .then(response => response.json())
      .then(data => setAprendices(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  {Array.isArray(aprendices) && aprendices.map(aprendiz => (
    <div key={aprendiz.id}>{aprendiz.nombre}</div>
  ))}
  

  return (
      <div>
        <h1>Lista de Aprendices</h1>
        <ul>
          {aprendices.map(aprendiz => (
              <li key={aprendiz.id}>
                {aprendiz.primer_nombre} {aprendiz.primer_apellido}
              </li>
          ))}
        </ul>

        
      </div>
  );
};

export default GestionAprendices;

