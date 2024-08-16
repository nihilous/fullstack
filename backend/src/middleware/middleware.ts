import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

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

const tokenExtractor = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
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
        'union', 'join'
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
        if(typeof input !== 'number') {
            return true;
        }
    }
    return false;
}


export {CustomRequest, tokenExtractor, isInjection, isNotNumber};
