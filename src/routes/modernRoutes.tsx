import React from 'react';
import { RouteObject } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import GuestLayout from '@/components/layout/GuestLayout';
import { EVDashboardPage } from '@/modules/evdashboard';
import ModernLoginPage from '@/modules/auth/pages/ModernLoginPage';
import RegisterPage from "@/modules/auth/pages/register";
import ForgotPasswordPage from "@/modules/auth/pages/forgot-password";

/**
 * @deprecated These routes are maintained for backward compatibility only.
 * Please use standard routes from index.tsx instead.
 */
export const modernRoutes: RouteObject[] = [
  // Guest routes (login, register, forgot password)
  {
    path: '/modern',
    element: <GuestLayout />,
    children: [
      {
        path: 'login',
        element: <ModernLoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  // Authenticated routes
  {
    path: '/modern',
    element: <AppLayout />,
    children: [
      {
        path: '',
        element: <EVDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <EVDashboardPage />,
      },
      // Add other modern routes here as they are developed
    ],
  },
];

export default modernRoutes;
