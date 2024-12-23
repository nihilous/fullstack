import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './ormconfig';
import adminRouter from './controllers/adminController';
import userRouter from './controllers/userController';
import loginRouter from './controllers/loginController';
import vaccineRouter from './controllers/vaccineController';
import historyRouter from './controllers/historyController';
import noticeRouter from './controllers/noticeController';
import boardRouter from './controllers/boardController';
import runMigrations from './runMigration';
import { checkDatabaseConnection } from './db';
import { seedVaccines } from './seeds/VaccineSeed';
import { seedCountries } from './seeds/CountrySeed';
import './scheduler/scheduler';

dotenv.config();

const app = express();
const port = process.env.BACKEND_PORT
  ? parseInt(process.env.BACKEND_PORT, 10)
  : 3000;

app.use(cors());
app.use(express.json());

app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/login', loginRouter);
app.use('/vaccine', vaccineRouter);
app.use('/history', historyRouter);
app.use('/notice', noticeRouter);
app.use('/board', boardRouter);

app.get('/', (req, res) => {
  res.send('API is working');
});

async function startServer() {
  try {
    await AppDataSource.initialize();

    await checkDatabaseConnection();

    await runMigrations();

    await seedVaccines();
    await seedCountries();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
