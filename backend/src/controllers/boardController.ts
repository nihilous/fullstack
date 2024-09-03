import { Router, Response } from 'express';
import { pool } from '../db';
import {CustomRequest, isInjection, isNotNumber, tokenExtractor} from '../middleware/middleware';

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

    const isAttacked:boolean = isInjection([where as string, keyword as string]);
    const isAttacked2:boolean = isNotNumber([page])

    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', boardGetRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        let whereClause = '';

        if (where && keyword) {

            switch (where) {
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
                default:
                    whereClause = '';
                    break;
            }
        }

        const [countRows]: any = await connection.query(`
            SELECT
                count(*) as count
            FROM
                board
            JOIN
                user
            ON
                board.user_id = user.id
            LEFT JOIN
                reply
            ON
                board.id = reply.board_id
            ${whereClause}`
        , [`%${keyword}%`]);


        const count =  (Math.trunc(countRows[0].count / 10) + 1);

        const [rows] = await connection.query(`
            SELECT
                board.id,
                board.user_id,
                board.title,
                board.updated_at,
                user.nickname
            FROM
                board
            JOIN
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
        `, where === "" ? [page] : [`%${keyword}%`, page]);

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
        return res.status(400).json({ message: 'Suspected to Attacking', boardPostGetRes: 2 });
    }

    try {
        const connection = await pool.getConnection();


        const [post] = await connection.query(`
            SELECT
                board_user.id as user_id,
                board_user.nickname,
                board.id,
                board.title,
                board.text,
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

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardPostWriteRes: 1});
    }

    const isAttacked:boolean = isInjection([title, text])

    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', boardPostWriteRes: 2 });
    }

    if ((title === undefined || title === "") || (text === undefined || text === "")) {
        return res.status(400).json({ message: 'Title and Text are required', boardPostWriteRes: 3 });
    }

    try {

        const connection = await pool.getConnection();

        await connection.query(`
            INSERT INTO
                board (user_id, title, text)
            VALUES
                (?, ?, ?)
        `, [user_id, title, text]);

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

    if(user_id !== token_id) {
        return res.status(403).json({ message: 'No Authority', boardReplyWriteRes: 1});
    }

    const isAttacked:boolean = isInjection([text])

    const id:number = parseInt(req.params.id, 10);
    const isAttacked2:boolean = isNotNumber([id])

    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', boardReplyWriteRes: 2 });
    }

    if (text === undefined || text === "") {
        return res.status(400).json({ message: 'Text is required', boardReplyWriteRes: 3 });
    }

    try {

        const connection = await pool.getConnection();

        await connection.query(`
            INSERT INTO
                reply (board_id, user_id, text)
            VALUES
                (?, ?, ?)
        `, [id, user_id, text]);

        res.status(201).json({ message: 'User Reply Registered'});

        connection.release();
    } catch (error) {
        console.error('Error registering user post /board/:id', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/*
router.put('/post:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

});

router.put('/reply:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

});

router.delete('/post/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

});

router.delete('/reply/:id', tokenExtractor, async (req: CustomRequest, res: Response) => {

});
*/

export default router;