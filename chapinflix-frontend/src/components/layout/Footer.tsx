import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Chapinflix</h3>
            <p>Tu plataforma de streaming favorita</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="#about">Acerca de</a></li>
              <li><a href="#contact">Contacto</a></li>
              <li><a href="#terms">Términos</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Síguenos</h4>
            <div className="social-links">
              <span>📘</span>
              <span>📷</span>
              <span>🐦</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Chapinflix. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;