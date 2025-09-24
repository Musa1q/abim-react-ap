import mysql from 'mysql2/promise';

// Veritabanı bağlantı ayarları
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP'te genellikle boş
  database: 'abim_react_db',
  port: 3306,
  charset: 'utf8mb4'
};

// Bağlantı havuzu oluştur
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// Bağlantı testi
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Veritabanı bağlantısı başarılı!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error.message);
    return false;
  }
};

export default pool;
