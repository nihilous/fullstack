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

        const [results] = await connection.query('SELECT COUNT(*) AS count FROM user WHERE email = ? OR nickname = ?', [email, nickname]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'Email or Nickname is already in use' });
        }
        await connection.query(
            'INSERT INTO user (email, nickname, password) VALUES (?, ?, ?)',
            [email, nickname, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });

        connection.release();
    } catch (error) {
        console.error('Error registering user post /user/', error);
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

        await connection.query(`
            INSERT INTO
                user_detail (user_id, name, description, gender, birthdate, nationality)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `, [user_id, name, description, gender, birthdate, nationality]);

        const [results] = await connection.query<(RowDataPacket & { user_detail_ids: string })[]>(`
            SELECT
                *
            FROM
                user_detail 
            WHERE
                user_id = ?
        `, [user_id]);

        const tokenPayload = {
            userId: user_id,
            admin: req.token?.admin || false,
            record: results
        };
        const newToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        res.status(201).json({ message: 'User detail successfully added', token: newToken });

        connection.release();
    } catch (error) {
        console.error('Error Adding User post /user/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        return res.status(403).json({ message: 'No Authority' });
    }

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT
                user.nickname,
                user_detail.name,
                user_detail.description,
                user_detail.gender,
                user_detail.birthdate,
                user_detail.nationality
            FROM
                user
            JOIN
                user_detail
            ON
                user.id = user_detail.user_id
        `);

        res.status(200).json(rows);

        connection.release();
    } catch (error) {
        console.error('Error response get user/', error);
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

            const [rows] = await connection.query(`
                SELECT
                    user.nickname,
                    user_detail.id,
                    user_detail.name,
                    user_detail.description,
                    user_detail.gender,
                    user_detail.birthdate,
                    user_detail.nationality
                FROM
                    user
                JOIN
                    user_detail
                ON
                    user.id = user_detail.user_id
                WHERE
                    user.id = ?
                    `, [user_id]);
            const response = { user_detail: true, record: {...rows} };
            res.status(200).json(response);

        }else{
            const [rows] = await connection.query(`
                SELECT
                    id,
                    email,
                    nickname
                FROM
                    user
                WHERE
                    user.id = ?
                    `, [user_id]);
            const response = { user_detail: false, record: {...rows} };
            res.status(200).json(response);
        }

        connection.release();
    } catch (error) {
        console.error('Error response users get /user/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority' });
    }

    try {
        const connection = await pool.getConnection();

        await connection.query(`
            UPDATE
                user
            SET
                is_active = false
            WHERE
                user.id = ?`,
            [token_id]
        );

        res.status(200).json({ message: 'User Inactivated, can activate again if login within 6months, all related data will get deleted after 6 months' });

        connection.release();
    } catch (error) {
        console.error('Error response users delete /user/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/change/info/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const { email, nickname } = req.body;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority' });
    }

    try {
        const connection = await pool.getConnection();

        let whereClause: string[] = [];
        let whereBindings: any[] = [];

        let setStatement: string[] = [];
        let setBinding: any[] = [];

        if (email !== undefined) {
            whereClause.push('email = ?');
            whereBindings.push(email);
        }

        if (nickname !== undefined) {
            whereClause.push('nickname = ?');
            whereBindings.push(nickname);
        }

        if (whereClause.length > 0) {
            const [existingUsers] = await connection.query(`
                SELECT COUNT(*) AS count 
                FROM user 
                WHERE (${whereClause.join(' OR ')}) 
                  AND id != ?`,
                [...whereBindings, token_id]
            );

            if ((existingUsers as any)[0].count > 0) {
                return res.status(400).json({ message: 'Email or Nickname is already in use' });
            }
        }

        if (email !== undefined) {
            setStatement.push('email = ?');
            setBinding.push(email);
        }

        if (nickname !== undefined) {
            setStatement.push('nickname = ?');
            setBinding.push(nickname);
        }

        if (setStatement.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        setBinding.push(token_id);

        await connection.query(`
            UPDATE 
                user
            SET
                ${setStatement.join(', ')}
            WHERE
                id = ?
        `, setBinding);

        res.status(201).json({ message: 'User info changed'});

        connection.release();
    } catch (error) {
        console.error('Error response put /user/change/info:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

router.put('/new/password', async (req: Request, res: Response) => {


    const { email, old_password, new_password } = req.body;

    if (email === undefined || old_password === undefined || new_password === undefined) {
        return res.status(400).json({ message: 'Email, old password and new password are required' });
    }

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
                SELECT
                    password
                FROM
                    user
                WHERE
                    email = ?
            `, [email]);

        const users = results as { password: string }[];

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(old_password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

        await connection.query(`
                UPDATE 
                    user
                SET
                    password = ?
                WHERE
                    email = ? 
            `, [hashedNewPassword, email]);

        res.status(201).json({ message: 'Password changed'});

        connection.release();
    } catch (error) {
        console.error('Error response put /user/new/password', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

export default router;