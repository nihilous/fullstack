import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

const secretKey = process.env.SECRET;

if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}

interface TokenType {
    userId: number,
    admin: boolean,
    userDetailIds: number[];
}

interface CustomRequest extends Request {
    token?: TokenType | JwtPayload ;
}

const tokenExtractor = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decodedToken = jwt.verify(token, secretKey) as JwtPayload;

        const connection = await pool.getConnection();

        const [results]: [RowDataPacket[], any] = await connection.query(`
            SELECT
                jwt_token, jwt_expires_at
            FROM
                user
            WHERE
                jwt_token = ?
            AND
                id = ?
        `, [token, decodedToken.userId]);

        connection.release();

        if (results.length === 0) {
            return res.status(403).json({ message: 'Invalid token', tokenExpired: false });
        }

        const { jwt_expires_at } = results[0];
        const expirationDate = new Date(jwt_expires_at).getTime();
        const currentTime = Date.now();

        if (currentTime > expirationDate) {
            return res.status(403).json({ message: 'Token expired', tokenExpired: true });
        }

        req.token = decodedToken;
    } catch (error) {
        return res.sendStatus(403);
    }
    next();
};

function isInjection(inputs: string[]): boolean {

    const patterns = [
        '--',
        ';--',
        ';',
        '/*', '*/',
        '@@',
        'char', 'nchar', 'varchar', 'nvarchar',
        'alter', 'begin', 'cast', 'create', 'cursor', 'declare', 'delete', 'drop', 'end',
        'exec', 'execute', 'fetch', 'insert', 'kill', 'open', 'select', 'sys', 'sysobjects',
        'syscolumns', 'table', 'update',
        'union', 'join', '"', "'", '='
    ];

    for (const input of inputs) {
        const lowerCaseInput = input.toLowerCase();

        for (const pattern of patterns) {
            if (lowerCaseInput.includes(pattern)) {
                return true;
            }
        }
    }

    return false;
}

function isNotNumber(inputs: any[]): boolean {

    for (const input of inputs) {
        if(typeof input === 'number' || input === undefined || input === null) {
            return false;
        }
    }
    return true;
}


export {CustomRequest, tokenExtractor, isInjection, isNotNumber};
