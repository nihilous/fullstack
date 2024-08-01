import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './controllers/userController';
import runMigrations from './runMigration';
import { checkDatabaseConnection } from './db'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);

app.get('/', (req, res) => {
    res.send('setup done');
});

async function startServer() {
    try {
        await checkDatabaseConnection();

        await runMigrations();

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();