const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la conexión pool
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'DB_interaccion',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    waitForConnections: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true,
    multipleStatements: false // Por seguridad
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL - DB_interaccion');
        
        // Verificar que las tablas existan
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('Favoritos', 'VerLuego', 'ProgresoVisualizacion')",
            [process.env.DB_NAME]
        );
        
        console.log(`📊 Tablas encontradas: ${tables.map(t => t.TABLE_NAME).join(', ')}`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        return false;
    }
};

// Función helper para ejecutar queries
const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Error ejecutando query:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

// Función para transacciones
const executeTransaction = async (callback) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Función helper para ejecutar queries con paginación
const executePaginatedQuery = async (baseQuery, params = [], limit = 20, offset = 0, orderBy = null) => {
    let connection;
    try {
        // Validar y sanitizar límites
        const safeLimit = Math.min(Math.max(1, parseInt(limit) || 20), 100);
        const safeOffset = Math.max(0, parseInt(offset) || 0);
        
        // Construir query completa
        let finalQuery = baseQuery;
        if (orderBy) {
            finalQuery += ` ORDER BY ${orderBy}`;
        }
        finalQuery += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;
        
        connection = await pool.getConnection();
        const [results] = await connection.execute(finalQuery, params);
        return results;
    } catch (error) {
        console.error('Error ejecutando query paginada:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    pool,
    testConnection,
    executeQuery,
    executeTransaction,
    executePaginatedQuery
};