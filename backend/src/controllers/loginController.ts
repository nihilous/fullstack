import { Router, Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {CustomRequest, injectionChecker, tokenExtractor, addUpdateHostileList} from "../middleware/middleware";
import {FieldPacket, ResultSetHeader, RowDataPacket} from "mysql2";

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
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const checked_email = injectionChecker(email);

    if(email !== checked_email){
        await addUpdateHostileList(clientIp as string, [`email":"`+checked_email]);
    }

    if ((checked_email === undefined || checked_email === "")|| (password === undefined || password === "")) {
        return res.status(400).json({ message: 'Email and password are required', loginRes: 1 });
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
            `, [checked_email]);

            const users = results as User[];

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 2 });
            }

            const user = users[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 2 });
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
            const expiration = new Date(Date.now() + 60 * 60 * 1000);
            const formattedExpiration = expiration.toISOString().slice(0, 19).replace('T', ' ');

            const [TokenUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                UPDATE 
                    user
                SET
                    jwt_token = ?,
                    jwt_expires_at = ?,
                    ip_address = ?
                WHERE
                    id = ?
            `, [token, formattedExpiration, clientIp, user.id]);

            const affectedUserRows = TokenUpdateResult.affectedRows;

            if(affectedUserRows === 1){
                res.status(200).json({ message: 'Login successful', token });
            }else{
                return res.status(400).json({ message: 'Token save fail', loginRes: 3 });
            }

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
            `, [checked_email]);

            const users = results as User[];

            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 2 });
            }

            const user = users[0];

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: 'Invalid email or password', loginRes: 2 });
            }

            const tokenPayload = { userId: user.id, admin: isAdmin };
            const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
            const expiration = new Date(Date.now() + 60 * 60 * 1000);
            const formattedExpiration = expiration.toISOString().slice(0, 19).replace('T', ' ');

            const [TokenUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                UPDATE 
                    admin
                SET
                    jwt_token = ?,
                    jwt_expires_at = ?,
                    ip_address = ?
                WHERE
                    id = ?
            `, [token, formattedExpiration, clientIp, user.id]);

            const affectedAdminRows = TokenUpdateResult.affectedRows;

            if(affectedAdminRows === 1){
                res.status(200).json({ message: 'Login successful', token });
            }else{
                return res.status(400).json({ message: 'Token save fail', loginRes: 3 });
            }
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

router.get('/jwt/:id',tokenExtractor, async (req: CustomRequest, res: Response) => {
    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;
    const admin:boolean = req.token?.admin;

    if(user_id !== token_id) {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, [`id":"` + user_id.toString(), `token":"`+token_id.toString(), `admin":"`+admin])

        return res.status(403).json({ message: 'No Authority', jwtRenewRes: 1});
    }

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query<(RowDataPacket & { user_detail_ids: string })[]>(`
            SELECT
                *
            FROM
                user_detail 
            WHERE
                user_id = ?
        `, [user_id]);

        const childrenIds = results.map(row => row.id);

        const tokenPayload = {
            userId: user_id,
            admin: admin,
            userDetailIds: childrenIds,
            record: results
        };
        const newToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
        const expiration = new Date(Date.now() + 60 * 60 * 1000);
        const formattedExpiration = expiration.toISOString().slice(0, 19).replace('T', ' ');

        const table = admin === true ? "admin" : "user";

        const [TokenUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                UPDATE 
                    ${table}
                SET
                    jwt_token = ?,
                    jwt_expires_at = ?
                WHERE
                    id = ?
            `, [newToken, formattedExpiration, user_id]);

        const affectedUserRows = TokenUpdateResult.affectedRows;

        if(affectedUserRows === 1){
            res.status(201).json({ message: 'JWT Expiration Refreshed', token: newToken });
        }else{
            return res.status(400).json({ message: 'Token save fail', jwtRenewRes: 2 });
        }

        connection.release();
    } catch (error) {
        console.error('Error Refreshing JWT Expiration /login/jwt/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

export default router;