import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // Asegúrate de crear este archivo para los estilos
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Heart,
} from "lucide-react";

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
      const response = await axios.post(`${API_URL}/password-reset/request`, {
        email,
      });
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
    <div className="recuperacion-wrapper">
      <div className="tarjeta-recuperacion">
        <h1>Recuperar Contraseña</h1>
        <p>
          Ingresa tu correo electrónico para recibir un enlace de
          restablecimiento.
        </p>
        <form className="formulario-recuperacion" onSubmit={handleSubmit}>
          <div>
            <label>Correo Electrónico</label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                required
                disabled={success || loading}
              />
              <Mail className="input-icon" />
            </div>
          </div>
          <div className="botones-recuperacion">
            <button
              type="button"
              className="boton-cancelar"
              onClick={() => navigate("/login")}
              disabled={loading || success}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-enviar"
              disabled={loading || success}
            >
              {loading && <Loader2 className="loading-spinner" />}
              {loading ? "Enviando..." : "Enviar"}
              
              
            </button>
          </div>
        </form>
        {/* {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-modal-overlay">
            <div className="success-modal-content">
              <h2>¡Enlace de restablecimiento enviado exitosamente!</h2>
              <p>
                Se ha enviado un enlace de restablecimiento a tu correo. Serás
                redirigido al login.
              </p>
            </div>
          </div>
        )} */}
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <h2>¡Enlace de restablecimiento enviado exitosamente!</h2>
            <p>
              Se ha enviado un enlace de restablecimiento a tu correo. Serás
              redirigido al login.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
