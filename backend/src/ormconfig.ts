import { DataSource } from 'typeorm';
import { Vaccine } from './entities/Vaccine';
import { Country } from './entities/Country';

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [Vaccine, Country],
  migrations: ['src/migration/**/*.ts'],
  subscribers: [],
});
