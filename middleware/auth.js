"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.warn('--- Auth Middleware: No Token Provided ---');
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
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
exports.authenticateToken = authenticateToken;
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
exports.isAdmin = isAdmin;
