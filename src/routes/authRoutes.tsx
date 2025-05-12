
import React from "react";
import { Route } from "react-router-dom";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RegisterPage from "@/modules/auth/pages/register";
import ForgotPasswordPage from "@/modules/auth/pages/forgot-password";

export const authRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  </>
);
