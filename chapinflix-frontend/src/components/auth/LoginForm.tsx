import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const [credentials, setCredentials] = useState({
    usuario: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="form-title">🎬 Iniciar Sesión</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Usuario o Correo</label>
          <input
            type="text"
            className="form-input"
            value={credentials.usuario}
            onChange={(e) => setCredentials({...credentials, usuario: e.target.value})}
            placeholder="Ingresa tu usuario o correo"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-input"
            value={credentials.contraseña}
            onChange={(e) => setCredentials({...credentials, contraseña: e.target.value})}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;