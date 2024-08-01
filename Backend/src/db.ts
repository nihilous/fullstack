import mysql from 'mysql2/promise';
import { URL } from 'url';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const parsedUrl = new URL(databaseUrl);

const host = parsedUrl.hostname;
const port = Number(parsedUrl.port);
const user = parsedUrl.username;
const password = parsedUrl.password;
const database = parsedUrl.pathname.slice(1);

const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


const checkDatabaseConnection = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('Database connection is established successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
};

export { pool, checkDatabaseConnection };
