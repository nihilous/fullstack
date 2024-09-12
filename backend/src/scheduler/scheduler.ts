import cron from 'node-cron';
import { pool } from '../db';
import {FieldPacket, ResultSetHeader, RowDataPacket} from "mysql2";

const delete_deactivated_user = async () => {

    try {

        const connection = await pool.getConnection();

        const [users] = await connection.query<(RowDataPacket)[]>(`
            SELECT
                user.id,
                IFNULL
                    (
                        (
                            SELECT
                                JSON_ARRAYAGG
                                    (
                                        user_detail.id
                                    )
                            FROM
                                user_detail
                            WHERE
                                user_detail.user_id = user.id
                        ),
                        JSON_ARRAY()
                    )
                AS
                    children
            FROM
                user
            WHERE
                is_active = 0
            AND
                last_login < DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY
                user.id;
        `);

        for (const user of users) {
            if (user.children.length > 0) {

                for(const child of user.children) {
                    const [history_res]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                        DELETE
                        FROM
                            history
                        WHERE
                            user_detail_id = ?
                    `, [child]);

                    console.log("user_detail_id : ", child, " deleted history ", history_res.affectedRows);
                }

            }

            const tables = ["user_detail", "user"]

            for (const table of tables) {

                const [user_detail_res]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
                        DELETE
                        FROM
                            ${table}
                        WHERE
                            ${table === "user_detail" ? "user_id" : "id" } = ?
                    `, [user.id]);

                console.log("user_id : ", user.id, table === "user_detail" ? "deleted children data" : "deleted user data", user_detail_res.affectedRows);

            }

        }

        connection.release();
    } catch (error) {

        console.error('Error Scheduling', error);

    }

    console.log('Running scheduled task at:', new Date());

};

cron.schedule('0 0 * * *', delete_deactivated_user, {
    scheduled: true,
    timezone: 'Europe/Helsinki'
});