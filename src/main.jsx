import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {RegistroAprendiz} from "./componentes/registro/registroAprendiz/RegistroAprendiz.jsx";
import ForgotPassword from "./componentes/PasswordReset/ForgotPassword.jsx";
import ResetPassword from "./componentes/PasswordReset/ResetPassword.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
      <Routes>
          <Route path="/registroAprendiz" element={<RegistroAprendiz />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<App />} />
      </Routes>
  </BrowserRouter>
);
