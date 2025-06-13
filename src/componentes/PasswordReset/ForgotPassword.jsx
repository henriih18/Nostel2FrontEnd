import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // Asegúrate de crear este archivo para los estilos

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Enviando email:", email); // Depuración
      const response = await axios.post(
        `${API_URL}/password-reset/request`,
        { email }
      );
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // Redirigir después de 5 segundos
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al enviar la solicitud. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="PrincipalContainer">
      <div className="loginContainer">
        <h1>Recuperar Contraseña</h1>
        <p>Ingresa tu correo electrónico para recibir un enlace de restablecimiento.</p>
        <form className="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              required
              disabled={success || loading}
            />
          </div>
          <div className="form-actions-send">
            <button type="button" className="cancel-button-send" onClick={() => navigate("/login")} disabled={loading || success}>
              Cancelar
            </button>
            <button type="submit" className="submit-button-send" disabled={loading || success}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-modal-overlay">
            <div className="success-modal-content">
              <h2>¡Enlace de restablecimiento enviado exitosamente!</h2>
              <p>Se ha enviado un enlace de restablecimiento a tu correo. Serás redirigido al login en 5 segundos.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
