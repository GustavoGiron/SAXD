require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { connectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    logger.info('Database connected successfully');

    // Iniciar el servidor
    app.listen(PORT, () => {
      logger.info(`Catalog Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
