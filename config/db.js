
const mysql = require('mysql2/promise');
require('dotenv').config();

const isTiDB = process.env.DB_HOST?.includes('tidbcloud.com');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || (isTiDB ? 4000 : 3306)),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'krishimap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: isTiDB || process.env.DB_SSL === 'true'
    ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
    : undefined
});

module.exports = pool;
