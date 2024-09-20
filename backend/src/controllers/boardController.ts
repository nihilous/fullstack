import { Router, Response } from 'express';
import { pool } from '../db';
import {CustomRequest, injectionChecker, patternChecker, isNotNumber, tokenExtractor, addUpdateHostileList} from '../middleware/middleware';
import {FieldPacket, ResultSetHeader, RowDataPacket} from "mysql2";

const router = Router();

router.get('/bbs/:user_id/:page', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.user_id, 10);
    const token_id:number = req?.token?.userId;
    const where: string | undefined = typeof req.query.where === 'string' ? req.query.where : undefined;
    const keyword: string | undefined = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;


    if(user_id !== token_id){
        return res.status(403).json({ message: 'No Authority', boardGetRes: 1 });
    }

    const page = 10 * parseInt(req.params.page, 10);

    const checked_where = injectionChecker(where as string);
    const checked_keyword = injectionChecker(keyword as string);

    const isAttacked:boolean = isNotNumber([page])

    if(where !== checked_where || keyword !== checked_keyword || isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "where" : checked_where, "keyword" : checked_keyword});
    }

    if(isAttacked){
       return res.status(400).json({ message: 'Suspected to Attacking', boardGetRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        let whereClause = '';

        if (checked_where && checked_keyword) {

            switch (checked_where) {
                case 'nickname':
                    whereClause = `WHERE user.nickname LIKE ?`;
                    break;
                case 'title':
                    whereClause = `WHERE board.title LIKE ?`;
                    break;
                case 'text':
                    whereClause = `WHERE board.text LIKE ?`;
                    break;
                case 'reply':
                    whereClause = `WHERE reply.text LIKE ?`;
                    break;
            }
        }

        if(checked_keyword === ""){
            whereClause = "";
        }

        const [countRows]: any = await connection.query(`
            SELECT
                count(*) as count
            FROM
                board
            LEFT JOIN
                user
            ON
                board.user_id = user.id
            LEFT JOIN
                reply
            ON
                board.id = reply.board_id
            ${whereClause}`
        , [checked_keyword === "" ? "" :`%${checked_keyword}%`]);

        const count =  countRows[0].count % 10 === 0 ? Math.trunc(countRows[0].count / 10) : (Math.trunc(countRows[0].count / 10) + 1);

        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT
                board.id,
                board.user_id,
                board.title,
                board.updated_at,
                board.is_admin,
                user.nickname
            FROM
                board
            LEFT JOIN
                user
            ON
                board.user_id = user.id
            LEFT JOIN
                reply
            ON
                board.id = reply.board_id
            ${whereClause}
            GROUP BY
                board.id
            ORDER BY
                board.id
            DESC
            LIMIT
                10
            OFFSET
                ?
        `, whereClause === "" ? [page] : [`%${checked_keyword}%`, page]);

        for (let i = 0; i < rows.length; i++) {
            rows[i].title = patternChecker(rows[i].title);

            if(rows[i].nickname !== null){
                rows[i].nickname = patternChecker(rows[i].nickname);
            }
        }

        res.status(200).json({"data":rows, "post": count});

        connection.release();
    } catch (error) {
        console.error('Error Response get /board/bbs/:page :', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/post/:user_id/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.user_id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id){
        return res.status(403).json({ message: 'No Authority', boardPostGetRes: 1 });
    }


    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "post_id" : injectionChecker(`${id}`)});

        return res.status(400).json({ message: 'Suspected to Attacking', boardPostGetRes: 2 });
    }

    try {
        const connection = await pool.getConnection();


        const [post] = await connection.query<RowDataPacket[]>(`
            SELECT
                board_user.id as user_id,
                board_user.nickname,
                board.id,
                board.title,
                board.text,
                board.is_admin,
                board.updated_at,
            CASE
                WHEN
                    COUNT(reply.id) = 0
                THEN
                    NULL
                ELSE
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'reply_user_nickname', reply_user.nickname,
                            'reply_user_id', reply_user.id,
                            'reply_id', reply.id,
                            'reply_text', reply.text,
                            'reply_is_admin', reply.is_admin,
                            'reply_updated_at', reply.updated_at
                        )
                    )
                END AS
                    replies
            FROM
                board
            LEFT JOIN
                reply ON board.id = reply.board_id
            LEFT JOIN
                user AS board_user ON board.user_id = board_user.id
            LEFT JOIN
                user AS reply_user ON reply.user_id = reply_user.id
            WHERE
                board.id = ?
            GROUP BY
                board.id;
        `, [id]);

        if(post[0].nickname !== null){
            post[0].nickname = patternChecker(post[0].nickname)
        }
        post[0].title = patternChecker(post[0].title)
        post[0].text = patternChecker(post[0].text)

        if(post[0].replies !== null){

            for (let i = 0; i < post[0].replies.length; i++){

                if(post[0].replies[i].reply_user_nickname !== null){
                    post[0].replies[i].reply_user_nickname = patternChecker(post[0].replies[i].reply_user_nickname);
                }
                post[0].replies[i].reply_text = patternChecker(post[0].replies[i].reply_text);

            }

        }

        res.status(200).json(post);

        connection.release();
    } catch (error) {
        console.error('Error Response get /board/post/:id ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { user_id, title, text } = req.body;

    const token_id:number = req?.token?.userId;
    const admin:boolean = req.token?.admin;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardPostWriteRes: 1});
    }

    const checked_title = injectionChecker(title);
    const checked_text = injectionChecker(text);

    if(title !== checked_title || text !== checked_text){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "title" : checked_title, "text" : checked_text});
    }

    if ((checked_title === undefined || checked_title === "") || (checked_text === undefined || checked_text === "")) {
        return res.status(400).json({ message: 'Title and Text are required', boardPostWriteRes: 2});
    }

    try {

        const connection = await pool.getConnection();

        await connection.query(`
            INSERT INTO
                board (user_id, title, text, is_admin)
            VALUES
                (?, ?, ?, ?)
        `, [user_id, checked_title, checked_text, admin]);

        res.status(201).json({ message: 'User Post Registered'});

        connection.release();
    } catch (error) {
        console.error('Error registering user post /board/', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { user_id, text } = req.body;
    const token_id:number = req?.token?.userId;
    const admin:boolean = req.token?.admin;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardReplyWriteRes: 1});
    }

    const checked_text = injectionChecker(text);

    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(text !== checked_text || isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "reply" : checked_text, "post_id" : injectionChecker(`${id}`)});
    }

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardReplyWriteRes: 2 });
    }

    if (checked_text === undefined || checked_text === "") {
        return res.status(400).json({ message: 'Text is required', boardReplyWriteRes: 3 });
    }

    try {

        const connection = await pool.getConnection();

        await connection.query(`
            INSERT INTO
                reply (board_id, user_id, text, is_admin)
            VALUES
                (?, ?, ?, ?)
        `, [id, user_id, checked_text, admin]);

        res.status(201).json({ message: 'User Reply Registered'});

        connection.release();
    } catch (error) {
        console.error('Error registering user post /board/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.put('/post/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { user_id, title, text } = req.body;
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardUpdateRes: 1});
    }

    const checked_title = injectionChecker(title);
    const checked_text = injectionChecker(text);

    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if( title !== checked_title || text !== checked_text || isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "title" : checked_title, "text" : checked_text, "post_id" : injectionChecker(`${id}`)});
    }

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardUpdateRes: 2 });
    }

    if ((checked_title === undefined || checked_title === "") || (checked_text === undefined || checked_text === "")) {
        return res.status(400).json({ message: 'Title and Text are required', boardUpdateRes: 3 });
    }

    try {
        const connection = await pool.getConnection();

        const [boardUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE 
                board
            SET
                title = ?,
                text = ?
            WHERE
                id = ?
            AND
                user_id = ?
        `, [checked_title, checked_text, id, user_id]);

        const affectedBoardRows = boardUpdateResult.affectedRows;

        if(affectedBoardRows === 1){
            res.status(201).json({ message: 'Post Updated'});
        }else{
            return res.status(400).json({ message: 'No valid fields to update', boardUpdateRes: 4 });
        }

        connection.release();
    } catch (error) {
        console.error('Error response put /board/post/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }


});

