
import React from 'react';
import { Routes } from 'react-router-dom';
import { appRoutes } from './routes/index.tsx';

function App() {
  return (
    <Routes>
      {/* Guest routes */}
      {appRoutes.guestRoutes}
      
      {/* Protected routes */}
      {appRoutes.protectedRoutes}
    </Routes>
  );
}

export default App;
