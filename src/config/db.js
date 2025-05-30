
const dotenv = require('dotenv');
dotenv.config();

const mysql = require('mysql2/promise');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

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

async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error al ejecutar la consulta:', error);
    throw error;
  }
}

module.exports = {
  getConnection,
  query,
  pool
};