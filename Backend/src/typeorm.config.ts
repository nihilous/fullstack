import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export const AppDataSource = new DataSource({
    type: 'mysql',
    url: databaseUrl,
    entities: [],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
});