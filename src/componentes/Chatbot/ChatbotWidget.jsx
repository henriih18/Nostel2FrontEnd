import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ChatbotWidget.css";

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const widgetRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Mantener el scroll al fondo cada vez que cambian los mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Listener para clics fuera del chatbot (para cerrarlo)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1) Insertar burbuja del usuario
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        const errTxt = "No hay token de autenticación disponible. Redirigiendo al login.";
        addBotMessage(errTxt);
        setLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
        return;
      }

      // 2) Validar que el prompt contenga "documento 123456"
      const documentoMatch = input.match(/documento\s+(\d+)/i);
      const documento = documentoMatch ? documentoMatch[1] : null;
      if (!documento) {
        const msg = "Por favor, incluye un número de documento en el prompt (ej: 'documento 123422').";
        addBotMessage(msg);
        setLoading(false);
        return;
      }

      // 3) Llamar al backend para generar la actividad
      const requestBody = {
        messages: [{ content: input }],
        idFicha: "",
        temperature: 0.2,
        maxOutputTokens: 1024,
      };

      const { data: actividadGenerada } = await axios.post(
        "http://localhost:8080/api/gemini/generate",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (actividadGenerada.status === "success") {
        // Construir texto con saltos de línea para la burbuja
        const tipoDocumento = actividadGenerada.tipoDocumento === "actividad complementaria" ? "Actividad Complementaria" : "Plan de Mejoramiento";
        const respuestaTexto = `
${tipoDocumento} generada:
Nombre del Comité: ${actividadGenerada.nombreComite}
Agenda o Puntos para Desarrollar: ${actividadGenerada.agenda}
Objetivos de la Reunión: ${actividadGenerada.objetivos}
Desarrollo de la Reunión: ${actividadGenerada.desarrollo}
Conclusiones: ${actividadGenerada.conclusiones}
        `.trim();

        addBotMessage(respuestaTexto);

        // 4) Redirigir según el tipo de documento tras breve delay
        setTimeout(() => {
          const route =
            actividadGenerada.tipoDocumento === "actividad complementaria"
              ? `/agregar-actividad/${actividadGenerada.idAprendiz}`
              : `/agregar-plan/${actividadGenerada.idAprendiz}`;
          navigate(route, {
            state: { actividadGenerada },
          });
        }, 1000);
      } else if (actividadGenerada.status === "incomplete") {
        const msg = actividadGenerada.message || "Respuesta incompleta.";
        addBotMessage(msg);
      }
    } catch (err) {
      console.error("Error al procesar la solicitud:", err);
      const msg =
        err.response?.data?.error ||
        "Error al procesar la solicitud: " + err.message;
      addBotMessage(msg);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="chatbot-widget" ref={widgetRef}>
      {/* Botón circular para abrir/cerrar */}
      <button
        className={`chatbot-toggle-button ${loading ? "blink" : ""}`}
        onClick={() => {
          setIsOpen((o) => !o);
        }}
      >
        💬
      </button>

      {isOpen && (
        <div className="chatbot-content">
          {/* Área de mensajes */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.from}`}>
                <div className="message-content">
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario */}
          <form className="chatbot-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: 'Haz una actividad para el aprendiz con documento 123422' o 'Haz un plan para el aprendiz con documento 123422'"
              disabled={loading}
            />
            <button
              type="submit"
              className={loading ? "blink" : ""}
              disabled={loading || !input.trim()}
            >
              {loading ? "Procesando..." : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;