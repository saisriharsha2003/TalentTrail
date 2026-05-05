const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    let token;

    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } 
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return res.status(401).json({ message: 'unauthorized' });
    }

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden', err });
            }

            req.user = decoded.userInfo.username;
            req.role = decoded.userInfo.role;
            req.id = decoded.userInfo.id;

            next();
        }
    );
};

module.exports = verifyJWT;