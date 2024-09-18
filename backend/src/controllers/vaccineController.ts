import { Router, Request, Response } from 'express';
import { pool } from '../db';
import {addUpdateHostileList, injectionChecker} from "../middleware/middleware";

const router = Router();

router.get('/:vaccine_national_code', async (req: Request, res: Response) => {

    const vaccine_national_code:string = req.params.vaccine_national_code

    const checked_vaccine_national_code = injectionChecker(vaccine_national_code)

    if(vaccine_national_code !== checked_vaccine_national_code){
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, {"vac_code" : checked_vaccine_national_code});
    }

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT
                *
            FROM
                vaccine
            WHERE
                vaccine_national_code = ?
        `, [checked_vaccine_national_code]);

        res.status(200).json(rows);

        connection.release();
    } catch (error) {
        console.error('Error recording user interaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;