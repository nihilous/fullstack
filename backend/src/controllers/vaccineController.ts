import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            'SELECT * FROM vaccine'
        );

        res.status(200).json(rows);

        res.status(201).json({ message: 'User interaction recorded successfully' });

        connection.release();
    } catch (error) {
        console.error('Error recording user interaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;