const mysql = require('mysql2/promise');
require('dotenv').config();

const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

conexion.getConnection()
  .then(conn => {
      console.log('✅ Base de datos conectada correctamente');
      conn.release();
  })
  .catch(err => console.error('❌ Error al conectar la base de datos:', err.message));

module.exports = conexion;
