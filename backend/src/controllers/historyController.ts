import { Router, Response } from 'express';
import { ResultSetHeader, FieldPacket, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import {
  CustomRequest,
  isNotNumber,
  isDateFormat,
  tokenExtractor,
  patternChecker,
  addUpdateHostileList,
  injectionChecker,
} from '../middleware/middleware';

const router = Router();

router.post(
  '/:id/:user_detail_id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const user_id: number = parseInt(req.params.id, 10);
    const token_id: number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids: number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++) {
      if (token_user_detail_ids[i] === user_detail_id) {
        legit_child = true;
      }
    }

    if (user_id !== token_id || legit_child === false) {
      return res
        .status(403)
        .json({ message: 'No Authority', historyRegiRes: 1 });
    }

    const { vaccine_id, history_date } = req.body;

    const isAttacked: boolean = isDateFormat(history_date);
    const isAttacked2: boolean = isNotNumber([vaccine_id]);
    if (isAttacked || isAttacked2) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: user_id,
        token: token_id,
        child: user_detail_id,
        vac_date: injectionChecker(`${history_date}`),
        vac_id: injectionChecker(`${vaccine_id}`),
      });

      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', historyRegiRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [results] = await connection.query(
        `
            SELECT
                COUNT(*) AS count
            FROM
                history
            WHERE
                user_detail_id = ? AND vaccine_id = ?
        `,
        [user_detail_id, vaccine_id],
      );

      const result = results as { count: number }[];

      if (result[0].count > 0) {
        return res.status(400).json({
          message: 'That vaccine is already dosed',
          historyRegiRes: 3,
        });
      }

      await connection.query(
        `
            INSERT INTO
                history (user_detail_id, vaccine_id, history_date)
            VALUES
                (?, ?, ?)
        `,
        [user_detail_id, vaccine_id, history_date],
      );

      res
        .status(201)
        .json({ message: 'Vaccination History Saved Successfully' });

      connection.release();
    } catch (error) {
      console.error('Error Saving Vaccination History:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.get(
  '/:id/:user_detail_id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const user_id: number = parseInt(req.params.id, 10);
    const token_id: number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids: number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++) {
      if (token_user_detail_ids[i] === user_detail_id) {
        legit_child = true;
      }
    }

    if (user_id !== token_id || legit_child === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: user_id,
        token: token_id,
        child: user_detail_id,
      });

      return res.status(403).json({ message: 'No Authority', historyRes: 1 });
    }

    try {
      const connection = await pool.getConnection();

      const [rows] = await connection.query<RowDataPacket[]>(
        `
            SELECT
                user_detail.name,
                user_detail.birthdate,
                user_detail.gender,
                user_detail.nationality,
                user_detail.description,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'vaccine_name', vaccine.vaccine_name,
                        'vaccine_round', vaccine.vaccine_round,
                        'id', history.id,
                        'history_date', history.history_date
                    )
                )
                AS histories
            FROM
                history
            JOIN
                vaccine
            ON
                history.vaccine_id = vaccine.id
            JOIN
                user_detail
            ON
                history.user_detail_id = user_detail.id
            WHERE
                user_detail.id = ?
            GROUP BY
                user_detail.id
        `,
        [user_detail_id],
      );

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          rows[i].name = patternChecker(rows[i].name);
          rows[i].description = patternChecker(rows[i].description);
        }

        res.status(200).json(rows);
      } else {
        res.status(409).json({ message: 'No Affected Row', historyRes: 2 });
      }

      connection.release();
    } catch (error) {
      console.error('Error Saving Vaccination History:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put(
  '/:id/:user_detail_id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const user_id: number = parseInt(req.params.id, 10);
    const token_id: number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids: number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++) {
      if (token_user_detail_ids[i] === user_detail_id) {
        legit_child = true;
      }
    }

    if (user_id !== token_id || legit_child === false) {
      return res
        .status(403)
        .json({ message: 'No Authority', historyUpdateRes: 1 });
    }

    const { id, history_date } = req.body;

    const isAttacked: boolean = isDateFormat(history_date);
    const isAttacked2: boolean = isNotNumber([id]);
    if (isAttacked || isAttacked2) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: user_id,
        token: token_id,
        child: user_detail_id,
        vac_date: injectionChecker(`${history_date}`),
        vac_id: injectionChecker(`${id}`),
      });

      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', historyUpdateRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [historyUpdateResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            UPDATE
                history
            SET
                history_date = ?
            WHERE
                id = ?
            AND
                user_detail_id = ?
        `,
        [history_date, id, user_detail_id],
      );

      const affectedHistoryRows = historyUpdateResult.affectedRows;

      if (affectedHistoryRows === 0) {
        res.status(409).json({
          message: 'No Affected Row',
          affectedHistoryRow: affectedHistoryRows,
        });
      } else {
        res.status(200).json({
          message: `Affected History Row ${affectedHistoryRows}`,
          affectedHistoryRow: affectedHistoryRows,
        });
      }
      connection.release();
    } catch (error) {
      console.error('Error Updating Vaccination History:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.delete(
  '/:id/:user_detail_id/:history_id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const user_id: number = parseInt(req.params.id, 10);
    const token_id: number = req?.token?.userId;

    const user_detail_id = parseInt(req.params.user_detail_id, 10);
    const token_user_detail_ids: number[] = req?.token?.userDetailIds;

    let legit_child = false;

    for (let i = 0; i < token_user_detail_ids.length; i++) {
      if (token_user_detail_ids[i] === user_detail_id) {
        legit_child = true;
      }
    }

    if (user_id !== token_id || legit_child === false) {
      return res
        .status(403)
        .json({ message: 'No Authority', historyDeleteRes: 1 });
    }

    const id = parseInt(req.params.history_id, 10);

    const isAttacked: boolean = isNotNumber([id]);
    if (isAttacked) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: user_id,
        token: token_id,
        child: user_detail_id,
        vac_id: injectionChecker(`${id}`),
      });

      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', historyDeleteRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [historyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            DELETE
            FROM
                history
            WHERE
                id = ?
            AND
                user_detail_id = ?
        `,
        [id, user_detail_id],
      );

      const affectedHistoryRows = historyDeleteResult.affectedRows;

      if (affectedHistoryRows === 0) {
        res.status(409).json({
          message: 'No Affected Row',
          affectedHistoryRow: affectedHistoryRows,
        });
      } else {
        res.status(200).json({
          message: `Affected History Row ${affectedHistoryRows}`,
          affectedHistoryRow: affectedHistoryRows,
        });
      }
      connection.release();
    } catch (error) {
      console.error('Error Deleting Vaccination History:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default router;
