const sql = require('mssql');
const logger = require('../utils/logger');

const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 11,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function connectDatabase() {
  try {
    pool = await sql.connect(config);
    logger.info('Connected to SQL Server');
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
  sql
};