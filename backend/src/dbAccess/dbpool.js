import mysql from 'mysql2/promise';
import dbconfig from './dbconfig.js';

const execQuery = async (stmt, params) => {
  const pool = await mysql.createPool({
    host: dbconfig.HOST,
    user: dbconfig.USER,
    password: dbconfig.PASSWORD,
    database: dbconfig.DB,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const [rows, fields] = await pool.query(stmt, params);
    return [rows, fields];
  } catch (err) {
    throw new Error(err);
  }
};

const pool = mysql.createPool({
  host: dbconfig.HOST,
  user: dbconfig.USER,
  password: dbconfig.PASSWORD,
  database: dbconfig.DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export { execQuery, pool };
