import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { CustomRequest, isNotNumber, injectionChecker, patternChecker, tokenExtractor, addUpdateHostileList } from "../middleware/middleware";
import {FieldPacket, ResultSetHeader, RowDataPacket} from "mysql2";
const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
    const { email, nickname, password, adminSecret } = req.body;

    const checked_email = injectionChecker(email);
    const checked_nickname = injectionChecker(nickname);

    if(email !== checked_email || nickname !== checked_nickname){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"email" : checked_email, "nickname" : checked_nickname, "secret" : adminSecret});
    }

    if ((checked_email === undefined || checked_email === "" ) || (checked_nickname === undefined || checked_nickname === "") || (password === undefined || password === "") || (adminSecret === undefined || adminSecret === "")) {
        return res.status(400).json({ message: 'Email, nickname and password and admin secret are required', adminJoinRes: 1 });
    }

    if( adminSecret !== process.env.SECRET ) {
        return res.status(400).json({ message: 'not authorized to make admin account', adminJoinRes: 2 });
    }

    if (!emailRegex.test(checked_email)) {
        return res.status(400).json({ message: 'Invalid email format', adminJoinRes: 3 });
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
            [checked_email]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'Email is already in use', adminJoinRes: 4 });
        }
        await connection.query(`
            INSERT INTO
                admin (email, nickname, password)
            VALUES
                (?, ?, ?)`,
            [checked_email, checked_nickname, hashedPassword]
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
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false });
        return res.status(403).json({ message: 'No Authority', adminUserRes: 1});
    }

    try {
        const connection = await pool.getConnection();

        const [join_only_user] = await connection.query<RowDataPacket[]>(`
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

        for (let i = 0; i < join_only_user.length; i++) {
            join_only_user[i].email = patternChecker(join_only_user[i].email);
            join_only_user[i].nickname = patternChecker(join_only_user[i].nickname);
        }

        const [regular_user] = await connection.query<RowDataPacket[]>(`
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

        for (let i = 0; i < regular_user.length; i++) {

            regular_user[i].email = patternChecker(regular_user[i].email);
            regular_user[i].nickname = patternChecker(regular_user[i].nickname);

            for (let j = 0; j < regular_user[i].children.length; j++) {

                regular_user[i].children[j].name = patternChecker(regular_user[i].children[j].name);
                regular_user[i].children[j].description = patternChecker(regular_user[i].children[j].description);

            }
        }

        const user_info_total = {"joinonly" : join_only_user, "regular" : regular_user}

        res.status(200).json(user_info_total);

        connection.release();
    } catch (error) {
        console.error('Error response get admin/', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/hostile/:page', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false});
        return res.status(403).json({ message: 'No Authority', adminHostileRes: 1});
    }

    const where: string | undefined = typeof req.query.where === 'string' ? req.query.where : undefined;
    const keyword: string | undefined = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;

    const ban: string | undefined = typeof req.query.ban === 'string' ? req.query.ban : undefined;
    const whitelist: string | undefined = typeof req.query.whitelist === 'string' ? req.query.whitelist : undefined;

    const page = 10 * parseInt(req.params.page, 10);

    const checked_where = injectionChecker(where as string);
    const checked_keyword = injectionChecker(keyword as string);
    const checked_ban = injectionChecker(ban as string);
    const checked_whitelist = injectionChecker(whitelist as string);

    const isAttacked:boolean = isNotNumber([page])

    if(where !== checked_where || keyword !== checked_keyword || ban !== checked_ban || whitelist !== checked_whitelist || isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"where" : checked_where, "keyword" : checked_keyword, "page": injectionChecker(`${page}`), "ban" : checked_ban, "whitelist": checked_whitelist});
    }

    const boolean_ban: boolean = checked_ban === "true";
    const boolean_whitelist: boolean = checked_whitelist === "true";

    try {

        const connection = await pool.getConnection();

        let whereClause = '';

        if (checked_where && checked_keyword) {

            switch (where) {
                case 'ip_address':
                    whereClause = `WHERE hostile_list.ip_address LIKE ? AND is_banned = ? AND is_whitelist = ?`;
                    break;
                case 'log':
                    whereClause = `WHERE hostile_list.log LIKE ? AND is_banned = ? AND is_whitelist = ?`;
                    break;
                case 'created_at':
                    whereClause = `WHERE hostile_list.created_at LIKE ? AND is_banned = ? AND is_whitelist = ?`;
                    break;
                case 'updated_at':
                    whereClause = `WHERE hostile_list.updated_at LIKE ? AND is_banned = ? AND is_whitelist = ?`;
                    break;
            }
        }

        if(checked_keyword === ""){
            whereClause = "WHERE is_banned = ? AND is_whitelist = ?";
        }

        const [countRows]: any = await connection.query(`
            SELECT
                count(*) as count
            FROM
                hostile_list
            ${whereClause}`
            , checked_keyword === "" ? [boolean_ban, boolean_whitelist] : [`%${checked_keyword}%`, boolean_ban, boolean_whitelist]);

        const count =  countRows[0].count % 10 === 0 ? Math.trunc(countRows[0].count / 10) : (Math.trunc(countRows[0].count / 10) + 1);


        const [hostile_users] = await connection.query<RowDataPacket[]>(`
            SELECT
                *
            FROM
                hostile_list
            ${whereClause}
            ORDER BY
                hostile_list.id
            DESC
            LIMIT
                10
            OFFSET
                ?
        `, checked_keyword === "" ? [boolean_ban, boolean_whitelist, page] : [`%${checked_keyword}%`, boolean_ban, boolean_whitelist, page]);

        for (let i = 0; i < hostile_users.length; i++){
            hostile_users[i].log = patternChecker(hostile_users[i].log);
        }

        res.status(200).json({"data":hostile_users, "suspects": count});

        connection.release();
    } catch (error) {
        console.error('Error response get admin/hostile/:page', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/hostile/whitelist', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false});
        return res.status(403).json({ message: 'No Authority', adminUpdateRes: 1});
    }

    const { id } = req.body;
    const isAttacked:boolean = isNotNumber([id]);

    if(isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, { "id" : injectionChecker(`${id}`)});

        return res.status(400).json({ message: 'Suspected to Attacking', adminUpdateRes: 2 });
    }

    try {

        const connection = await pool.getConnection();

        const [hostile_ip]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE 
                hostile_list
            SET
                is_whitelist = !is_whitelist
            WHERE
                id = ?
        `, [id]);

        if(hostile_ip.affectedRows === 1){
            res.status(201).json({ message: 'is_whitelist updated'});
        }else{
            return res.status(400).json({ message: 'No valid fields to update', adminUpdateRes: 3 });
        }

        connection.release();
    } catch (error) {
        console.error('Error response put admin/hostile/whitelist', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/hostile/ban', tokenExtractor, async (req: CustomRequest, res: Response) => {

    if(req?.token?.admin === false){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false});
        return res.status(403).json({ message: 'No Authority', adminUpdateRes: 1});
    }

    const { id } = req.body;
    const isAttacked:boolean = isNotNumber([id]);

    if(isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, { "id" : injectionChecker(`${id}`)});

        return res.status(400).json({ message: 'Suspected to Attacking', adminUpdateRes: 2 });
    }

    try {

        const connection = await pool.getConnection();

        const [hostile_ip]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE 
                hostile_list
            SET
                is_banned = !is_banned
            WHERE
                id = ?
        `, [id]);

        if(hostile_ip.affectedRows === 1){
            res.status(201).json({ message: 'is_banned updated'});
        }else{
            return res.status(400).json({ message: 'No valid fields to update', adminUpdateRes: 3 });
        }

        connection.release();
    } catch (error) {
        console.error('Error response put admin/hostile/ban', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/post/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const is_admin:boolean = req?.token?.admin;

    if(is_admin === false) {
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false});

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
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"admin" : false});

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