import { app } from "@azure/functions";
import Handlebars from "handlebars";
import { EmailClient } from "@azure/communication-email";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Obtener el directorio actual en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar configuración desde variables de entorno para mejor seguridad
const connectionString = process.env.EMAIL_CONNECTION_STRING || "endpoint=https://emaiils-adso.unitedstates.communication.azure.com/;accesskey=9FLyse3XpZpOCP8U2JNayeDXh7EVxEsJCA6OCtUxXgQaNpehlwNqJQQJ99BCACULyCps5mg0AAAAAZCS0A3Y";
const senderAddress = process.env.EMAIL_SENDER_ADDRESS || "DoNotReply@e4ef8d59-6285-469f-903a-50b33e24d56f.azurecomm.net";

// Configuración de timeouts (en milisegundos)
const EMAIL_SEND_TIMEOUT = parseInt(process.env.EMAIL_SEND_TIMEOUT || "30000"); // 30 segundos
const EMAIL_POLL_TIMEOUT = parseInt(process.env.EMAIL_POLL_TIMEOUT || "60000"); // 60 segundos

// Crear cliente con opciones de retry
const clientOptions = {
  retry: {
    maxRetries: 3,
    retryDelayInMs: 800,
    maxRetryDelayInMs: 5000
  }
};

// Inicializar cliente de email (inicialización perezosa)
let emailClient = null;

// Función para validar formato de email
function esEmailValido(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para cargar plantilla de forma segura
async function cargarPlantilla(rutaPlantilla, context) {
  try {
    return await fs.readFile(rutaPlantilla, "utf-8");
  } catch (error) {
    context.log.error(`Error al cargar la plantilla desde ${rutaPlantilla}:`, error);
    throw new Error(`Archivo de plantilla no encontrado o no se puede leer: ${error.message}`);
  }
}

// Función para enviar email con manejo de timeout
async function enviarEmailConTimeout(mensajeEmail, context) {
  // Inicializar cliente si aún no se ha hecho
  if (!emailClient) {
    emailClient = new EmailClient(connectionString, clientOptions);
  }

  // Crear una promesa con timeout para la operación de envío
  const promesaEnvioEmail = new Promise(async (resolve, reject) => {
    try {
      const poller = await emailClient.beginSend(mensajeEmail);
      context.log("Email enviado, esperando resultado...");
      
      // Crear una promesa con timeout para el polling
      const promesaPolling = new Promise(async (pollResolve, pollReject) => {
        try {
          const resultado = await poller.pollUntilDone();
          pollResolve(resultado);
        } catch (error) {
          pollReject(error);
        }
      });
      
      // Agregar timeout al polling
      const promesaTimeoutPolling = new Promise((_, timeoutReject) => {
        setTimeout(() => {
          timeoutReject(new Error("La operación de polling ha excedido el tiempo límite"));
        }, EMAIL_POLL_TIMEOUT);
      });
      
      // Esperar por el resultado del polling o el timeout
      const resultado = await Promise.race([promesaPolling, promesaTimeoutPolling]);
      resolve(resultado);
    } catch (error) {
      reject(error);
    }
  });
  
  // Agregar timeout a la operación inicial de envío
  const promesaTimeoutEnvio = new Promise((_, timeoutReject) => {
    setTimeout(() => {
      timeoutReject(new Error("La operación de envío ha excedido el tiempo límite"));
    }, EMAIL_SEND_TIMEOUT);
  });
  
  // Esperar por el resultado del envío o el timeout
  return Promise.race([promesaEnvioEmail, promesaTimeoutEnvio]);
}

// Función HTTP Trigger
export default app.http("httpTrigger1", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      // Analizar y validar el cuerpo de la solicitud
      let datosRequest;
      try {
        datosRequest = await request.json();
      } catch (error) {
        context.log.error("Error al analizar el cuerpo de la solicitud:", error);
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "JSON inválido en el cuerpo de la solicitud" })
        };
      }

      // Validar campos requeridos
      const { subject, template, dataTemplate, to } = datosRequest;
      if (!subject || !template || !dataTemplate || !to) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Faltan campos requeridos: subject, template, dataTemplate, o to" })
        };
      }

      // Validar formato de email
      if (!esEmailValido(to)) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Formato de dirección de correo electrónico inválido" })
        };
      }

      // Validar ruta de la plantilla (prevenir path traversal)
      const plantillaNormalizada = path.normalize(template);
      if (plantillaNormalizada.includes('..')) {
        return {
          status: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Ruta de plantilla inválida" })
        };
      }

      // Resolver ruta de la plantilla
      const rutaPlantilla = path.join(__dirname, plantillaNormalizada);
      
      // Cargar y compilar la plantilla
      try {
        const fuente = await cargarPlantilla(rutaPlantilla, context);
        const plantillaCompilada = Handlebars.compile(fuente);
        const html = plantillaCompilada(dataTemplate);

        // Construir mensaje de email
        const mensajeEmail = {
          senderAddress: senderAddress,
          content: {
            subject: subject,
            html: html,
          },
          recipients: {
            to: [{ address: to }],
          },
        };

        // Registrar inicio de operación
        context.log("Iniciando operación de envío de email...");
        
        // Enviar email con manejo de timeout
        const resultado = await enviarEmailConTimeout(mensajeEmail, context);
        
        return {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje: "Email enviado exitosamente", id: resultado.id })
        };
      } catch (error) {
        throw error; // Pasar al bloque catch externo para manejo de errores consistente
      }
    } catch (error) {
      context.log.error("Error al enviar email:", error);
      
      // Determinar tipo de error para respuesta específica
      if (error.message && (error.message.includes("tiempo límite") || error.message.includes("timed out"))) {
        return {
          status: 504, // Gateway Timeout
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "La operación de email excedió el tiempo límite", detalles: error.message })
        };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
          status: 503, // Service Unavailable
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "No se pudo conectar al servicio de email", detalles: error.message })
        };
      } else if (error.statusCode === 401 || error.statusCode === 403) {
        return {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Falló la autenticación con el servicio de email", detalles: error.message })
        };
      } else if (error.message && error.message.includes("Archivo de plantilla no encontrado")) {
        return {
          status: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: error.message })
        };
      }
      
      return {
        status: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Error al enviar email", detalles: error.message })
      };
    }
  },
});