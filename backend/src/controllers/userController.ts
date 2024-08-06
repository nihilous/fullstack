import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';

const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password } = req.body;


    if (email === undefined || nickname === undefined || password === undefined) {
        return res.status(400).json({ message: 'Email, nickname and password are required' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }


    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const connection = await pool.getConnection();

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

        connection.release(); // Release the connection back to the pool
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:id', async (req: Request, res: Response) => {
    const { name, description, gender, birthdate, nationality } = req.body;

    const user_id = req.params.id;

    if (name === undefined || description === undefined || gender === undefined || birthdate === undefined || nationality === undefined) {
        return res.status(400).json({ message: 'name, description, gender, birthdate, nationality are required' });
    }

    try {
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO user_detail (user_id, name, description, gender, birthdate, nationality) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, name, description, gender, birthdate, nationality]
        );

        res.status(201).json({ message: 'User detail successfully' });

        connection.release();
    } catch (error) {
        console.error('Error Adding User detail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/', async (req: Request, res: Response) => {
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            'SELECT user.nickname, user_detail.name,  user_detail.description, user_detail.gender, user_detail.birthdate, user_detail.nationality FROM user JOIN user_detail ON user.id = user_detail.user_id'
        );

        res.status(200).json(rows);

        connection.release();
    } catch (error) {
        console.error('Error response users /get:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const user_id = req.params.id;

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query('SELECT COUNT(*) AS count FROM user_detail WHERE user_id = ?', [user_id]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {

            const [rows] = await connection.query(
                'SELECT user.nickname,user_detail.id, user_detail.name,  user_detail.description, user_detail.gender, user_detail.birthdate, user_detail.nationality FROM user JOIN user_detail ON user.id = user_detail.user_id WHERE user.id = ?',
                [user_id]
            );
            const response = { user_detail: true, ...rows };
            res.status(200).json(response);

        }else{
            const [rows] = await connection.query(
                'SELECT id, email , nickname FROM user WHERE user.id = ?',
                [user_id]
            );
            const response = { user_detail: false, ...rows };
            res.status(200).json(response);
        }


        connection.release();
    } catch (error) {
        console.error('Error response users /get:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;