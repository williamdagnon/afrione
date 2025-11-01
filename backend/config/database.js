import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de la connexion à la base de données MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'futuristia',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  multipleStatements: true,
  dateStrings: true
});

// Test de connexion
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Connexion à la base de données MySQL établie');
    connection.release();
  } catch (err) {
    console.error('Erreur de connexion à la base de données MySQL:', err.message);
  }
})();

export default pool;

