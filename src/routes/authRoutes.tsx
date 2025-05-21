
import React from "react";
import { Route } from "react-router-dom";
import ModernLoginPage from "@/modules/auth/pages/ModernLoginPage";
import RegisterPage from "@/modules/auth/pages/register";
import ForgotPasswordPage from "@/modules/auth/pages/forgot-password";

export const authRoutes = (
  <>
    <Route path="/login" element={<ModernLoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </>
);
