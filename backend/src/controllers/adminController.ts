import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import {isInjection} from "../middleware/middleware";
const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password, adminSecret } = req.body;


    const isAttacked:boolean = isInjection([email, nickname, password, adminSecret])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking' });
    }

    if (email === undefined || nickname === undefined || password === undefined || adminSecret === undefined) {
        return res.status(400).json({ message: 'Email, nickname and password and admin secret are required' });
    }

    if( adminSecret !== process.env.SECRET ) {
        return res.status(400).json({ message: 'not authorized to make admin account' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }


    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const connection = await pool.getConnection();

        const [results] = await connection.query(`
            SELECT
                COUNT(*) AS count
            FROM
                admin
            WHERE
                email = ?`,
            [email]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        await connection.query(`
            INSERT INTO
                admin (email, nickname, password)
            VALUES
                (?, ?, ?)`,
            [email, nickname, hashedPassword]
        );

        res.status(201).json({ message: 'Admin registered successfully' });

        connection.release();
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;