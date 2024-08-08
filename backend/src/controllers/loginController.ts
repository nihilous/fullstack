import { Router, Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const secretKey = process.env.SECRET;
if (!secretKey) {
    throw new Error('SECRET environment variable is not set');
}

interface User {
    id: number;
    password: string;
}

const handleLogin = async (req: Request, res: Response, table: 'user' | 'admin', isAdmin: boolean = false) => {
    const { email, password } = req.body;

    if (email === undefined || password === undefined) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`SELECT id, password FROM ${table} WHERE email = ?`, [email]);

        const users = results as User[];
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const tokenPayload = { userId: user.id, admin: isAdmin };
        const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });

        connection.release();
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

router.post('/', (req: Request, res: Response) => {
    handleLogin(req, res, 'user');
});

router.post('/admin', (req: Request, res: Response) => {
    handleLogin(req, res, 'admin', true);
});

export default router;