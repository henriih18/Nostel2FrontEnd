// EditarComentario.jsx
import React, { useState } from 'react';
import axios from 'axios';

const EditarComentario = ({ comentario, onComentarioActualizado, onClose }) => {
  const [formData, setFormData] = useState({
    fechaComentario: comentario.fechaComentario.split('T')[0],
    comentario: comentario.comentario,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Sin token de autenticación');

      const url = `http://localhost:8080/comentarios/${comentario.idAprendiz}/${comentario.idComentario}`;
      const res = await axios.put(
        url,
        {
          fechaComentario: formData.fechaComentario,
          comentario: formData.comentario,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(true);
      onComentarioActualizado(res.data);
    } catch (err) {
      console.error('Error al actualizar comentario:', err);
      setError(err.response?.data?.message || 'Error al actualizar el comentario.');
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
                disabled
                
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group wide">
              <label>Comentario</label>
              <textarea
                name="comentario"
                value={formData.comentario}
                onChange={handleChange}
                rows={5}
                placeholder="Escribe el comentario detalladamente..."
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
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
