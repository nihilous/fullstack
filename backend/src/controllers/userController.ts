import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import {CustomRequest, isInjection, injectionChecker, patternChecker, tokenExtractor, isNotNumber, isDateFormat} from '../middleware/middleware';
import { RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2';

const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const secretKey = process.env.SECRET;
if (!secretKey) {
    throw new Error('SECRET environment variable is not set');
}

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password } = req.body;

    const checked_email = injectionChecker(email);
    const checked_nickname = injectionChecker(nickname);

    if ((checked_email === undefined || email === "") || (checked_nickname === undefined || nickname === "") || (password === undefined || password === "")) {
        return res.status(400).json({ message: 'Email, nickname and password are required', joinRes: 2 });
    }

    if (!emailRegex.test(checked_email)) {
        return res.status(400).json({ message: 'Invalid email format', joinRes: 3 });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const connection = await pool.getConnection();

        const [results] = await connection.query(`
            SELECT
                COUNT(*) AS count
            FROM
                user
            WHERE
                email = ?
            OR
                nickname = ?
        `, [checked_email, checked_nickname]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'Email or Nickname is already in use', joinRes: 4 });
        }

        await connection.query(`
            INSERT INTO
                user (email, nickname, password)
            VALUES (?, ?, ?)
        `, [checked_email, checked_nickname, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });

        connection.release();

    } catch (error) {
        console.error('Error registering user post /user/', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { name, description, gender, birthdate, nationality } = req.body;

    const checked_name = injectionChecker(name);
    const checked_description = injectionChecker(description);
    const checked_nationality = injectionChecker(nationality);

    if ((checked_name === undefined || checked_name === "") || (checked_description === undefined || checked_description === "") || (gender === undefined || gender === null) || (birthdate === undefined || birthdate === "") || (checked_nationality === undefined || checked_nationality === "")) {
        return res.status(400).json({ message: 'name, description, gender, birthdate, nationality are required', childRes: 1});
    }

    const isAttacked:boolean = isDateFormat(birthdate);
    const isAttacked2:boolean = isNotNumber([gender]);

    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', childRes: 2});
    }

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', childRes: 3});
    }

    try {
        const connection = await pool.getConnection();

        await connection.query(`
            INSERT INTO
                user_detail (user_id, name, description, gender, birthdate, nationality)
            VALUES
                (?, ?, ?, ?, ?, ?)
        `, [user_id, checked_name, checked_description, gender, birthdate, checked_nationality]);

        const [results] = await connection.query<(RowDataPacket & { user_detail_ids: string })[]>(`
            SELECT
                *
            FROM
                user_detail 
            WHERE
                user_id = ?
        `, [user_id]);

        for (let i = 0; i < results.length; i++) {
            results[i].name = patternChecker(results[i].name);
            results[i].description = patternChecker(results[i].description);
            results[i].nationality = patternChecker(results[i].nationality);
        }

        const childrenIds = results.map(row => row.id);

        const tokenPayload = {
            userId: user_id,
            admin: req.token?.admin || false,
            userDetailIds: childrenIds,
            record: results
        };
        const newToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

        const expiration = new Date(Date.now() + 60 * 60 * 1000);
        const formattedExpiration = expiration.toISOString().slice(0, 19).replace('T', ' ');

        const [TokenUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                UPDATE 
                    user
                SET
                    jwt_token = ?,
                    jwt_expires_at = ?
                WHERE
                    id = ?
            `, [newToken, formattedExpiration, user_id]);

        const affectedUserRows = TokenUpdateResult.affectedRows;

        if(affectedUserRows === 1){
            res.status(201).json({ message: 'User detail successfully added', token: newToken });
        }else{
            return res.status(400).json({ message: 'Token save fail', childRes: 4 });
        }

        connection.release();
    } catch (error) {
        console.error('Error Adding User post /user/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);

    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', UserRes: 1 });
    }

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
            SELECT
                COUNT(*) AS count
            FROM
                user_detail
            WHERE
                user_id = ?
        `, [user_id]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {

            const [rows] = await connection.query<RowDataPacket[]>(`
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

            for (let i = 0; i < rows.length; i++) {
                rows[i].nickname = patternChecker(rows[i].nickname);
                rows[i].name = patternChecker(rows[i].name);
                rows[i].description = patternChecker(rows[i].description);
                rows[i].nationality = patternChecker(rows[i].nationality);
            }

            const response = { user_detail: true, record: {...rows} };
            res.status(200).json(response);

        }else{
            const [rows] = await connection.query<RowDataPacket[]>(`
                SELECT
                    id,
                    email,
                    nickname
                FROM
                    user
                WHERE
                    user.id = ?
                    `, [user_id]);

            rows[0].email = patternChecker(rows[0].email);
            rows[0].nickname = patternChecker(rows[0].nickname);

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

    const isAttacked:boolean = isNotNumber([user_id]);

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', userDeleteRes: 1 });
    }

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', userDeleteRes: 2 });
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

router.delete('/:id/:user_detail_id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const user_detail_id:number = parseInt(req.params.user_detail_id, 10);
    const token_id:number = req?.token?.userId;
    const children = req?.token?.userDetailIds;
    let is_own_child = false;

    for (let i = 0; i < children.length; i++) {
        if(children[i] === user_detail_id){
            is_own_child = true;
        }
    }

    const isAttacked:boolean = isNotNumber([user_id, user_detail_id]);

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', childDeleteRes: 1 });
    }

    if(user_id !== token_id || !is_own_child) {
        return res.status(403).json({ message: 'No Authority', childDeleteRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        const [historyResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                history
            WHERE
                user_detail_id = ?
        `, [user_detail_id]);

        const [userDetailResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                user_detail
            WHERE
                user_detail.id = ?
        `, [user_detail_id]);

        const affectedUserDetailRows = userDetailResult.affectedRows;
        const affectedHistoryRows = historyResult.affectedRows;

        if (affectedUserDetailRows === 0) {
            res.status(409).json({ message: 'No Affected Row', childDeleteRes: 3 });
        } else {
            if(affectedHistoryRows === 0){
                res.status(200).json({ message: `Child Record Deleted Successfully`, affectedHistoryRow: affectedHistoryRows });
            }else{
                res.status(200).json({ message: `Child Record And ${affectedHistoryRows} History Records Deleted Successfully`, affectedHistoryRow: affectedHistoryRows });
            }
        }

        connection.release();
    } catch (error) {
        console.error('Error response users delete /user/:id/:user_detail_id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/change/info/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;
    const { email, nickname } = req.body;

    const isAttacked:boolean = isInjection([email, nickname])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', userChangeInfo: 1 });
    }

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', userChangeInfo: 2 });
    }

    try {
        const connection = await pool.getConnection();

        let whereClause: string[] = [];
        let whereBindings: any[] = [];

        let setStatement: string[] = [];
        let setBinding: any[] = [];

        if (email !== undefined && email !== "") {
            whereClause.push('email = ?');
            whereBindings.push(email);
            setStatement.push('email = ?');
            setBinding.push(email);
        }

        if (nickname !== undefined && nickname !== "") {
            whereClause.push('nickname = ?');
            whereBindings.push(nickname);
            setStatement.push('nickname = ?');
            setBinding.push(nickname);
        }

        if (setStatement.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update', userChangeInfo: 3 });
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
                return res.status(400).json({ message: 'Email or Nickname is already in use', userChangeInfo: 4 });
            }
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
        console.error('Error response put /user/change/info/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

router.put('/new/password', async (req: Request, res: Response) => {

    const { email, old_password, new_password } = req.body;

    const isAttacked:boolean = isInjection([email, old_password, new_password])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', userNewPass: 1 });
    }

    if ((email === undefined || email === "") || (old_password === undefined || old_password === "") || (new_password === undefined || new_password === "")) {
        return res.status(400).json({ message: 'Email, old password and new password are required', userNewPass: 2 });
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
            return res.status(400).json({ message: 'Invalid email', userNewPass: 3 });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(old_password, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid password', userNewPass: 4 });
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

router.put('/:id/:user_detail_id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids:number[] = req?.token?.userDetailIds;

    const { name, description, gender, birthdate, nationality } = req.body;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++){
        if(token_user_detail_ids[i] === user_detail_id){
            legit_child = true;
        }
    }

    if(user_id !== token_id || legit_child === false){
        return res.status(403).json({ message: 'No Authority', childUpdateRes: 1 });
    }

    const isAttacked:boolean = isInjection([name, description, birthdate, nationality])
    const isAttacked2:boolean = isNotNumber([gender])

    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', childUpdateRes: 2});
    }

    let setStatement: string[] = [];
    let setBinding: any[] = [];

    if (name !== undefined && name !== "") {
        setStatement.push('name = ?');
        setBinding.push(name);
    }

    if (description !== undefined && description !== "") {
        setStatement.push('description = ?');
        setBinding.push(description);
    }

    if (gender !== undefined && gender !== null) {
        setStatement.push('gender = ?');
        setBinding.push(gender);
    }

    if (birthdate !== undefined && birthdate !== "") {
        setStatement.push('birthdate = ?');
        setBinding.push(birthdate);
    }

    if (nationality !== undefined && nationality !== "") {
        setStatement.push('nationality = ?');
        setBinding.push(nationality);
    }

    if (setStatement.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update', childUpdateRes: 3 });
    }

    try {
        const connection = await pool.getConnection();

        setBinding.push(user_detail_id);

        await connection.query(`
            UPDATE 
                user_detail
            SET
                ${setStatement.join(', ')}
            WHERE
                id = ?
        `, setBinding);

        res.status(201).json({ message: 'Child info changed'});

    } catch (error) {
        console.error('Error Adding User put /user/:id/:user_detail_id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;