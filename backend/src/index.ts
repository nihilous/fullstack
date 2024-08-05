import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './controllers/userController';
import runMigrations from './runMigration';
import { checkDatabaseConnection } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

app.use('/ser', userRouter);

app.get('/api/', (req, res) => {
    res.send('API is working');
});

app.get('/api/test', (req, res) => {
    res.send('Test endpoint');
});

async function startServer() {
    try {
        await checkDatabaseConnection();

        await runMigrations();

        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running at http://0.0.0.0:${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
