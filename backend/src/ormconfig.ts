import { DataSource } from 'typeorm';
import { Vaccine } from './entities/Vaccine';

export const AppDataSource = new DataSource({
    type: 'mysql',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [Vaccine],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [],
});