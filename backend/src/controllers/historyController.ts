import { Router, Request, Response } from 'express';
import { pool } from '../db';
import {CustomRequest, isNotNumber, isDateFormat, tokenExtractor} from '../middleware/middleware';
import { ResultSetHeader, FieldPacket } from 'mysql2';

const router = Router();

router.post('/:id/:user_detail_id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids:number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++){
        if(token_user_detail_ids[i] === user_detail_id){
            legit_child = true;
        }
    }

    if(user_id !== token_id || legit_child === false){
        return res.status(403).json({ message: 'No Authority', historyRegiRes: 1 });
    }

    const { vaccine_id, history_date } = req.body;

    const isAttacked:boolean = isDateFormat(history_date)
    const isAttacked2:boolean = isNotNumber([vaccine_id])
    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', historyRegiRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
            SELECT
                COUNT(*) AS count
            FROM
                history
            WHERE
                user_detail_id = ? AND vaccine_id = ?
        `, [user_detail_id, vaccine_id]);

        const result = results as { count: number }[];

        if (result[0].count > 0) {
            return res.status(400).json({ message: 'That vaccine is already dosed', historyRegiRes: 3 });
        }

        await connection.query(`
            INSERT INTO
                history (user_detail_id, vaccine_id, history_date)
            VALUES
                (?, ?, ?)
        `, [user_detail_id, vaccine_id, history_date]);

        res.status(201).json({ message: 'Vaccination History Saved Successfully' });

        connection.release();
    } catch (error) {
        console.error('Error Saving Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id/:user_detail_id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids:number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++){
        if(token_user_detail_ids[i] === user_detail_id){
            legit_child = true;
        }
    }

    if(user_id !== token_id || legit_child === false){
        return res.status(403).json({ message: 'No Authority', historyRes: 1 });
    }

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT
                vaccine.vaccine_name,
                vaccine.vaccine_round,
                history.id,
                history.history_date
            FROM
                history
            JOIN
                vaccine
            ON
                history.vaccine_id = vaccine.id
            WHERE
                user_detail_id = ?
        `, [user_detail_id]);

        res.status(200).json(rows);

        connection.release();
    } catch (error) {
        console.error('Error Saving Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:id/:user_detail_id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids:number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++){
        if(token_user_detail_ids[i] === user_detail_id){
            legit_child = true;
        }
    }

    if(user_id !== token_id || legit_child === false){
        return res.status(403).json({ message: 'No Authority', historyUpdateRes: 1 });
    }

    const { id, history_date } = req.body;

    const isAttacked:boolean = isDateFormat(history_date)
    const isAttacked2:boolean = isNotNumber([id])
    if(isAttacked || isAttacked2){
        return res.status(400).json({ message: 'Suspected to Attacking', historyUpdateRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        const [historyUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE
                history
            SET
                history_date = ?
            WHERE
                id = ?
            AND
                user_detail_id = ?
        `, [history_date, id, user_detail_id]);

        const affectedHistoryRows = historyUpdateResult.affectedRows;

        if(affectedHistoryRows === 0){
            res.status(409).json({ message: 'No Affected Row', affectedHistoryRow: affectedHistoryRows });
        }else{
            res.status(200).json({ message: `Affected History Row ${affectedHistoryRows}`, affectedHistoryRow: affectedHistoryRows});
        }
        connection.release();

    } catch (error) {
        console.error('Error Updating Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:id/:user_detail_id/:history_id', tokenExtractor, async (req: CustomRequest, res: Response) => {

    const user_id:number = parseInt(req.params.id, 10);
    const token_id:number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids:number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++){
        if(token_user_detail_ids[i] === user_detail_id){
            legit_child = true;
        }
    }

    if(user_id !== token_id || legit_child === false){
        return res.status(403).json({ message: 'No Authority', historyDeleteRes: 1 });
    }

    const id = parseInt(req.params.history_id, 10);

    const isAttacked:boolean = isNotNumber([id])
    if(isAttacked){
        return res.status(400).json({ message: 'Suspected to Attacking', historyDeleteRes: 2 });
    }

    try {
        const connection = await pool.getConnection();

        const [historyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            DELETE
            FROM
                history
            WHERE
                id = ?
            AND
                user_detail_id = ?
        `, [id, user_detail_id]);

        const affectedHistoryRows = historyDeleteResult.affectedRows;

        if(affectedHistoryRows === 0){
            res.status(409).json({ message: 'No Affected Row', affectedHistoryRow: affectedHistoryRows });
        }else{
            res.status(200).json({ message: `Affected History Row ${affectedHistoryRows}`, affectedHistoryRow: affectedHistoryRows});
        }
        connection.release();

    } catch (error) {
        console.error('Error Deleting Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;