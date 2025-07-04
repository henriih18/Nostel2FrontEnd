import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { RegistroAprendiz } from "./componentes/registro/registroAprendiz/RegistroAprendiz.jsx";
import ForgotPassword from "./componentes/PasswordReset/ForgotPassword.jsx";
import ResetPassword from "./componentes/PasswordReset/ResetPassword.jsx";
import { Login } from "./componentes/Pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RegistroInstructor } from "./componentes/registro/registroInstructor/RegistroInstructor.jsx"

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/registroAprendiz" element={<RegistroAprendiz />} />
      <Route path="/registroInstructor" element={<RegistroInstructor />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/password-reset/reset" element={<ResetPassword />} />
      <Route
        path="/login"
        element={
          <Login
            onLogin={(token) => {
              sessionStorage.setItem("token", token);
              window.location.replace("/"); // redirige al root tras login
            }}
          />
        }
      />

      {/* Todo lo demás lo maneja App */}
      <Route path="/*" element={<App />} />
    </Routes>

    {/* <ToastContainer
      position="top-center"
      autoClose={3000}
      theme="colored"
      closeButton={false}
      hideProgressBar={true}
      toastClassName={(context) =>
        context?.type === "success"
          ? "toast-success"
          : context?.type === "error"
          ? "toast-error"
          : "toast-default"
      }
    /> */}

    <ToastContainer
      position="top-center"
      autoClose={3000}
      theme="colored"
      closeButton={false}
      hideProgressBar={true}
      toastClassName={(context) => {
        console.log("TOAST TYPE:", context?.type);
        switch (context?.type) {
          case "success":
            return "toast-success";
          case "error":
            return "toast-error";
          case "info":
            return "toast-info";
          case "warning":
            return "toast-warn";
          default:
            return "toast-default";
        }
      }}
    />
  </BrowserRouter>
);
