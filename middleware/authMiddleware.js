const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = 'your-secret-key';

function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired, please log in again' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;