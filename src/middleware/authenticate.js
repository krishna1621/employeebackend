const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authenticate = async (req, res, next) => {
    // Check if the Authorization header is present
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) {
            return res.status(401).json({ message: 'Authorization denied' });
        }
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};
const authorize = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
module.exports = { authenticate, authorize };