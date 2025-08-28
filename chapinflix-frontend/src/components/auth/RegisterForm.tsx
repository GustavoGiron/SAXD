import React, { useState } from 'react';
import authService from '../../services/authService';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    contraseña: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    fecha_nacimiento: '',
    sexo: '',
    imagen_perfil: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authService.register(formData);
      setMessage({ 
        type: 'success', 
        text: '¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.' 
      });
      // Limpiar formulario
      setFormData({
        nombre_usuario: '',
        correo: '',
        contraseña: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        fecha_nacimiento: '',
        sexo: '',
        imagen_perfil: ''
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.mensaje || 'Error al registrar' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-form">
      <h2 className="form-title">🎬 Crear Cuenta</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre de Usuario *</label>
            <input
              type="text"
              name="nombre_usuario"
              className="form-input"
              value={formData.nombre_usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico *</label>
            <input
              type="email"
              name="correo"
              className="form-input"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña *</label>
          <input
            type="password"
            name="contraseña"
            className="form-input"
            value={formData.contraseña}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombres *</label>
            <input
              type="text"
              name="nombres"
              className="form-input"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Apellidos *</label>
            <input
              type="text"
              name="apellidos"
              className="form-input"
              value={formData.apellidos}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              className="form-input"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              className="form-input"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Sexo</label>
          <select
            name="sexo"
            className="form-input"
            value={formData.sexo}
            onChange={handleChange}
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">URL de Imagen de Perfil (Opcional)</label>
          <input
            type="url"
            name="imagen_perfil"
            className="form-input"
            value={formData.imagen_perfil}
            onChange={handleChange}
            placeholder="https://ejemplo.com/mi-imagen.jpg"
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Registrando...' : 'Crear Cuenta'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;