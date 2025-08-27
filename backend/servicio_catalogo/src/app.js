const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('express-async-errors');

const routesContent = require('./routes/content.routes');
// const errorMiddleware = require('./middlewares/error.middleware');
// const loggingMiddleware = require('./middlewares/logging.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Seguridad
app.use(helmet());
app.use(cors());


// Middlewares
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(loggingMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'catalog-service',
    timestamp: new Date().toISOString()
  });
});
// Rutas
app.use('/api/content', routesContent.router);

// Documentación API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Manejo de errores
//app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Resource not found'
  });
});

module.exports = app;