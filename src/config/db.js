// db.js - Versión mejorada usando variables de entorno

// Si usas dotenv
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const mysql = require('mysql2/promise');

// Configuración de la conexión usando variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Opciones adicionales recomendadas
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Función para obtener una conexión del pool
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
}

// Exportar las funciones
module.exports = {
  getConnection,
  query,
  pool
};