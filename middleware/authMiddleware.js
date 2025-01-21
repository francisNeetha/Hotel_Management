require("dotenv").config();
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

   
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided." });
    }

    const token = authHeader.split(" ")[1]; 
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }

        req.user = user; 
        console.log("user",user);
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(400).json({ error: "Invalid token." });
    }
};

const verifyUser = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Token missing." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token." });
    }
};

const auth = (req, res, next) => {
    const token = req.headers?.authorization?.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }
    next();
};


module.exports = { 
    authenticateToken,
    verifyAdmin,
    verifyUser,
    auth,
    adminOnly ,
    
};
