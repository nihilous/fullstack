import { Router, Request, Response } from 'express';
import { pool } from '../db';
import {
  addUpdateHostileList,
  injectionChecker,
  isNotNumber,
} from '../middleware/middleware';

const router = Router();

router.get('/:vaccine_national_code', async (req: Request, res: Response) => {
  const { vaccine_national_code } = req.params;

  const vnc_to_number = Number(vaccine_national_code)
  const is_not_parsable = Number.isNaN(vnc_to_number);

  const is_attacked = is_not_parsable ? is_not_parsable : isNotNumber([vnc_to_number]);

  if (is_attacked) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    addUpdateHostileList(clientIp as string, {
      vac_nat_code: injectionChecker(`${vaccine_national_code}`),
    });
  }

  try {
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      `
            SELECT
                *
            FROM
                vaccine
            WHERE
                vaccine_national_code = ?
        `,
      [vaccine_national_code],
    );

    res.status(200).json(rows);

    connection.release();
  } catch (error) {
    console.error('Error recording user interaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
