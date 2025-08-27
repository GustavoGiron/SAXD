const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 11,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool;

async function connectDatabase() {
  try {
    pool = mysql.createPool(config);
    
    // Verificar conexión
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('Connected to MySQL Server');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase first.');
  }
  return pool;
}

module.exports = {
  connectDatabase,
  getPool,
  mysql
};