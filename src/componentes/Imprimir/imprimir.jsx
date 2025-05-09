import React from "react";
import "./imprimir.css"; // Estilos específicos para impresión

const ImprimirActividad = ({ actividad }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="imprimir-contenido">
      <div className="header-imprimir">
        <h2>Actividad Complementaria - SENA</h2>
        <p><strong>Acta #:</strong> {actividad.actaNumber}</p>
        <p><strong>Comité:</strong> {actividad.nombreComite}</p>
        <p><strong>Fecha:</strong> {formatDate(actividad.fecha)}</p>
        <p><strong>Hora:</strong> {actividad.horaInicio} - {actividad.horaFin}</p>
        <p><strong>Lugar/Enlace:</strong> {actividad.lugarEnlace}</p>
        <p><strong>Dirección Regional/Centro:</strong> {actividad.direccionRegionalCentro}</p>
      </div>

      <div className="section-imprimir">
        <h3>Detalles de la Actividad</h3>
        <p><strong>Estado:</strong> {actividad.estado}</p>
        <p><strong>Ciudad:</strong> {actividad.ciudad}</p>
        <h4>Agenda</h4>
        <p>{actividad.agenda || "No especificada"}</p>
        <h4>Objetivos</h4>
        <p>{actividad.objetivos || "No especificados"}</p>
        <h4>Desarrollo</h4>
        <p>{actividad.desarrollo || "No especificado"}</p>
        <h4>Conclusiones</h4>
        <p>{actividad.conclusiones || "No especificadas"}</p>
      </div>

      <div className="section-imprimir">
        <h3>Compromisos</h3>
        {actividad.compromisos && actividad.compromisos.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Actividad/Decisión</th>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Firma</th>
              </tr>
            </thead>
            <tbody>
              {actividad.compromisos.map((compromiso) => (
                <tr key={compromiso.idCompromiso}>
                  <td>{compromiso.actividadDecision}</td>
                  <td>{formatDate(compromiso.fecha)}</td>
                  <td>{compromiso.responsable}</td>
                  <td>{compromiso.firmaParticipacion || "Pendiente"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay compromisos registrados.</p>
        )}
      </div>

      <div className="section-imprimir">
        <h3>Asistentes</h3>
        {actividad.asistentes && actividad.asistentes.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dependencia/Empresa</th>
                <th>Aprueba</th>
                <th>Observación</th>
                <th>Firma</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {actividad.asistentes.map((asistente) => (
                <tr key={asistente.idAsistente}>
                  <td>{asistente.nombre}</td>
                  <td>{asistente.dependenciaEmpresa}</td>
                  <td>{asistente.aprueba}</td>
                  <td>{asistente.observacion || "N/A"}</td>
                  <td>{asistente.firmaParticipacion || "Pendiente"}</td>
                  <td>{asistente.rol || "Participante"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay asistentes registrados.</p>
        )}
      </div>

      <div className="footer-imprimir">
        <p>Documento generado por el Sistema Nostel - SENA Colombia</p>
        <p>Fecha de impresión: {new Date().toLocaleDateString("es-ES")}</p>
      </div>
    </div>
  );
};

export default ImprimirActividad;