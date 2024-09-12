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

    const checked_token = injectionChecker(token as string);

    try {
        const decodedToken = jwt.verify(checked_token, secretKey) as JwtPayload;

        const connection = await pool.getConnection();

        const table = decodedToken.admin === true ? "admin" : "user";

        const [results]: [RowDataPacket[], any] = await connection.query(`
            SELECT
                jwt_token, jwt_expires_at
            FROM
                ${table}
            WHERE
                jwt_token = ?
            AND
                id = ?
        `, [checked_token, decodedToken.userId]);

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

function injectionChecker(input: string): string {

    function antiInjection(problematic: string): string {
        switch (problematic) {
            case "--": return "&a&0";

            case ";": return "&a&2";
            case "/\\*": return "&a&3";
            case "\\*/": return "&a&4";
            case "@@": return "&a&5";
            case "char": return "&a&6";
            case "nchar": return "&a&7";
            case "varchar": return "&a&8";
            case "nvarchar": return "&a&9";
            case "alter": return "&b&0";
            case "begin": return "&b&1";
            case "cast": return "&b&2";
            case "create": return "&b&3";
            case "cursor": return "&b&4";
            case "declare": return "&b&5";
            case "delete": return "&b&6";
            case "drop": return "&b&7";
            case "end": return "&b&8";
            case "exec": return "&b&9";
            case "execute": return "&c&0";
            case "fetch": return "&c&1";
            case "insert": return "&c&2";
            case "kill": return "&c&3";
            case "open": return "&c&4";
            case "select": return "&c&5";
            case "sys": return "&c&6";
            case "sysobjects": return "&c&7";
            case "syscolumns": return "&c&8";
            case "table": return "&c&9";
            case "update": return "&d&0";
            case "union": return "&d&1";
            case "join": return "&d&2";
            case `"`: return "&d&3";
            case `'`: return "&d&4";
            case "=": return "&d&5";
            default: return problematic;
        }
    }

    const patterns = [
        '--', ';', '/\\*', '\\*/', '@@', 'char', 'nchar', 'varchar', 'nvarchar', 'alter', 'begin',
        'cast', 'create', 'cursor', 'declare', 'delete', 'drop', 'end', 'exec', 'execute', 'fetch',
        'insert', 'kill', 'open', 'select', 'sys', 'sysobjects', 'syscolumns', 'table', 'update',
        'union', 'join', '"', "'", '='
    ];

    for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'gi');
        input = input.replace(regex, antiInjection(pattern));
    }

    return input;

}

function patternChecker(input: string): string {

    function decodePattern(encoded: string): string {
        switch (encoded) {
            case "&a&0": return "--";

            case "&a&2": return ";";
            case "&a&3": return "/*";
            case "&a&4": return "*/";
            case "&a&5": return "@@";
            case "&a&6": return "char";
            case "&a&7": return "nchar";
            case "&a&8": return "varchar";
            case "&a&9": return "nvarchar";
            case "&b&0": return "alter";
            case "&b&1": return "begin";
            case "&b&2": return "cast";
            case "&b&3": return "create";
            case "&b&4": return "cursor";
            case "&b&5": return "declare";
            case "&b&6": return "delete";
            case "&b&7": return "drop";
            case "&b&8": return "end";
            case "&b&9": return "exec";
            case "&c&0": return "execute";
            case "&c&1": return "fetch";
            case "&c&2": return "insert";
            case "&c&3": return "kill";
            case "&c&4": return "open";
            case "&c&5": return "select";
            case "&c&6": return "sys";
            case "&c&7": return "sysobjects";
            case "&c&8": return "syscolumns";
            case "&c&9": return "table";
            case "&d&0": return "update";
            case "&d&1": return "union";
            case "&d&2": return "join";
            case "&d&3": return `"`;
            case "&d&4": return `'`;
            case "&d&5": return "=";
            default: return encoded;
        }
    }

    const encodedPatterns = [
        "&a&0", "&a&2", "&a&3", "&a&4", "&a&5", "&a&6", "&a&7", "&a&8", "&a&9",
        "&b&0", "&b&1", "&b&2", "&b&3", "&b&4", "&b&5", "&b&6", "&b&7", "&b&8", "&b&9",
        "&c&0", "&c&1", "&c&2", "&c&3", "&c&4", "&c&5", "&c&6", "&c&7", "&c&8", "&c&9",
        "&d&0", "&d&1", "&d&2", "&d&3", "&d&4", "&d&5"
    ];

    for (const pattern of encodedPatterns) {
        const regex = new RegExp(pattern, 'g');
        input = input.replace(regex, decodePattern(pattern));
    }

    return input;

}

function isNotNumber(inputs: any[]): boolean {

    for (const input of inputs) {
        if(typeof input === 'number' || input === undefined || input === null) {
            return false;
        }
    }
    return true;
}

function isDateFormat(input: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(input);
}

export {CustomRequest, tokenExtractor, isNotNumber, injectionChecker, patternChecker, isDateFormat};
