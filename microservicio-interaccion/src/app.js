// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const { favoritosRoutes, verLuegoRoutes } = require('./routes/favoritosRoutes');

// Crear aplicación Express
const app = express();

// Puerto y host
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || 'localhost';

// Configuración de CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
};

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || 100),
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors(corsOptions)); // CORS
app.use(compression()); // Compresión gzip
app.use(express.json({ limit: '10mb' })); // Parser JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser URL
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging
app.use('/api', limiter); // Rate limiting en rutas API

// Middleware para agregar información del servicio a las respuestas
app.use((req, res, next) => {
    res.setHeader('X-Service-Name', process.env.SERVICE_NAME || 'ms-interaccion');
    res.setHeader('X-Service-Version', process.env.SERVICE_VERSION || '1.0.0');
    next();
});

// Ruta de health check
app.get('/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        const healthStatus = {
            status: dbConnected ? 'healthy' : 'unhealthy',
            service: process.env.SERVICE_NAME || 'ms-interaccion',
            version: process.env.SERVICE_VERSION || '1.0.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbConnected ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development'
        };
        
        res.status(dbConnected ? 200 : 503).json(healthStatus);
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: error.message
        });
    }
});

// Ruta de información del servicio
app.get('/info', (req, res) => {
    res.json({
        service: process.env.SERVICE_NAME || 'ms-interaccion',
        version: process.env.SERVICE_VERSION || '1.0.0',
        description: 'Microservicio de Interacción - Gestión de Favoritos, Ver Luego y Progreso',
        endpoints: {
            favoritos: {
                GET: '/api/v1/perfil/:id_perfil/favoritos',
                POST: '/api/v1/perfil/:id_perfil/favoritos',
                DELETE: '/api/v1/perfil/:id_perfil/favoritos/:id_contenido',
                VERIFY: '/api/v1/perfil/:id_perfil/favoritos/:id_contenido/verificar',
                BATCH: '/api/v1/perfil/:id_perfil/favoritos/batch'
            },
            verLuego: {
                GET: '/api/v1/perfil/:id_perfil/verluego',
                POST: '/api/v1/perfil/:id_perfil/verluego',
                DELETE: '/api/v1/perfil/:id_perfil/verluego/:id_contenido',
                VERIFY: '/api/v1/perfil/:id_perfil/verluego/:id_contenido/verificar',
                MOVE: '/api/v1/perfil/:id_perfil/verluego/:id_contenido/mover-favoritos'
            },
            listas: {
                GET: '/api/v1/perfil/:id_perfil/listas'
            },
            health: '/health',
            info: '/info'
        }
    });
});

// Montar rutas principales
app.use('/api/v1', favoritosRoutes);
app.use('/api/v1', verLuegoRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        hint: 'Consulte /info para ver las rutas disponibles'
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Error interno del servidor';
    
    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err
        })
    });
});

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        console.log('Verificando conexión a la base de datos...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn('Advertencia: No se pudo conectar a la base de datos');
            console.log('El servicio iniciará pero algunas funcionalidades no estarán disponibles');
        }
        
        // Iniciar servidor
        app.listen(PORT, HOST, () => {
            console.log('═══════════════════════════════════════════════════');
            console.log(`Microservicio de Interacción - Chapinflix`);
            console.log(`Servidor corriendo en: http://${HOST}:${PORT}`);
            console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Health check: http://${HOST}:${PORT}/health`);
            console.log(`Info: http://${HOST}:${PORT}/info`);
            console.log('═══════════════════════════════════════════════════');
        });
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales para shutdown graceful
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT recibido, cerrando servidor...');
    process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;