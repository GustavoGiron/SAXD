import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../services/authService';

const ConfirmEmailPage: React.FC = () => {
  const { token } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      confirmEmail();
    }
  }, [token]);

  const confirmEmail = async () => {
    try {
      await authService.confirmEmail(token!);
      setStatus('success');
      setMessage('¡Tu correo ha sido confirmado exitosamente!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.mensaje || 'Error al confirmar el correo');
    }
  };

  return (
    <div className="auth-page">
      <div className="confirmation-container">
        {status === 'loading' && (
          <>
            <div className="spinner"></div>
            <p>Confirmando tu correo...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="success-icon">✅</div>
            <h2>{message}</h2>
            <Link to="/login" className="btn btn-primary">
              Ir a Iniciar Sesión
            </Link>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="error-icon">❌</div>
            <h2>Error de Confirmación</h2>
            <p>{message}</p>
            <Link to="/register" className="btn btn-secondary">
              Volver a Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;