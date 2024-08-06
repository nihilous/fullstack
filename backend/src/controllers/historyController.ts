import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { user_detail_id, vaccine_id, history_date } = req.body;

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query('SELECT COUNT(*) AS count FROM history WHERE user_detail_id = ? AND vaccine_id = ?', [user_detail_id, vaccine_id]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'That vaccine is already dosed' });
        }

        await connection.query(
            'INSERT INTO history (user_detail_id, vaccine_id, history_date) VALUES (?, ?, ?)',
            [user_detail_id, vaccine_id, history_date]
        );

        res.status(201).json({ message: 'Vaccination History Saved Successfully' });

        connection.release();
    } catch (error) {
        console.error('Error Saving Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const user_detail_id = req.params.id;

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            'SELECT vaccine.vaccine_name, vaccine.vaccine_round, history.history_date FROM history JOIN vaccine on history.vaccine_id = vaccine.id WHERE user_detail_id = ?',
            [user_detail_id]
        );

        res.status(200).json(rows);

        connection.release();
    } catch (error) {
        console.error('Error Saving Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;