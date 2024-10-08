const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = 'your-secret-key';
module.exports = function(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Token not found' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Expired token' });
    }
};