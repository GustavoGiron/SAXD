import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🎬 CHAPINFLIX
        </Link>
        
        {isAuthenticated && (
          <>
            <nav className="nav-menu">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Inicio
              </Link>
              <Link 
                to="/my-lists" 
                className={`nav-link ${isActive('/my-lists') ? 'active' : ''}`}
              >
                Mis Listas
              </Link>
              <Link 
                to="/profile" 
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Mi Perfil
              </Link>
            </nav>
            
            <div className="header-user">
              <span className="user-name">👤 {user?.nombre_usuario}</span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;