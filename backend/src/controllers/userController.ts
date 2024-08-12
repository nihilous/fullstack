import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import {CustomRequest, tokenExtractor} from '../middleware/middleware';
import { RowDataPacket } from 'mysql2';

const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const secretKey = process.env.SECRET;
if (!secretKey) {
    throw new Error('SECRET environment variable is not set');
}

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

        connection.release();
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { name, description, gender, birthdate, nationality } = req.body;


    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority' });
    }

    if (name === undefined || description === undefined || gender === undefined || birthdate === undefined || nationality === undefined) {
        return res.status(400).json({ message: 'name, description, gender, birthdate, nationality are required' });
    }

    try {
        const connection = await pool.getConnection();

        await connection.query(
            'INSERT INTO user_detail (user_id, name, description, gender, birthdate, nationality) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, name, description, gender, birthdate, nationality]
        );

        const [results] = await connection.query<(RowDataPacket & { user_detail_ids: string })[]>(`
            SELECT
                GROUP_CONCAT(id) AS user_detail_ids 
            FROM
                user_detail 
            WHERE
                user_id = ?
        `, [user_id]);

        const userDetailIds = results[0]?.user_detail_ids ? results[0].user_detail_ids.split(',').map(Number) : [];

        const tokenPayload = {
            userId: user_id,
            admin: req.token?.admin || false,
            userDetailIds
        };
        const newToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        res.status(201).json({ message: 'User detail successfully added', token: newToken });

        connection.release();
    } catch (error) {
        console.error('Error Adding User detail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        return res.status(403).json({ message: 'No Authority' });
    }

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

router.get('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority' });
    }

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