const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Faqat adminlar uchun ruxsat' });
    }
};

module.exports = adminMiddleware;