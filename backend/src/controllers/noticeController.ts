import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';
import {CustomRequest, tokenExtractor, addUpdateHostileList} from '../middleware/middleware';

const router = Router();

interface Row extends RowDataPacket {
    id: number;
    name: string;
    birthdate: string;
    vaccine_name: string;
    vaccine_is_periodical: boolean;
    vaccine_minimum_period_type: string;
    vaccine_minimum_recommend_date: number;
    vaccine_maximum_period_type: string | null;
    vaccine_maximum_recommend_date: number | null;
    vaccine_round: number;
    history_date: string | null;
    expected_vaccine_minimum_recommend_date?: string;
    expected_vaccine_maximum_recommend_date?: string | null;
}

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
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        addUpdateHostileList(clientIp as string, [`id":"` + user_id.toString(), `token":"`+token_id.toString(), `child":"`+user_detail_id]);

        return res.status(403).json({ message: 'No Authority', noticeRes: 1 });
    }

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query<Row[]>(
            `SELECT

                user_detail.birthdate,
                vaccine.id,
                vaccine.vaccine_name,
                vaccine.vaccine_is_periodical,
                vaccine.vaccine_minimum_period_type,
                vaccine.vaccine_minimum_recommend_date,
                vaccine.vaccine_maximum_period_type,
                vaccine.vaccine_maximum_recommend_date,
                vaccine.vaccine_round,
                history.history_date
            FROM
                user_detail
            CROSS JOIN
                vaccine
            LEFT JOIN
                history ON history.user_detail_id = user_detail.id AND history.vaccine_id = vaccine.id
            WHERE
                user_detail.id = ?
            AND
                vaccine.vaccine_national_code = user_detail.nationality
        `, [user_detail_id]);

        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const processRows = (rows: Row[]): Row[] => {
            return rows.map(row => {
                const birthdate = new Date(row.birthdate);

                if (row.history_date === null) {

                    if (row.vaccine_minimum_period_type === "M") {
                        const newDate = new Date(birthdate);
                        newDate.setMonth(birthdate.getMonth() + row.vaccine_minimum_recommend_date);
                        row.expected_vaccine_minimum_recommend_date = formatDate(newDate);
                    } else {
                        const newDate = new Date(birthdate);
                        newDate.setFullYear(birthdate.getFullYear() + row.vaccine_minimum_recommend_date);
                        row.expected_vaccine_minimum_recommend_date = formatDate(newDate);
                    }


                    if (row.vaccine_is_periodical) {
                        if (row.vaccine_maximum_period_type === "M") {
                            const newDate = new Date(birthdate);
                            newDate.setMonth(birthdate.getMonth() + (row.vaccine_maximum_recommend_date || 0));
                            row.expected_vaccine_maximum_recommend_date = formatDate(newDate);
                        } else {
                            const newDate = new Date(birthdate);
                            newDate.setFullYear(birthdate.getFullYear() + (row.vaccine_maximum_recommend_date || 0));
                            row.expected_vaccine_maximum_recommend_date = formatDate(newDate);
                        }
                    }
                }

                return row;
            });
        };

        const processedRows = processRows(rows);

        res.status(200).json(processedRows);

        connection.release();
    } catch (error) {
        console.error('Error Saving Vaccination History:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;