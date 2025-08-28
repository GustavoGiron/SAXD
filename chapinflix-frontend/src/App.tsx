import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import ProfilePage from './pages/Profile';
import MyListsPage from './pages/MyLists';
import HomePage from './pages/Home';
import ConfirmEmailPage from './pages/ConfirmEmail';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/global.css';

import axios from 'axios';
console.log('Axios cargado:', axios);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/confirmar/:token" element={<ConfirmEmailPage />} />
          
          {/* Rutas protegidas */}
          <Route element={<Layout />}>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/my-lists" element={
              <ProtectedRoute>
                <MyListsPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;