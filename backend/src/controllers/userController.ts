import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';

const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password } = req.body;

    if (!email || !nickname || !password) {
        return res.status(400).json({ message: 'Email, nickname, and password are required' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const connection = await pool.getConnection();
        try {
            const [results] = await connection.query('SELECT COUNT(*) AS count FROM user WHERE email = ?', [email]);

            const result = results as { count: number }[];

            if (result[0].count > 0) {
                return res.status(400).json({ message: 'Email is already in use' });
            }
            await connection.query(
                'INSERT INTO user (email, nickname, password) VALUES (?, ?, ?)',
                [email, nickname, hashedPassword]
            );

            res.status(201).json({ message: 'User registered successfully' });
        } finally {
            connection.release(); // Release the connection back to the pool
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;