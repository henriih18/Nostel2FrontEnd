import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Extraer el token de los parámetros de la URL
    const token = searchParams.get("token");
    if (!token) {
      setError("No se proporcionó un token válido.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const token = searchParams.get("token");
      await axios.post("http://localhost:8080/password-reset/reset", {
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 5000); // Redirigir después de 5 segundos
    } catch (err) {
      setError(err.response?.data?.message || "Error al restablecer la contraseña.");
    }
  };

  return (
    <div className="principal-container">
        <div className="loginContainer">

        
      <h1>Restablecer Contraseña</h1>
      <p>Ingresa tu nueva contraseña a continuación.</p>
      <form onSubmit={handleSubmit} className="loginForm">
        <div className="form-group">
          <label>Nueva Contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Ingresa nueva contraseña"
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirma nueva contraseña"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Cambiar Contraseña
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Contraseña restablecida con éxito. Serás redirigido al login en 5 segundos.
        </div>
      )}
      </div>
    </div>
  );
};

export default ResetPassword;