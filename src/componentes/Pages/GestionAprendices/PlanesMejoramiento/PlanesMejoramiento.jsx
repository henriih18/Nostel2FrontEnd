// src/components/planes/PlanesMejoramiento.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import EditarPlanMejoramiento from "./EditarPlanMejoramiento"

import AgregarPlanMejoramiento from "./AgregarPlanMejoramiento";
//import EditarPlanMejoramiento from "./EditarPlanMejoramiento";

// ——— Importa el mismo CSS que usa ActividadesComplementarias ———
//import "./actividadComplementaria.css";

import logoSena from "../../../../assets/images/logoSena.png";
import { toast } from "react-toastify";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts?.default?.pdfMake?.vfs || pdfFonts?.pdfMake?.vfs;

const PlanesMejoramiento = ({ idAprendiz }) => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planEditar, setPlanEditar] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [planAEliminar, setPlanAEliminar] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState({
    type: "",
    message: "",
  });
  const [instructor, setInstructor] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ——— ¡Usamos el MISMO currentSection que Actividades! ———
  // Dejar “actividades” para la primera pestaña (aunque aquí sea Acta de Plan).
  const [currentSection, setCurrentSection] = useState("actividades");
  const API_URL = import.meta.env.VITE_API_URL;

  // Referencias para impresión (idéntico a Actividades)
  /* const actaRef = useRef();
  const registroRef = useRef(); */

  // 0) Manejo de ESC para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setCurrentSection("actividades"); // igual que en Actividades
      }
    };
    if (showDetailsModal || showEditModal) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [showDetailsModal, showEditModal]);

  // 1) Cargar planes de mejoramiento
  useEffect(() => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      toast.error("ID del aprendiz invalido.");
      /* setError("ID de aprendiz inválido."); */
      setLoading(false);
      return;
    }
    const fetchPlanes = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const resp = await axios.get(
          `${API_URL}/planMejoramientos/${idAprendiz}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        /* console.log("Planes recibidos:", resp.data); */
        setPlanes(resp.data);
        setError(null);
      } catch (err) {
        toast.error("Error al cargar los planes de mejormaiento");
        /* console.error("Error al cargar planes:", err); */
        /* setError("Error al cargar los planes de mejoramiento."); */
      } finally {
        setLoading(false);
      }
    };
    fetchPlanes();
  }, [idAprendiz, navigate]);

  // 2) Obtener datos del instructor
  useEffect(() => {
    const obtenerDatosInstructor = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const idUsuario = sessionStorage.getItem("idUsuario");
        if (!token || !idUsuario) return;
        const response = await axios.get(
          `${API_URL}/instructores/usuario/${idUsuario}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setInstructor(response.data);
      } catch (err) {
        /* toast.error("Error al obtener datos del instructor") */
        /*  console.error("Error al obtener datos del instructor:", err); */
      }
    };
    obtenerDatosInstructor();
  }, []);

  // 3) Verificar si el plan es del instructor actual
  const esAutor = (plan) => {
    const idUsuario = sessionStorage.getItem("idUsuario");
    if (!idUsuario || !instructor || !instructor.idInstructor) return false;
    return plan.idInstructor === instructor.idInstructor;
  };

  // 4) Ir a Crear Plan
  const handleAgregarPlan = () => {
    if (!idAprendiz || isNaN(idAprendiz)) {
      toast.error("ID de aprendiz inválido. No se puede agregar plan.");
      /* setError("ID de aprendiz inválido. No se puede agregar plan."); */
      return;
    }
    navigate(`/agregar-plan/${idAprendiz}`);
  };

  // 5) Actualizar plan
  /* const handlePlanActualizado = (planActualizado) => {
    setPlanes((prev) =>
      prev.map((p) =>
        p.idPlanMejoramiento === planActualizado.idPlanMejoramiento
          ? planActualizado
          : p
      )
    );
    setShowEditModal(false);
    setPlanEditar(null);
  }; */

  const handlePlanActualizado = (planActualizado) => {
    try {
      setPlanes((prev) =>
        prev.map((p) =>
          p.idPlanMejoramiento === planActualizado.idPlanMejoramiento
            ? planActualizado
            : p
        )
      );
      setShowEditModal(false);
      setPlanEditar(null);
      toast.success("Plan de mejoramiento actualizado con éxito.");
    } catch (err) {
      toast.error("Error al actualizar el plan de mejoramiento.");
    }
  };

  // 6) Abrir modal de edición
  const handleEditarPlan = (plan) => {
    setPlanEditar(plan);
    setShowEditModal(true);
  };

  // 7) Eliminar plan
  /* const handleEliminarPlan = async (idPlanMejoramiento) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Sin token de autenticación");
      const res = await axios.delete(
        `${API_URL}/planMejoramientos/${idAprendiz}/${idPlanMejoramiento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status >= 200 && res.status < 300) {
        setPlanes((prev) =>
          prev.filter((p) => p.idPlanMejoramiento !== idPlanMejoramiento)
        );
        setTimeout(() => {
          setPlanAEliminar(null);
          setDeleteFeedback({
            type: "success",
            message: "El plan de mejoramiento ha sido eliminado correctamente",
          });
        }, 2000);
      } else {
        setTimeout(() => {
          setPlanAEliminar(null);
          setDeleteFeedback({
            type: "error",
            message: "No se pudo eliminar el plan.",
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Error al eliminar plan:", err);
      setDeleteFeedback({
        type: "error",
        message: "Error al eliminar el plan de mejoramiento.",
      });
    }
  }; */
  const handleEliminarPlan = async (idPlanMejoramiento) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Sin token de autenticacion");
      }

      // Cierra el modal inmediatamente
      setPlanAEliminar(null);

      const res = await axios.delete(
        `${API_URL}/planMejoramientos/${idAprendiz}/${idPlanMejoramiento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status >= 200 && res.status < 300) {
        setPlanes((prev) =>
          prev.filter((p) => p.idPlanMejoramiento !== idPlanMejoramiento)
        );
        toast.success("Plan de mejoramiento eliminado con exito.");
      } else {
        toast.error("No se pudo eliminar el plan de mejoramiento.");
      }
    } catch (err) {
      toast.error("Error al eliminar el plan de mejoramiento.");
    }
  };

  const convertirImagenABase64 = (url, opacity = 0.6) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // necesario si la imagen está en otra ruta/origen
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity; // Aplica opacidad al dibujar
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  function parseParrafosHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const paragraphs = Array.from(div.querySelectorAll("p"));

    // Retorna un array de objetos de texto con salto de línea entre párrafos
    return paragraphs.map((p) => ({
      text: p.textContent.trim(),
      margin: [0, 0, 0, 6], // Espacio entre párrafos
    }));
  }

  // 8) Imprimir “Acta” 
  const generarActa = async () => {
      const logoBase64 = await convertirImagenABase64(logoSena, 0.6);
      const acta = selectedPlan;
  
      const docDefinition = {
        pageSize: "LETTER",
        pageMargins: [72, 85, 72, 72],
        header: {
          margin: [40, 30, 40, 0],
          columns: [
            { width: "*", text: "" }, // espacio izquierdo
            {
              image: logoBase64,
              width: 50,
              alignment: "center",
              margin: [0, 0, 0, 0],
            },
            { width: "*", text: "" }, // espacio derecho
          ],
        },
        footer: function (currentPage, pageCount) {
          return {
            margin: [40, 10, 40, 20],
            columns: [
              {
                text: "GOR-F-084 V02",
                alignment: "center",
                fontSize: 12,
                margin: [0, 5, 0, 0],
                opacity: 0.6,
              },
            ],
          };
        },
        content: [
          {
            table: {
              widths: ["*", "*", "*", "*", "*"],
              body: [
                [
                  {
                    text: `ACTA No. ${acta?.actaNumber || ""}`,
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    colSpan: 5,
                    text: [
                      { text: "NOMBRE DEL COMITÉ O DE LA REUNIÓN: ", bold: true },
                      { text: acta?.nombreComite || "" },
                    ],
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    colSpan: 2,
                    text: [
                      { text: "CIUDAD Y FECHA: ", bold: true },
                      {
                        text: `${acta?.ciudad || ""}, ${
                          formatDate(acta?.fecha) || ""
                        }`,
                      },
                    ],
                  },
  
                  {},
                  "",
                  {
                    text: [
                      { text: "HORA INICIO: ", bold: true },
                      { text: acta?.horaInicio || "" },
                    ],
                  },
                  {
                    text: [
                      { text: "HORA FIN: ", bold: true },
                      { text: acta?.horaFin || "" },
                    ],
                  },
                ],
                [
                  {
                    colSpan: 2,
                    text: [
                      { text: "LUGAR Y/O ENLACE: ", bold: true },
                      { text: acta?.lugarEnlace || "" },
                    ],
                  },
  
                  {},
                  "",
                  {
                    colSpan: 2,
                    text: [
                      { text: "DIRECCIÓN / REGIONAL / CENTRO: ", bold: true },
                      { text: acta?.direccionRegionalCentro || "" },
                    ],
                  },
                  {},
                ],
                [
                  {
                    text: "AGENDA O PUNTOS PARA DESARROLLAR:",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  { colSpan: 5, stack: parseParrafosHTML(acta?.agenda || "") },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: "OBJETIVO(S) DE LA REUNIÓN:",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  { colSpan: 5, stack: parseParrafosHTML(acta?.objetivos || "") },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: "DESARROLLO DE LA REUNIÓN",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    colSpan: 5,
                    stack: parseParrafosHTML(acta?.desarrollo || ""),
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: "CONCLUSIONES",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    colSpan: 5,
                    stack: parseParrafosHTML(acta?.conclusiones || ""),
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: "ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  {
                    text: "ACTIVIDAD / DECISIÓN",
                    colSpan: 2,
                    style: "tableHeader",
                  },
                  {},
                  { text: "FECHA", style: "tableHeader" },
                  { text: "RESPONSABLE", style: "tableHeader" },
                  { text: "FIRMA O PARTICIPACIÓN VIRTUAL", style: "tableHeader" },
                ],
                ...(acta?.compromisosPlan || []).map((c) => [
                  { text: c.planDecision || "", colSpan: 2 },
                  {},
                  formatDate(c.fecha) || "",
                  c.responsable || "",
                  c.firmaParticipacion || "",
                ]),
                [
                  {
                    text: "ASISTENTES Y APROBACIÓN DECISIONES",
                    colSpan: 5,
                    bold: true,
                    alignment: "center",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
                [
                  { text: "NOMBRE", style: "tableHeader" },
                  { text: "DEPENDENCIA / EMPRESA", style: "tableHeader" },
                  { text: "APRUEBA (SI/NO)", style: "tableHeader" },
                  { text: "OBSERVACIÓN", style: "tableHeader" },
                  { text: "FIRMA O PARTICIPACIÓN VIRTUAL", style: "tableHeader" },
                ],
                ...(acta?.asistentesPlan || []).map((a) => [
                  a.nombre || "",
                  a.dependenciaEmpresa || "",
                  a.aprueba || "",
                  a.observacion || "",
                  a.firmaParticipacion || "",
                ]),
                [
                  {
                    text: "De acuerdo con la Ley 1581 de 2012, Protección de Datos Personales, el Servicio Nacional de Aprendizaje SENA se compromete a garantizar la seguridad y protección de los datos personales que se encuentran almacenados en este documento, y les dará el tratamiento correspondiente en cumplimiento de lo establecido legalmente.",
                    colSpan: 5,
                    fontSize: 9,
                    alignment: "justify",
                  },
                  {},
                  {},
                  {},
                  {},
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#000000",
              vLineColor: () => "#000000",
            },
          },
        ],
        styles: {
          titulo: { fontSize: 12, bold: true },
          tableHeader: { bold: true },
        },
      };
  
      pdfMake.createPdf(docDefinition).open();
    };
  

  // 9) Imprimir “Registro” 
  const generarRegistroAsistencia = async () => {
      const logoBase64 = await convertirImagenABase64(logoSena, 0.6);
      const acta = selectedPlan;
  
      // Encabezado fecha desglosada
      const { dia, mes, anio } = formatFechaModal(acta.fecha || new Date());
  
      // Armar filas de asistentes (máximo 15)
      const asistentes = acta.asistentesPlan || [];
      const filasAsistentes = [];
      for (let i = 0; i < asistentes.length; i++) {
        const a = asistentes[i];
        filasAsistentes.push([
          { text: `${i + 1}`, alignment: "center", fontSize: 8, margin: [0, 3] },
          { text: a.nombre || "", fontSize: 8, margin: [0, 3] },
          { text: a.numeroDocumento || "", fontSize: 8, margin: [0, 3] },
          { text: a.planta ? "SI" : "NO", fontSize: 8, margin: [0, 3] },
          { text: a.contratista ? "SI" : "NO", fontSize: 8, margin: [0, 3] },
          { text: a.otro || "", fontSize: 8, margin: [0, 3] },
          { text: a.dependenciaEmpresa || "", fontSize: 8, margin: [0, 3] },
          { text: a.correoElectronico || "", fontSize: 8, margin: [0, 3] },
          { text: a.telefonoExt || "", fontSize: 8, margin: [0, 3] },
          {
            text: a.autorizaGrabacion ? "SÍ" : "NO",
            fontSize: 8,
            margin: [0, 3],
          },
          { text: a.firmaParticipacion || "", fontSize: 8, margin: [0, 3] },
        ]);
      }
      // Luego completas hasta 15 con celdas vacías
      for (let i = asistentes.length; i < 12; i++) {
        filasAsistentes.push([
          { text: `${i + 1}`, alignment: "center", fontSize: 8, margin: [0, 3] },
          ...Array(10).fill({ text: "", fontSize: 8 }),
        ]);
      }
  
      const docDefinition = {
        pageSize: "LETTER",
        pageOrientation: "landscape",
        pageMargins: [60, 85, 72, 72],
        header: {
          margin: [40, 20, 40, 0],
          columns: [
            { width: "*", text: "" },
            {
              image: logoBase64,
              width: 50,
              alignment: "center",
              opacity: 0.6,
            },
            { width: "*", text: "" },
          ],
        },
        footer: function () {
          return {
            margin: [40, 0, 40, 20],
  
            text: "GOR-F-085 V02",
            alignment: "center",
            fontSize: 9,
            margin: [0, 5, 0, 0],
            opacity: 0.6,
          };
        },
        content: [
          {
            table: {
              widths: [
                25, // Nº
                90, // NOMBRES Y APELLIDOS
                60, // No. DOCUMENTO
                30, // PLANTA
                30, // CONTRATISTA
                50, // OTRO / ¿CUÁL?
                70, // DEPENDENCIA / EMPRESA
                85, // CORREO ELECTRÓNICO
                50, // TELÉFONO/EXT.
                30, // AUTORIZA GRABACIÓN
                65, // FIRMA O PARTICIPACIÓN VIRTUAL
              ],
              body: [
                [
                  {
                    text: `REGISTRO DE ASISTENCIA / DÍA ${dia} DEL MES DE ${mes} DEL AÑO ${anio}`,
                    colSpan: 11,
                    alignment: "center",
                    fontSize: 9,
                    bold: true,
                  },
                  ...Array(10).fill({}),
                ],
                [
                  {
                    text: "OBJETIVO(S)",
                    bold: true,
                    margin: [2, 3, 2, 3],
                    fontSize: 9,
                  },
                  {
                    stack: parseParrafosHTML(acta?.objetivos || ""),
                    colSpan: 10,
                    fontSize: 8,
                  },
                  ...Array(9).fill({}),
                ],
                [
                  {
                    text: "N°",
                    style: "tableHeader",
                    alignment: "center",
                    fontSize: 8,
                  },
                  {
                    text: "NOMBRES Y APELLIDOS",
                    style: "tableHeader",
                    fontSize: 8,
                  },
                  { text: "No. DOCUMENTO", style: "tableHeader", fontSize: 8 },
                  {
                    text: "PLANTA",
                    style: "tableHeader",
                    alignment: "center",
                    fontSize: 8,
                  },
                  {
                    text: "CONTRATISTA",
                    style: "tableHeader",
                    alignment: "center",
                    fontSize: 6.5,
                  },
                  { text: "OTRO ¿CUÁL?", style: "tableHeader", fontSize: 8 },
                  {
                    text: "DEPENDENCIA / EMPRESA",
                    style: "tableHeader",
                    fontSize: 8,
                  },
                  {
                    text: "CORREO ELECTRÓNICO",
                    style: "tableHeader",
                    fontSize: 8,
                  },
                  { text: "TELÉFONO / EXT.", style: "tableHeader", fontSize: 8 },
                  {
                    text: "AUTORIZA GRABACIÓN",
                    style: "tableHeader",
                    alignment: "center",
                    fontSize: 8,
                  },
                  {
                    text: "FIRMA O PARTICIPACIÓN VIRTUAL",
                    style: "tableHeader",
                    fontSize: 8,
                  },
                ],
                ...filasAsistentes,
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#000000",
              vLineColor: () => "#000000",
            },
          },
          {
            text: "De acuerdo con la Ley 1581 de 2012, Protección de Datos Personales, el Servicio Nacional de Aprendizaje SENA se compromete a garantizar la seguridad y protección de los datos personales que se encuentran almacenados en este documento, y les dará el tratamiento correspondiente en cumplimiento de lo establecido legalmente.",
            fontSize: 8,
            alignment: "justify",
            margin: [40, 15, 0, 0],
          },
        ],
        styles: {
          tableHeader: {
            bold: true,
            fontSize: 8,
            fillColor: "#ffffff", // sin color de fondo
          },
        },
      };
  
      pdfMake.createPdf(docDefinition).open();
    };
  

  // 10) Al hacer clic en un “plan”, abrimos modal detalle
  const handleRowClick = (plan) => {
    setSelectedPlan(plan);
    setShowDetailsModal(true);
    setCurrentSection("actividades"); // Igual que en Actividades
  };

  // Formatear fecha de ejemplo
  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  // Formatear fecha para cabecera “Registro”
  const formatFechaModal = (fecha) => {
    const date = new Date(fecha);
    return {
      dia: date.getDate(),
      mes: date.toLocaleString("default", { month: "long" }),
      anio: date.getFullYear(),
    };
  };

  return (
    <div className="card">
      {/* ===================== Cabecera ===================== */}
      <div className="card-header">
        <h3>Planes de Mejoramiento</h3>
        <button className="add-button" onClick={handleAgregarPlan}>
          <span className="icon-plus">+</span> Agregar Plan de Mejoramiento
        </button>
      </div>

      {/* ===================== Body ===================== */}
      <div className="card-body">
        {loading ? (
          <div className="loading-state">
            <p>Cargando planes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
          </div>
        ) : planes.length === 0 ? (
          <div className="empty-state">
            <p>No hay planes de mejoramiento asignados.</p>
          </div>
        ) : (
          <div className="actividades-grid">
            {planes.map((plan) => (
              <div
                key={plan.idPlanMejoramiento}
                className="actividad-card"
                onClick={() => handleRowClick(plan)}
              >
                <h4>{plan.nombreComite || "Sin comité"}</h4>
                <p>
                  <span>Fecha Asignacion:</span> {formatDate(plan.fecha)}
                </p>
                <p>
                  <span>Fecha Entrega:</span>{" "}
                  {plan.compromisosPlan && plan.compromisosPlan.length > 0
                    ? formatDate(plan.compromisosPlan[0].fecha)
                    : "No definida"}
                </p>
                <p>
                  <span>Estado:</span> {plan.estado}
                </p>
                {esAutor(plan) && (
                  <div
                    className="actividad-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn-editar"
                      onClick={() => handleEditarPlan(plan)}
                    >
                      <span className="icon-edit">✎</span> Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => setPlanAEliminar(plan)}
                    >
                      ✖ Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===================== Modal Edición ===================== */}
      {showEditModal && planEditar && (
        <EditarPlanMejoramiento
          plan={planEditar}
          onClose={() => {
            setShowEditModal(false);
            setPlanEditar(null);
          }}
          onUpdated={handlePlanActualizado}
        />
      )}

      {/* ===================== Confirmar Eliminación ===================== */}
      {planAEliminar && (
        <div
          className="modal-overlay"
          onClick={() => {
            setPlanAEliminar(null);
            setDeleteFeedback({ type: "", message: "" });
          }}
        >
          <div
            className="modal-container-delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>¿Eliminar plan de mejoramiento?</h3>
            </div>
            <div className="modal-body">
              <p>Esta acción no se puede deshacer.</p>
              {deleteFeedback.message && (
                <div
                  className={
                    deleteFeedback.type === "error"
                      ? "error-message"
                      : "success-message"
                  }
                >
                  {deleteFeedback.message}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setPlanAEliminar(null);
                  setDeleteFeedback({ type: "", message: "" });
                }}
              >
                No
              </button>
              <button
                className="submit-button"
                onClick={() => {
                  console.log("Plan a eliminar:", planAEliminar);
                  handleEliminarPlan(planAEliminar.idPlanMejoramiento);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Modal Detalle / Acta / Registro ===================== */}
      {showDetailsModal && selectedPlan && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDetailsModal(false);
            setCurrentSection("actividades"); // igual que en Actividades
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="modal-header">
              <h2>Acta Plan #{selectedPlan.actaNumber}</h2>
            </div>

            {/* Body del modal */}
            <div className="modal-body">
              {/* —————— SECCIÓN "ACTIVIDADES" (equivale a Acta) —————— */}
              {currentSection === "actividades" && (
                <div
                  
                  className={`acta-imprimible ${
                    currentSection === "actividades"
                      ? "slide-in-left"
                      : "slide-out-right"
                  }`}
                >
                  <table className="acta-tabla">
                    <thead>
                      <tr>
                        <th colSpan="5" className="logoActaCell">
                          <img
                            src={logoSena}
                            alt="Logo SENA"
                            className="registro-logo"
                          />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Fila Título */}
                      <tr>
                        <td colSpan="5" className="titulo-principal">
                          ACTA No. {selectedPlan.actaNumber}
                        </td>
                      </tr>

                      {/* Fila Comité */}
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>COMITÉ:</strong> {selectedPlan.nombreComite}
                        </td>
                      </tr>

                      {/* Fila Ciudad/Fecha - Inicio - Fin */}
                      <tr>
                        <td colSpan="2" className="fila-celda">
                          <strong>CIUDAD Y FECHA:</strong> {selectedPlan.ciudad}
                          ,{" "}
                          {new Date(selectedPlan.fecha).toLocaleDateString(
                            "es-ES"
                          )}
                        </td>
                        <td className="fila-celda"></td>
                        <td className="fila-celda">
                          <strong>INICIO:</strong> {selectedPlan.horaInicio}
                        </td>
                        <td className="fila-celda">
                          <strong>FIN:</strong> {selectedPlan.horaFin}
                        </td>
                      </tr>

                      {/* Fila Lugar/Enlace - Dirección/Regional/Centro */}
                      {(selectedPlan.lugarEnlace ||
                        selectedPlan.direccionRegionalCentro) && (
                        <tr>
                          <td colSpan="2" className="fila-celda">
                            <strong>LUGAR Y/O ENLACE:</strong>{" "}
                            {selectedPlan.lugarEnlace || ""}
                          </td>
                          <td className="fila-celda"></td>
                          <td colSpan="2" className="fila-celda">
                            <strong>DIRECCIÓN / REGIONAL / CENTRO:</strong>{" "}
                            {selectedPlan.direccionRegionalCentro || ""}
                          </td>
                        </tr>
                      )}

                      {/* Fila Objetivos */}
                      <tr>
                        <td colSpan="5" className="fila-celda">
                          <strong>OBJETIVOS:</strong>
                          <br />
                          <div
                            dangerouslySetInnerHTML={{
                              __html: selectedPlan.objetivos,
                            }}
                          />
                        </td>
                      </tr>

                      {/* Desarrollo de la reunión (si existe) */}
                      {selectedPlan.desarrollo && (
                        <>
                          <tr>
                            <td colSpan="5" className="seccion-central">
                              <strong>DESARROLLO DE LA REUNIÓN</strong>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" className="fila-celda">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selectedPlan.desarrollo,
                                }}
                              />
                            </td>
                          </tr>
                        </>
                      )}

                      {/* Conclusiones (si existen) */}
                      {selectedPlan.conclusiones && (
                        <>
                          <tr>
                            <td colSpan="5" className="seccion-central">
                              <strong>CONCLUSIONES</strong>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" className="fila-celda">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: selectedPlan.conclusiones,
                                }}
                              />
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>

                    {/* ——— ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS ——— */}
                    <tbody>
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>
                            ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <th colSpan="2">ACTIVIDAD / DECISIÓN</th>
                        <th>FECHA</th>
                        <th>RESPONSABLE</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                      {(selectedPlan.compromisosPlan?.length > 0
                        ? selectedPlan.compromisosPlan
                        : Array(3).fill({})
                      ).map((comp, index) => (
                        <tr key={index}>
                          <td colSpan="2">{comp.planDecision || ""}</td>
                          <td>
                            {comp.fecha
                              ? new Date(comp.fecha).toLocaleDateString("es-ES")
                              : ""}
                          </td>
                          <td>{comp.responsable || ""}</td>
                          <td>{comp.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                    </tbody>

                    {/* ——— ASISTENTES Y APROBACIÓN DECISIONES ——— */}
                    <tbody className="block-group3">
                      <tr>
                        <td colSpan="5" className="seccion-central">
                          <strong>ASISTENTES Y APROBACIÓN DECISIONES</strong>
                        </td>
                      </tr>
                      <tr>
                        <th>NOMBRE</th>
                        <th>DEPENDENCIA / EMPRESA</th>
                        <th>APRUEBA (SI/NO)</th>
                        <th>OBSERVACIÓN</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                      {(selectedPlan.asistentesPlan?.length > 0
                        ? selectedPlan.asistentesPlan
                        : Array(3).fill({})
                      ).map((asis, index) => (
                        <tr key={index}>
                          <td>{asis.nombre || ""}</td>
                          <td>{asis.dependenciaEmpresa || ""}</td>
                          <td>{asis.aprueba || ""}</td>
                          <td>{asis.observacion || ""}</td>
                          <td>{asis.firmaParticipacion || ""}</td>
                        </tr>
                      ))}
                      <tr className="acta-legal-text">
                        <td colSpan="5">
                          De acuerdo con la Ley 1581 de 2012, Protección de
                          Datos Personales, el Servicio Nacional de Aprendizaje
                          SENA se compromete a garantizar la seguridad y
                          protección de los datos personales que se encuentran
                          almacenados en este documento, y les dará el
                          tratamiento correspondiente en cumplimiento de lo
                          establecido legalmente.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="containerFooterActa">GOR-F-084 V02</div>
                </div>
              )}

              {/* ——— SECCIÓN “REGISTRO” ——— */}
              {currentSection === "registro" && (
                <div
                  
                  className={`registro-imprimible ${
                    currentSection === "registro"
                      ? "slide-in-left"
                      : "slide-out-right"
                  }`}
                >
                  <div className="logoRegistroContainer">
                    <img
                      src={logoSena}
                      alt="Logo SENA"
                      className="registro-logo"
                    />
                  </div>
                  <table
                    className="registro-full-table"
                    border="1"
                    cellPadding="4"
                    cellSpacing="0"
                  >
                    <thead>
                      <tr>
                        <th colSpan="11" className="registro-title-cell">
                          REGISTRO DE ASISTENCIA / DÍA{" "}
                          {formatFechaModal(selectedPlan.fecha).dia} DEL MES DE{" "}
                          {formatFechaModal(selectedPlan.fecha).mes} DEL AÑO{" "}
                          {formatFechaModal(selectedPlan.fecha).anio}
                        </th>
                      </tr>
                      <tr>
                        <th colSpan="11" className="registro-objetivo-cell">
                          <strong>OBJETIVO(S):</strong>&nbsp;
                          <span
                            dangerouslySetInnerHTML={{
                              __html: selectedPlan.objetivos,
                            }}
                          />
                        </th>
                      </tr>
                      <tr>
                        <th>N°</th>
                        <th>NOMBRES Y APELLIDOS</th>
                        <th>No. DOCUMENTO</th>
                        <th>PLANTA</th>
                        <th>CONTRATISTA</th>
                        <th>OTRO / ¿CUÁL?</th>
                        <th>DEPENDENCIA / EMPRESA</th>
                        <th>CORREO ELECTRÓNICO</th>
                        <th>TELÉFONO/EXT.</th>
                        <th>AUTORIZA GRABACIÓN</th>
                        <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedPlan.asistentesPlan || []).map((asis, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{asis.nombre}</td>
                          <td>{asis.numeroDocumento}</td>
                          <td>{asis.planta ? "SI" : "NO"}</td>
                          <td>{asis.contratista ? "SI" : "NO"}</td>
                          <td>{asis.otro}</td>
                          <td>{asis.dependenciaEmpresa}</td>
                          <td>{asis.correoElectronico}</td>
                          <td>{asis.telefonoExt}</td>
                          <td>{asis.autorizaGrabacion ? "SÍ" : "NO"}</td>
                          <td>{asis.firmaParticipacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="regisro-legal-text">
                    <p>
                      De acuerdo con la Ley 1581 de 2012, Protección de Datos
                      Personales, el Servicio Nacional de Aprendizaje SENA se
                      compromete a garantizar la seguridad y protección de los
                      datos personales que se encuentran almacenados en este
                      documento, y les dará el tratamiento correspondiente en
                      cumplimiento de lo establecido legalmente.
                    </p>
                  </div>
                  <div className="containerFooter">
                    <div className="registro-version">
                      <p>GOR-F-085 V02</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ——— Botón para navegar entre secciones ——— */}
              <div className="modal-navigation">
                {currentSection === "actividades" ? (
                  <button
                    className="nav-button"
                    onClick={() => setCurrentSection("registro")}
                  >
                    → Registro de Asistencia
                  </button>
                ) : (
                  <button
                    className="nav-button"
                    onClick={() => setCurrentSection("actividades")}
                  >
                    ← Actividades Complementarias
                  </button>
                )}
              </div>
            </div>

            {/* ——— Foot del modal (Cerrar / Imprimir) ——— */}
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setCurrentSection("actividades");
                }}
              >
                Cerrar
              </button>
              {currentSection === "actividades" ? (
                <button className="submit-button" onClick={generarActa}>
                  Imprimir Acta
                </button>
              ) : (
                <button className="submit-button" onClick={generarRegistroAsistencia}>
                  Imprimir Registro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanesMejoramiento;
