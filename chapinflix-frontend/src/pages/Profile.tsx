import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="container">
      <div className="profile-container">
        <div className="profile-header">
          <div className="user-avatar">
            {user.imagen_perfil ? (
              <img src={user.imagen_perfil} alt="Avatar" />
            ) : (
              <span className="avatar-placeholder">👤</span>
            )}
          </div>
          <div className="user-info">
            <h1>{user.nombres} {user.apellidos}</h1>
            <p className="username">@{user.nombre_usuario}</p>
            <span className={`user-badge ${user.tipo_usuario}`}>
              {user.tipo_usuario === 'premium' ? '⭐ Usuario Premium' : '🆓 Usuario Gratuito'}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <h2>Información Personal</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">📧 Correo electrónico:</span>
              <span className="detail-value">{user.correo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">📱 Teléfono:</span>
              <span className="detail-value">{user.telefono || 'No especificado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🎂 Fecha de nacimiento:</span>
              <span className="detail-value">
                {user.fecha_nacimiento ? 
                  new Date(user.fecha_nacimiento).toLocaleDateString() : 
                  'No especificada'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">⚧ Sexo:</span>
              <span className="detail-value">
                {user.sexo === 'M' ? 'Masculino' : 
                 user.sexo === 'F' ? 'Femenino' : 
                 user.sexo === 'O' ? 'Otro' : 'No especificado'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary">Editar Perfil</button>
          {user.tipo_usuario === 'gratuito' && (
            <button className="btn btn-gold">⭐ Actualizar a Premium</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;