const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chapinflix Catalog Service API',
      version: '1.0.0',
      description: 'Microservicio para gestión del catálogo de contenido de Chapinflix',
      contact: {
        name: 'Chapinflix Development Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      }
    ],
  },
  apis: ['src/routes/content.routes.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;