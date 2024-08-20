import { Router, Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {isInjection} from "../middleware/middleware";

const router = Router();

const secretKey = process.env.SECRET;
if (!secretKey) {
    throw new Error('SECRET environment variable is not set');
}

interface User {
    id: number;
    password: string;
    user_detail_ids: string | null;
    is_active: boolean;
}

const handleLogin = async (req: Request, res: Response, table: 'user' | 'admin', isAdmin: boolean = false) => {
    const { email, password } = req.body;

    const isAttacked:boolean = isInjection([email,password])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', loginRes: 1 });
    }

    if (email === undefined || password === undefined) {
        return res.status(400).json({ message: 'Email and password are required', loginRes: 2 });
    }

    try {

        if(table === 'user'){
            const connection = await pool.getConnection();

            const [results] = await connection.query(`
                SELECT 
                    ${table}.id, 
                    ${table}.password,
                    ${table}.is_active,
                    GROUP_CONCAT(user_detail.id) AS user_detail_ids 
                FROM
                    ${table} 
                LEFT JOIN
                    user_detail ON user.id = user_detail.user_id 
                WHERE
                    email = ? 
                GROUP BY
                    user.id, user.password
            `, [email]);

            const users = results as User[];

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 3 });
            }

            const user = users[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 3 });
            }

            let setStatement: string[] = [];
            let setBinding: any[] = [];

            if(!user.is_active){
                setStatement.push('is_active = ?');
                setBinding.push(true);
            }

            setStatement.push('last_login = ?');

            const now = new Date();
            const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
            setBinding.push(formattedDate);

            setBinding.push(user.id);

            await connection.query(`
                UPDATE
                    user
                SET
                    ${setStatement.join(', ')}
                WHERE
                    id = ?
            `, setBinding);


            const tokenPayload = {
                userId: user.id,
                admin: isAdmin,
                userDetailIds: user.user_detail_ids ? user.user_detail_ids.split(',').map(Number) : []
                };

            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
            connection.release();

        }else{
            const connection = await pool.getConnection();

            const [results] = await connection.query(`
                SELECT
                    id, password
                FROM
                    ${table}
                WHERE
                    email = ?
            `, [email]);

            const users = results as User[];

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 3 });
            }

            const user = users[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 3 });
            }

            const tokenPayload = { userId: user.id, admin: isAdmin };
            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
            connection.release();
        }

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