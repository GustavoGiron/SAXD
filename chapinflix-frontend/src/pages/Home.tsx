import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="welcome-hero">
        <h1>¡Bienvenido a Chapinflix!</h1>
        <h2>Hola, {user?.nombres} 👋</h2>
        <p>Tu plataforma de streaming favorita</p>
      </div>

      <div className="quick-actions">
        <Link to="/my-lists" className="action-card">
          <span className="action-icon">❤️</span>
          <h3>Mis Favoritos</h3>
          <p>Ver tu contenido favorito</p>
        </Link>
        
        <Link to="/my-lists" className="action-card">
          <span className="action-icon">⏰</span>
          <h3>Ver Luego</h3>
          <p>Contenido guardado para después</p>
        </Link>
        
        <Link to="/profile" className="action-card">
          <span className="action-icon">👤</span>
          <h3>Mi Perfil</h3>
          <p>Gestiona tu información</p>
        </Link>
      </div>

      <div className="info-section">
        <h2>🚀 Funcionalidades Implementadas</h2>
        <div className="features-grid">
          <div className="feature-item">
            <span>✅</span> Sistema de autenticación con JWT
          </div>
          <div className="feature-item">
            <span>✅</span> Registro con confirmación por correo
          </div>
          <div className="feature-item">
            <span>✅</span> Gestión de favoritos
          </div>
          <div className="feature-item">
            <span>✅</span> Lista "Ver Luego"
          </div>
          <div className="feature-item">
            <span>✅</span> Mover contenido entre listas
          </div>
          <div className="feature-item">
            <span>✅</span> Perfil de usuario personalizado
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;