router.put('/reply/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const { user_id, text } = req.body;
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardUpdateRes: 1});
    }

    const checked_text = injectionChecker(text);

    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if( text !== checked_text || isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "reply" : checked_text, "post_id" : injectionChecker(`${id}`)});
    }

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardUpdateRes: 2 });
    }

    if (checked_text === undefined || checked_text === "") {
        return res.status(400).json({ message: 'Text is required', boardUpdateRes: 3 });
    }

    try {
        const connection = await pool.getConnection();

        const [boardUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE 
                reply
            SET
                text = ?
            WHERE
                id = ?
            AND
                user_id = ?
        `, [checked_text, id, user_id]);

        const affectedBoardRows = boardUpdateResult.affectedRows;
        if(affectedBoardRows === 1){
            res.status(201).json({ message: 'Reply Updated'});
        }else{
            return res.status(400).json({ message: 'No valid fields to update', boardUpdateRes: 4 });
        }

        connection.release();
    } catch (error) {
        console.error('Error response put /board/reply:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/post/:user_id/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const user_id:number = parseInt(req.params.user_id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardDeleteRes: 1});
    }


    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "post_id" : injectionChecker(`${id}`)});

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
            AND
                user_id = ?
        `, [id, user_id]);

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

router.delete('/reply/:user_id/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {
    const user_id:number = parseInt(req.params.user_id, 10);
    const token_id:number = req?.token?.userId;

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardDeleteRes: 1});
    }


    const id:number = parseInt(req.params.id, 10);
    const isAttacked:boolean = isNotNumber([id])

    if(isAttacked){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"id" : user_id, "token" : token_id, "reply_id" : injectionChecker(`${id}`)});

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
            AND
                user_id = ?
        `, [id, user_id]);

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