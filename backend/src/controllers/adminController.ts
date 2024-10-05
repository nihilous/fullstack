import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db';
import {
  CustomRequest,
  isNotNumber,
  injectionChecker,
  patternChecker,
  tokenExtractor,
  addUpdateHostileList,
} from '../middleware/middleware';

const router = Router();
const saltRounds = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: Request, res: Response) => {
  const {
    email, nickname, password, adminSecret,
  } = req.body;

  const checked_email = injectionChecker(email);
  const checked_nickname = injectionChecker(nickname);

  if (email !== checked_email || nickname !== checked_nickname) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    addUpdateHostileList(clientIp as string, {
      email: checked_email,
      nickname: checked_nickname,
      secret: adminSecret,
    });
  }

  if (
    checked_email === undefined
    || checked_email === ''
    || checked_nickname === undefined
    || checked_nickname === ''
    || password === undefined
    || password === ''
    || adminSecret === undefined
    || adminSecret === ''
  ) {
    return res.status(400).json({
      message: 'Email, nickname and password and admin secret are required',
      adminJoinRes: 1,
    });
  }

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(400).json({
      message: 'not authorized to make admin account',
      adminJoinRes: 2,
    });
  }

  if (!emailRegex.test(checked_email)) {
    return res
      .status(400)
      .json({ message: 'Invalid email format', adminJoinRes: 3 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const connection = await pool.getConnection();

    const [results] = await connection.query(
      `
            SELECT
                COUNT(*) AS count
            FROM
                admin
            WHERE
                email = ?`,
      [checked_email],
    );

    const result = results as { count: number }[];

    if (result[0].count > 0) {
      return res
        .status(400)
        .json({ message: 'Email is already in use', adminJoinRes: 4 });
    }
    await connection.query(
      `
            INSERT INTO
                admin (email, nickname, password)
            VALUES
                (?, ?, ?)
        `,
      [checked_email, checked_nickname, hashedPassword],
    );

    res.status(201).json({ message: 'Admin registered successfully' });

    connection.release();
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post(
  '/manage/add/country',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminAddCountry: 1 });
    }

    const {
      id, code, eng, ori,
    } = req.body;

    const isAttacked = isNotNumber([id]);
    const checked_code = injectionChecker(code);
    const checked_eng = injectionChecker(eng);
    const checked_ori = injectionChecker(ori);

    if (
      code !== checked_code
      || eng !== checked_eng
      || ori !== checked_ori
      || isAttacked
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        code: checked_code,
        eng: checked_eng,
        ori: checked_ori,
        id: injectionChecker(`${id}`),
      });
    }

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminAddCountry: 2 });
    }

    if (
      id === undefined
      || id === null
      || checked_code === undefined
      || checked_code === ''
      || checked_eng === undefined
      || checked_eng === ''
      || checked_ori === undefined
      || checked_ori === ''
    ) {
      return res.status(400).json({
        message: 'id, national code, english name, original name are required',
        adminAddCountry: 3,
      });
    }

    try {
      const connection = await pool.getConnection();

      const [results_existing] = await connection.query(
        `
            SELECT
                COUNT(*) AS count
            FROM
                country
            WHERE
                id = ?`,
        [id],
      );

      const [results_temp] = await connection.query(
        `
            SELECT
                COUNT(*) AS count
            FROM
                temp_country
            WHERE
                id = ?`,
        [id],
      );

      const result_1 = results_existing as { count: number }[];
      const result_2 = results_temp as { count: number }[];

      if (result_1[0].count > 0 || result_2[0].count > 0) {
        return res
          .status(400)
          .json({ message: 'Id is already in use', adminAddCountry: 4 });
      }

      await connection.query(
        `
            INSERT INTO
                temp_country (id, national_code, name_english, name_original)
            VALUES
                (?, ?, ?, ?)
        `,
        [id, checked_code, checked_eng, checked_ori],
      );

      res.status(201).json({ message: 'Temp country registered successfully' });

      connection.release();
    } catch (error) {
      console.error(
        'Error registering temp country /admin/manage/add/country:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.post(
  '/manage/add/vaccine',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminAddVaccine: 1 });
    }

    const {
      vaccine_national_code,
      vaccine_name,
      vaccine_is_periodical,
      vaccine_minimum_period_type,
      vaccine_minimum_recommend_date,
      vaccine_maximum_period_type,
      vaccine_maximum_recommend_date,
      vaccine_round,
      vaccine_description,
    } = req.body;

    const is_periodical = Boolean(vaccine_is_periodical);
    const isAttacked = is_periodical
      ? isNotNumber([
        vaccine_national_code,
        vaccine_minimum_recommend_date,
        vaccine_maximum_recommend_date,
        vaccine_round,
      ])
      : isNotNumber([
        vaccine_national_code,
        vaccine_minimum_recommend_date,
        vaccine_round,
      ]);

    const checked_name = injectionChecker(vaccine_name);
    const checked_min_type = injectionChecker(vaccine_minimum_period_type);
    const checked_max_type = is_periodical
      ? injectionChecker(vaccine_maximum_period_type)
      : null;
    const checked_desc = injectionChecker(vaccine_description);

    if (
      vaccine_name !== checked_name
      || vaccine_minimum_period_type !== checked_min_type
      || vaccine_maximum_period_type !== checked_max_type
      || vaccine_description !== checked_desc
      || isAttacked
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        code: injectionChecker(`${vaccine_national_code}`),
        name: checked_name,
        period: injectionChecker(`${is_periodical}`),
        min_type: checked_min_type,
        min: injectionChecker(`${vaccine_minimum_recommend_date}`),
        max_type: checked_max_type,
        max: injectionChecker(`${vaccine_maximum_recommend_date}`),
        round: injectionChecker(`${vaccine_round}`),
        desc: checked_desc,
      });
    }

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminAddVaccine: 2 });
    }

    if (
      vaccine_national_code === undefined
      || vaccine_national_code === null
      || checked_name === undefined
      || checked_name === ''
      || is_periodical === undefined
      || checked_min_type === undefined
      || checked_min_type === ''
      || vaccine_minimum_recommend_date === undefined
      || vaccine_minimum_recommend_date === null
      || (is_periodical && checked_max_type === undefined)
      || (is_periodical && checked_max_type === '')
      || (is_periodical && vaccine_maximum_recommend_date === undefined)
      || (is_periodical && vaccine_maximum_recommend_date === null)
      || vaccine_round === undefined
      || vaccine_round === null
      || checked_desc === undefined
      || checked_desc === ''
    ) {
      return res.status(400).json({
        message:
          'code, name, periodical, min/max type & recommend date, round, desc required',
        adminAddVaccine: 3,
      });
    }

    try {
      const connection = await pool.getConnection();

      await connection.query(
        `
            INSERT INTO
                temp_vaccine (
                    vaccine_national_code,
                    vaccine_name,
                    vaccine_is_periodical,
                    vaccine_minimum_period_type,
                    vaccine_minimum_recommend_date,
                    vaccine_maximum_period_type,
                    vaccine_maximum_recommend_date,
                    vaccine_round,
                    vaccine_description
                )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          vaccine_national_code,
          checked_name,
          is_periodical,
          checked_min_type,
          vaccine_minimum_recommend_date,
          checked_max_type,
          vaccine_maximum_recommend_date,
          vaccine_round,
          checked_desc,
        ],
      );

      res.status(201).json({ message: 'Temp vaccine registered successfully' });

      connection.release();
    } catch (error) {
      console.error(
        'Error registering temp country /admin/manage/add/vaccine:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.get('/', tokenExtractor, async (req: CustomRequest, res: Response) => {
  if (req?.token?.admin === false) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    addUpdateHostileList(clientIp as string, { admin: false });
    return res.status(403).json({ message: 'No Authority', adminUserRes: 1 });
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
                                    'nationality', user_detail.nationality,
                                    'name_original', country.name_original
                                )
                            )
                        FROM
                            user_detail
                        JOIN
                            country
                        ON
                            user_detail.nationality = country.id
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
        regular_user[i].children[j].name = patternChecker(
          regular_user[i].children[j].name,
        );
        regular_user[i].children[j].description = patternChecker(
          regular_user[i].children[j].description,
        );
      }
    }

    const user_info_total = { joinonly: join_only_user, regular: regular_user };

    res.status(200).json(user_info_total);

    connection.release();
  } catch (error) {
    console.error('Error response get admin/', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get(
  '/hostile/:page',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminHostileRes: 1 });
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

    const isAttacked: boolean = isNotNumber([page]);

    if (
      where !== checked_where
      || keyword !== checked_keyword
      || ban !== checked_ban
      || whitelist !== checked_whitelist
      || isAttacked
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        where: checked_where,
        keyword: checked_keyword,
        page: injectionChecker(`${page}`),
        ban: checked_ban,
        whitelist: checked_whitelist,
      });
    }

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminHostile: 1 });
    }

    const boolean_ban: boolean = checked_ban === 'true';
    const boolean_whitelist: boolean = checked_whitelist === 'true';

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

      if (checked_keyword === '') {
        whereClause = 'WHERE is_banned = ? AND is_whitelist = ?';
      }

      const [countRows] = await connection.query<RowDataPacket[]>(
        `
            SELECT
                count(*) as count
            FROM
                hostile_list
            ${whereClause}`,
        checked_keyword === ''
          ? [boolean_ban, boolean_whitelist]
          : [`%${checked_keyword}%`, boolean_ban, boolean_whitelist],
      );

      const count = countRows[0].count % 10 === 0
        ? Math.trunc(countRows[0].count / 10)
        : Math.trunc(countRows[0].count / 10) + 1;

      const [hostile_users] = await connection.query<RowDataPacket[]>(
        `
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
        `,
        checked_keyword === ''
          ? [boolean_ban, boolean_whitelist, page]
          : [`%${checked_keyword}%`, boolean_ban, boolean_whitelist, page],
      );

      for (let i = 0; i < hostile_users.length; i++) {
        hostile_users[i].log = patternChecker(hostile_users[i].log);
      }

      res.status(200).json({ data: hostile_users, suspects: count });

      connection.release();
    } catch (error) {
      console.error('Error response get admin/hostile/:page', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.get(
  '/manage',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminManageRes: 1 });
    }

    try {
      const connection = await pool.getConnection();

      const [existing_countries] = await connection.query(`
            SELECT
                *
            FROM
                country
        `);

      const [temporal_countries] = await connection.query(`
            SELECT
                *
            FROM
                temp_country
        `);

      const [vaccine_names] = await connection.query(`
            SELECT
                ROW_NUMBER() OVER (ORDER BY vaccine_name) AS id,
                vaccine_name
            FROM
                vaccine
            WHERE
                vaccine_national_code = 3
            GROUP BY
                vaccine_name
            ORDER BY
                vaccine_name
        `);

      const [temporal_vaccine] = await connection.query<RowDataPacket[]>(`
            SELECT
                tv.id,
                tv.vaccine_national_code,
                COALESCE(
                    country.name_original,
                    temp_country.name_original
                )
                AS country_name_original,
                tv.vaccine_name,
                tv.vaccine_is_periodical,
                tv.vaccine_minimum_period_type,
                tv.vaccine_minimum_recommend_date,
                tv.vaccine_maximum_period_type,
                tv.vaccine_maximum_recommend_date,
                tv.vaccine_round,
                tv.vaccine_description,
                CASE
                    WHEN vaccine_minimum_period_type = 'Y' THEN vaccine_minimum_recommend_date * 12
                    WHEN vaccine_minimum_period_type = 'M' THEN vaccine_minimum_recommend_date
                END AS vaccine_minimum_months
            FROM
                temp_vaccine
            AS
                tv
            LEFT JOIN
                country
            ON
                tv.vaccine_national_code = country.id
            LEFT JOIN
                temp_country
            ON
                tv.vaccine_national_code = temp_country.id
            ORDER BY
                tv.vaccine_national_code ASC,
                vaccine_minimum_months ASC,
                tv.vaccine_name ASC,
                tv.vaccine_round ASC
        `);

      for (let i = 0; i < temporal_vaccine.length; i++) {
        temporal_vaccine[i].country_name_original = patternChecker(
          temporal_vaccine[i].country_name_original,
        );
        temporal_vaccine[i].vaccine_name = patternChecker(
          temporal_vaccine[i].vaccine_name,
        );
        temporal_vaccine[i].vaccine_minimum_period_type = patternChecker(
          temporal_vaccine[i].vaccine_minimum_period_type,
        );
        temporal_vaccine[i].vaccine_maximum_period_type = temporal_vaccine[i].vaccine_maximum_period_type !== null
          ? patternChecker(temporal_vaccine[i].vaccine_maximum_period_type)
          : temporal_vaccine[i].vaccine_maximum_period_type;
        temporal_vaccine[i].vaccine_description = patternChecker(
          temporal_vaccine[i].vaccine_description,
        );
      }

      res.status(200).json({
        existing_countries,
        temporal_countries,
        existing_vaccines: vaccine_names,
        temporal_vaccines: temporal_vaccine,
      });

      connection.release();
    } catch (error) {
      console.error('Error response get admin/manage', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put(
  '/hostile/whitelist',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminUpdateRes: 1 });
    }

    const { id } = req.body;
    const isAttacked: boolean = isNotNumber([id]);

    if (isAttacked) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: injectionChecker(`${id}`),
      });

      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminUpdateRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [hostile_ip]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            UPDATE 
                hostile_list
            SET
                is_whitelist = !is_whitelist
            WHERE
                id = ?
        `,
        [id],
      );

      if (hostile_ip.affectedRows === 1) {
        res.status(201).json({ message: 'is_whitelist updated' });
      } else {
        return res
          .status(400)
          .json({ message: 'No valid fields to update', adminUpdateRes: 3 });
      }

      connection.release();
    } catch (error) {
      console.error('Error response put admin/hostile/whitelist', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put(
  '/hostile/ban',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminUpdateRes: 1 });
    }

    const { id } = req.body;
    const isAttacked: boolean = isNotNumber([id]);

    if (isAttacked) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: injectionChecker(`${id}`),
      });

      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminUpdateRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [hostile_ip]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            UPDATE 
                hostile_list
            SET
                is_banned = !is_banned
            WHERE
                id = ?
        `,
        [id],
      );

      if (hostile_ip.affectedRows === 1) {
        res.status(201).json({ message: 'is_banned updated' });
      } else {
        return res
          .status(400)
          .json({ message: 'No valid fields to update', adminUpdateRes: 3 });
      }

      connection.release();
    } catch (error) {
      console.error('Error response put admin/hostile/ban', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put(
  '/change/info/:id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const user_id: number = parseInt(req.params.id, 10);
    const token_id: number = req?.token?.userId;
    const { email, nickname, adminSecret } = req.body;

    const checked_email = injectionChecker(email);
    const checked_nickname = injectionChecker(nickname);
    const checked_admin_secret = injectionChecker(adminSecret);

    if (
      checked_email !== email
      || checked_nickname !== nickname
      || checked_admin_secret !== adminSecret
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: user_id,
        token: token_id,
        email: checked_email,
        nickname: checked_nickname,
        'adminSecret ': adminSecret,
      });
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(400).json({
        message: 'not authorized to modify admin account',
        changeInfo: 1,
      });
    }

    if (user_id !== token_id) {
      return res.status(403).json({ message: 'No Authority', changeInfo: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const whereClause: string[] = [];
      const whereBindings: any[] = [];

      const setStatement: string[] = [];
      const setBinding: any[] = [];

      if (checked_email !== undefined && checked_email !== '') {
        whereClause.push('email = ?');
        whereBindings.push(checked_email);
        setStatement.push('email = ?');
        setBinding.push(checked_email);
      }

      if (checked_nickname !== undefined && checked_nickname !== '') {
        whereClause.push('nickname = ?');
        whereBindings.push(checked_nickname);
        setStatement.push('nickname = ?');
        setBinding.push(checked_nickname);
      }

      if (setStatement.length === 0) {
        return res
          .status(400)
          .json({ message: 'No valid fields to update', changeInfo: 3 });
      }

      if (whereClause.length > 0) {
        const [existingUsers] = await connection.query(
          `
                SELECT
                    COUNT(*) AS count 
                FROM
                    admin 
                WHERE
                    (${whereClause.join(' OR ')}) 
                AND
                    id != ?`,
          [...whereBindings, token_id],
        );

        if ((existingUsers as any)[0].count > 0) {
          return res.status(400).json({
            message: 'Email or Nickname is already in use',
            changeInfo: 4,
          });
        }
      }

      setBinding.push(token_id);

      await connection.query(
        `
            UPDATE 
                admin
            SET
                ${setStatement.join(', ')}
            WHERE
                id = ?
        `,
        setBinding,
      );

      res.status(201).json({ message: 'User info changed' });

      connection.release();
    } catch (error) {
      console.error('Error response put /user/change/info/:id', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put('/new/password', async (req: Request, res: Response) => {
  const {
    email, old_password, new_password, adminSecret,
  } = req.body;

  const checked_email = injectionChecker(email);
  const checked_admin_secret = injectionChecker(adminSecret);

  if (checked_email !== email || checked_admin_secret !== adminSecret) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    addUpdateHostileList(clientIp as string, {
      email: checked_email,
      'adminSecret ': adminSecret,
    });
  }

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(400).json({
      message: 'not authorized to modify admin password',
      changePass: 1,
    });
  }

  if (
    email === undefined
    || email === ''
    || old_password === undefined
    || old_password === ''
    || new_password === undefined
    || new_password === ''
    || adminSecret === undefined
    || adminSecret === ''
  ) {
    return res.status(400).json({
      message:
        'Email, old password and new password, admin secret are required',
      changePass: 2,
    });
  }

  try {
    const connection = await pool.getConnection();

    const [results] = await connection.query(
      `
                SELECT
                    password
                FROM
                    admin
                WHERE
                    email = ?
            `,
      [checked_email],
    );

    const users = results as { password: string }[];

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email', changePass: 3 });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(old_password, user.password);

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ message: 'Invalid password', changePass: 4 });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    await connection.query(
      `
                UPDATE 
                    admin
                SET
                    password = ?
                WHERE
                    email = ? 
            `,
      [hashedNewPassword, checked_email],
    );

    res.status(201).json({ message: 'Password changed' });

    connection.release();
  } catch (error) {
    console.error('Error response put /user/new/password', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put(
  '/manage/update/country',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminUpdateCountry: 1 });
    }

    const {
      ori_id, new_id, code, eng, ori,
    } = req.body;

    const isAttacked = isNotNumber([ori_id, new_id]);
    const checked_code = injectionChecker(code);
    const checked_eng = injectionChecker(eng);
    const checked_ori = injectionChecker(ori);
    const is_id_remain = ori_id === new_id;

    if (
      code !== checked_code
      || eng !== checked_eng
      || ori !== checked_ori
      || isAttacked
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        ori_id: injectionChecker(`${ori_id}`),
        new_id: injectionChecker(`${new_id}`),
        code: checked_code,
        eng: checked_eng,
        ori: checked_ori,
      });
    }

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminUpdateCountry: 2 });
    }

    if (
      checked_code === undefined
      || checked_code === ''
      || checked_eng === undefined
      || checked_eng === ''
      || checked_ori === undefined
      || checked_ori === ''
    ) {
      return res.status(400).json({
        message: 'national code, english name, original name are required',
        adminUpdateCountry: 3,
      });
    }

    try {
      const connection = await pool.getConnection();

      const [results_existing] = await connection.query(
        `
            SELECT
                COUNT(*) AS count
            FROM
                country
            WHERE
                id = ?`,
        [new_id],
      );

      const [results_temp] = await connection.query(
        `
            SELECT
                COUNT(*) AS count
            FROM
                temp_country
            WHERE
                id = ?`,
        [new_id],
      );

      const result_1 = results_existing as { count: number }[];
      const result_2 = results_temp as { count: number }[];

      if (result_1[0].count > 0 || (!is_id_remain && result_2[0].count > 0)) {
        return res
          .status(400)
          .json({ message: 'Id is already in use', adminUpdateCountry: 4 });
      }

      const [updated_temp_country]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            UPDATE 
                temp_country
            SET
                id = ?,
                national_code = ?,
                name_english = ?,
                name_original = ?
            WHERE
                id = ?
        `,
        [new_id, checked_code, checked_eng, checked_ori, ori_id],
      );

      if (updated_temp_country.affectedRows === 1) {
        res.status(201).json({ message: 'Temp country updated successfully' });
      } else {
        return res.status(400).json({
          message: 'No valid fields to update',
          adminUpdateCountry: 5,
        });
      }

      connection.release();
    } catch (error) {
      console.error(
        'Error registering temp country /admin/manage/add/country:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.put(
  '/manage/update/vaccine',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminModifyVaccine: 1 });
    }

    const {
      vaccine_id,
      vaccine_national_code,
      vaccine_name,
      vaccine_is_periodical,
      vaccine_minimum_period_type,
      vaccine_minimum_recommend_date,
      vaccine_maximum_period_type,
      vaccine_maximum_recommend_date,
      vaccine_round,
      vaccine_description,
    } = req.body;

    const is_periodical = Boolean(vaccine_is_periodical);
    const isAttacked = is_periodical
      ? isNotNumber([
        vaccine_id,
        vaccine_national_code,
        vaccine_minimum_recommend_date,
        vaccine_maximum_recommend_date,
        vaccine_round,
      ])
      : isNotNumber([
        vaccine_id,
        vaccine_national_code,
        vaccine_minimum_recommend_date,
        vaccine_round,
      ]);

    const checked_name = injectionChecker(vaccine_name);
    const checked_min_type = injectionChecker(vaccine_minimum_period_type);
    const checked_max_type = is_periodical
      ? injectionChecker(vaccine_maximum_period_type)
      : null;
    const checked_desc = injectionChecker(vaccine_description);

    if (
      vaccine_name !== checked_name
      || vaccine_minimum_period_type !== checked_min_type
      || vaccine_maximum_period_type !== checked_max_type
      || vaccine_description !== checked_desc
      || isAttacked
    ) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: injectionChecker(`${vaccine_id}`),
        code: injectionChecker(`${vaccine_national_code}`),
        name: checked_name,
        period: injectionChecker(`${is_periodical}`),
        min_type: checked_min_type,
        min: injectionChecker(`${vaccine_minimum_recommend_date}`),
        max_type: checked_max_type,
        max: injectionChecker(`${vaccine_maximum_recommend_date}`),
        round: injectionChecker(`${vaccine_round}`),
        desc: checked_desc,
      });
    }

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminModifyVaccine: 2 });
    }

    if (
      vaccine_id === undefined
      || vaccine_id === null
      || vaccine_national_code === undefined
      || vaccine_national_code === null
      || checked_name === undefined
      || checked_name === ''
      || is_periodical === undefined
      || checked_min_type === undefined
      || checked_min_type === ''
      || vaccine_minimum_recommend_date === undefined
      || vaccine_minimum_recommend_date === null
      || (is_periodical && checked_max_type === undefined)
      || (is_periodical && checked_max_type === '')
      || (is_periodical && vaccine_maximum_recommend_date === undefined)
      || (is_periodical && vaccine_maximum_recommend_date === null)
      || vaccine_round === undefined
      || vaccine_round === null
      || checked_desc === undefined
      || checked_desc === ''
    ) {
      return res.status(400).json({
        message:
          'id, national code, name, is period, min/max type & recommend date, round, desc required',
        adminModifyVaccine: 3,
      });
    }

    try {
      const connection = await pool.getConnection();

      const [updated_temp_vaccine]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            UPDATE 
                temp_vaccine
            SET
                vaccine_national_code = ?,
                vaccine_name = ?,
                vaccine_is_periodical = ?,
                vaccine_minimum_period_type = ?,
                vaccine_minimum_recommend_date = ?,
                vaccine_maximum_period_type = ?,
                vaccine_maximum_recommend_date = ?,
                vaccine_round = ?,
                vaccine_description = ?
            WHERE
                id =?
        `,
        [
          vaccine_national_code,
          checked_name,
          is_periodical,
          checked_min_type,
          vaccine_minimum_recommend_date,
          checked_max_type,
          vaccine_maximum_recommend_date,
          vaccine_round,
          checked_desc,
          vaccine_id,
        ],
      );

      if (updated_temp_vaccine.affectedRows === 1) {
        res.status(201).json({ message: 'Temp vaccine updated successfully' });
      } else {
        return res.status(400).json({
          message: 'No valid fields to update',
          adminModifyVaccine: 4,
        });
      }

      connection.release();
    } catch (error) {
      console.error(
        'Error registering temp country /admin/manage/update/vaccine:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.delete(
  '/post/:id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const is_admin: boolean = req?.token?.admin;

    if (is_admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });

      return res
        .status(403)
        .json({ message: 'No Authority', boardDeleteRes: 1 });
    }

    const id: number = parseInt(req.params.id, 10);
    const isAttacked: boolean = isNotNumber([id]);

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', boardDeleteRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [boardDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            DELETE
            FROM
                board
            WHERE
                id = ?
        `,
        [id],
      );

      const affectedBoardRows = boardDeleteResult.affectedRows;

      if (affectedBoardRows === 0) {
        res.status(409).json({ message: 'No Affected Row', boardDeleteRes: 3 });
      } else {
        const [replyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(
          `
            DELETE
            FROM
                reply
            WHERE
                board_id = ?
        `,
          [id],
        );

        const affectedReplyRows = replyDeleteResult.affectedRows;

        res.status(200).json({
          message: `Affected Board Row ${affectedBoardRows}`,
          affectedBoardRow: affectedBoardRows,
          affectedReplyRows,
        });
      }

      connection.release();
    } catch (error) {
      console.error('Error delete /board/post/:user_id/:id', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.delete(
  '/reply/:id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    const is_admin: boolean = req?.token?.admin;

    if (is_admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });

      return res
        .status(403)
        .json({ message: 'No Authority', boardDeleteRes: 1 });
    }

    const id: number = parseInt(req.params.id, 10);
    const isAttacked: boolean = isNotNumber([id]);

    if (isAttacked) {
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', boardDeleteRes: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [replyDeleteResult]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            DELETE
            FROM
                reply
            WHERE
                id = ?
        `,
        [id],
      );

      const affectedReplyRows = replyDeleteResult.affectedRows;

      if (affectedReplyRows === 0) {
        res.status(409).json({ message: 'No Affected Row', boardDeleteRes: 3 });
      } else {
        res.status(200).json({
          message: `Affected Reply Row ${affectedReplyRows}`,
          affectedReplyRows,
        });
      }

      connection.release();
    } catch (error) {
      console.error('Error delete /board/reply/:user_id/:id', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.delete(
  '/manage/delete/country/:id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminDeleteCountry: 1 });
    }

    const id = parseInt(req.params.id, 10);

    const isAttacked = isNotNumber([id]);

    if (isAttacked) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: injectionChecker(`${id}`),
      });
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminDeleteCountry: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [deleted_temp_country]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            DELETE
            FROM 
                temp_country
            WHERE
                id = ?
        `,
        [id],
      );

      if (deleted_temp_country.affectedRows === 1) {
        res.status(201).json({ message: 'Temp country deleted successfully' });
      } else {
        return res.status(400).json({
          message: 'No valid fields to delete',
          adminDeleteCountry: 3,
        });
      }

      connection.release();
    } catch (error) {
      console.error(
        'Error deleting temp country /admin/manage/delete/country:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

router.delete(
  '/manage/delete/vaccine/:id',
  tokenExtractor,
  async (req: CustomRequest, res: Response) => {
    if (req?.token?.admin === false) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, { admin: false });
      return res
        .status(403)
        .json({ message: 'No Authority', adminDeleteCountry: 1 });
    }

    const id = parseInt(req.params.id, 10);

    const isAttacked = isNotNumber([id]);

    if (isAttacked) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      addUpdateHostileList(clientIp as string, {
        id: injectionChecker(`${id}`),
      });
      return res
        .status(400)
        .json({ message: 'Suspected to Attacking', adminDeleteCountry: 2 });
    }

    try {
      const connection = await pool.getConnection();

      const [deleted_temp_vaccine]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        `
            DELETE
            FROM 
                temp_vaccine
            WHERE
                id = ?
        `,
        [id],
      );

      if (deleted_temp_vaccine.affectedRows === 1) {
        res.status(201).json({ message: 'Temp vaccine deleted successfully' });
      } else {
        return res.status(400).json({
          message: 'No valid fields to delete',
          adminDeleteCountry: 3,
        });
      }

      connection.release();
    } catch (error) {
      console.error(
        'Error deleting temp vaccine /admin/manage/delete/vaccine:',
        error,
      );
      res.status(500).json({ message: 'Internal server error' });
    }
  },
);

export default router;
