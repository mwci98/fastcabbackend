import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn('--- Auth Middleware: No Token Provided ---');
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
        if (err) {
            console.error('--- Auth Middleware: JWT Verification Failed ---');
            console.error('Error:', err.message);
            console.error('Token:', token.substring(0, 20) + '...');
            return res.status(403).json({
                message: 'Authentication failed',
                error: err.message,
                tokenReceived: token.substring(0, 10) + '...'
            });
        }
        req.user = user;
        next();
    });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
