import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

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

router.get('/:id', async (req: Request, res: Response) => {
    const user_detail_id = req.params.id;

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query<Row[]>(
            `SELECT
                    user_detail.id,
                    user_detail.name,
                    user_detail.birthdate,
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
                    user_detail.id = ?`,
            [user_detail_id]
        );

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