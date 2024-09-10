import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import {CustomRequest, isInjection, isNotNumber, tokenExtractor} from "../middleware/middleware";
import {FieldPacket, ResultSetHeader} from "mysql2";
const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password, adminSecret } = req.body;

    const isAttacked:boolean = isInjection([email, nickname, password, adminSecret])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', adminJoinRes: 1 });
    }

    if ((email === undefined || email === "" ) || (nickname === undefined || nickname === "") || (password === undefined || password === "") || (adminSecret === undefined || adminSecret === "")) {
        return res.status(400).json({ message: 'Email, nickname and password and admin secret are required', adminJoinRes: 2 });
    }

    if( adminSecret !== process.env.SECRET ) {
        return res.status(400).json({ message: 'not authorized to make admin account', adminJoinRes: 3 });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format', adminJoinRes: 4 });
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
            return res.status(400).json({ message: 'Email is already in use', adminJoinRes: 5 });
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

router.get('/', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        return res.status(403).json({ message: 'No Authority', adminUserRes: 1});
    }

    try {
        const connection = await pool.getConnection();

        const [join_only_user] = await connection.query(`
            SELECT
                user.id,
                user.email,
                user.nickname,
                user.is_active,
                user.last_login,
                user.created_at,
                COUNT(DISTINCT board.id) AS post_count,
                COUNT(DISTINCT reply.id) AS reply_count
            FROM
                user
            LEFT OUTER JOIN
                user_detail
            ON
                user.id = user_detail.user_id
            LEFT JOIN
                board
            ON
                user.id = board.user_id
            AND
                board.is_admin = 0
            LEFT JOIN
                reply
            ON
                user.id = reply.user_id
            AND
                reply.is_admin = 0
            WHERE
                user_detail.user_id IS NULL
            GROUP BY
                user.id, user.email, user.nickname, user.is_active, user.last_login, user.created_at;
        `);

        const [regular_user] = await connection.query(`
            SELECT
                user.id,
                user.email,
                user.nickname,
                user.is_active,
                user.last_login,
                user.created_at,
                IFNULL(
                    (
                        SELECT
                            JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'detail_id', user_detail.id,
                                    'name', user_detail.name,
                                    'description', user_detail.description,
                                    'gender', user_detail.gender,
                                    'birthdate', user_detail.birthdate,
                                    'nationality', user_detail.nationality
                                )
                            )
                        FROM
                            user_detail
                        WHERE
                            user_detail.user_id = user.id
                    ),
                    JSON_ARRAY()
                )
                AS
                    children,
                (
                    SELECT
                        COUNT(DISTINCT board.id)
                    FROM
                        board
                    WHERE
                        board.user_id = user.id
                    AND
                        board.is_admin = 0
                )
                AS
                    post_count,
                (   
                    SELECT
                        COUNT(DISTINCT reply.id)
                    FROM
                        reply
                    WHERE
                        reply.user_id = user.id
                    AND
                        reply.is_admin = 0
                )
                AS
                    reply_count
            FROM
                user
            WHERE
                EXISTS (SELECT 1 FROM user_detail WHERE user_detail.user_id = user.id)
            ORDER BY
                user.id;
        `);

        const user_info_total = {"joinonly" : join_only_user, "regular" : regular_user}

        res.status(200).json(user_info_total);

        connection.release();
    } catch (error) {
        console.error('Error response get user/', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/post/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const is_admin:boolean = req?.token?.admin;

    if(is_admin === false) {
        return res.status(403).json({ message: 'No Authority', boardDeleteRes: 1});
    }

    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardDeleteRes: 2 });
    }

    try {

        const connection = await pool.getConnection();

        const [boardDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                board
            WHERE
                id = ?
        `, [id]);

        const affectedBoardRows = boardDeleteResult.affectedRows;

        if(affectedBoardRows === 0){
            res.status(409).json({ message: 'No Affected Row', boardDeleteRes: 3 });
        }else{
            const [replyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                reply
            WHERE
                board_id = ?
        `, [id]);

            const affectedReplyRows = replyDeleteResult.affectedRows;

            res.status(200).json({ message: `Affected Board Row ${affectedBoardRows}`, affectedBoardRow: affectedBoardRows, affectedReplyRows:affectedReplyRows});
        }

        connection.release();
    } catch (error) {
        console.error('Error delete /board/post/:user_id/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/reply/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const is_admin:boolean = req?.token?.admin;

    if(is_admin === false) {
        return res.status(403).json({ message: 'No Authority', boardDeleteRes: 1});
    }

    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardDeleteRes: 2 });
    }

    try {

        const connection = await pool.getConnection();

        const [replyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                reply
            WHERE
                id = ?
        `, [id]);

        const affectedReplyRows = replyDeleteResult.affectedRows;

        if(affectedReplyRows === 0){
            res.status(409).json({ message: 'No Affected Row', boardDeleteRes: 3 });
        }else{

            res.status(200).json({ message: `Affected Reply Row ${affectedReplyRows}`, affectedReplyRows: affectedReplyRows});
        }

        connection.release();
    } catch (error) {
        console.error('Error delete /board/reply/:user_id/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;