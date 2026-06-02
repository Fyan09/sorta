import mysql from 'mysql2/promise';

// Buat connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '10.10.1.112',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'Telur@12344321',
  database: process.env.DB_NAME || 'klasifikasi_telur',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function untuk execute query
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export default pool;