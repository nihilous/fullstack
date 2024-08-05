import 'reflect-metadata';
import { AppDataSource } from './typeorm.config';

async function runMigrations() {
    try {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();
        console.log('Migrations ran successfully');
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

export default runMigrations;