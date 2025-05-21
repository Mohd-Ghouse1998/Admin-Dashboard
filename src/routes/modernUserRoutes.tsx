import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import Modern User Pages
import UsersListPageModern from '@/modules/users/pages/modern/UsersListPage';
import UserDetailPageModern from '@/modules/users/pages/modern/UserDetailPage';
import UserCreatePageModern from '@/modules/users/pages/modern/UserCreatePage';
import UserEditPageModern from '@/modules/users/pages/modern/UserEditPage';

/**
 * Modern User Routes Configuration
 * These routes offer the modernized UI versions of the user management section
 */
const ModernUserRoutes = () => {
  return (
    <Routes>
      <Route index element={<UsersListPageModern />} />
      <Route path="create" element={<UserCreatePageModern />} />
      <Route path=":id" element={<UserDetailPageModern />} />
      <Route path="edit/:id" element={<UserEditPageModern />} />
    </Routes>
  );
};

export default ModernUserRoutes;
