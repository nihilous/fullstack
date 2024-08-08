import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const secretKey = process.env.SECRET;

if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not set');
}

interface TokenType {
    userId: number,
    admin: boolean
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

export {CustomRequest, tokenExtractor};
