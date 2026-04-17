const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ROLES = ['student', 'college', 'recruiter', 'admin'];

const cookieOptions = {
    httpOnly: true,
    sameSite: 'Lax',
    secure: false
};

const handleRegister = async (req, res, next) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password and role are required' });
    }

    if (!ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const regexUser = /^[A-Za-z][A-Za-z_0-9]{7,30}$/;
    if (!regexUser.test(username)) {
        return res.status(406).json({
            message: 'Username must start with letter and be 8+ chars'
        });
    }

    try {
        const User = require('../models/' + role);

        const duplicate = await User.findOne({ username }).exec();
        if (duplicate) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        await User.create({
            username,
            password: hashedPwd,
            refreshToken: []
        });

        res.status(201).json({ success: `${role} created` });

    } catch (err) {
        next(err);
    }
};

const handleLogin = async (req, res) => {
    const cookies = req.cookies;
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'All fields required' });
    }

    if (!ROLES.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const User = require('../models/' + role);
        const foundUser = await User.findOne({ username }).exec();

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const match = await bcrypt.compare(password, foundUser.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const accessToken = jwt.sign(
            {
                userInfo: {
                    id: foundUser._id,
                    username: foundUser.username,
                    role: role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            {
                username: foundUser.username,
                role: role
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        let newRefreshTokenArray = !cookies?.jwt
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

        if (cookies?.jwt) {
            res.clearCookie('jwt', cookieOptions);
        }

        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();

        res.cookie('jwt', newRefreshToken, cookieOptions);

        res.json({
            success: `${role} ${username} logged in`,
            accessToken
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {

            if (err) return res.sendStatus(403);

            const { username, role } = decoded;

            if (!ROLES.includes(role)) return res.sendStatus(403);

            const User = require('../models/' + role);

            const foundUser = await User.findOne({ username }).exec();
            if (!foundUser) return res.sendStatus(403);

            if (!foundUser.refreshToken.includes(refreshToken)) {
                return res.sendStatus(403);
            }

            const accessToken = jwt.sign(
                {
                    userInfo: {
                        id: foundUser._id,
                        username: foundUser.username,
                        role: role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                {
                    username: foundUser.username,
                    role: role
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );

            // rotate token safely
            foundUser.refreshToken = foundUser.refreshToken.map(rt =>
                rt === refreshToken ? newRefreshToken : rt
            );

            await foundUser.save();

            res.cookie('jwt', newRefreshToken, cookieOptions);

            res.json({ accessToken });
        }
    );
};

const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    let foundUser = null;

    for (const role of ROLES) {
        const User = require('../models/' + role);
        const user = await User.findOne({ refreshToken }).exec();

        if (user) {
            foundUser = user;
            break;
        }
    }

    if (foundUser) {
        foundUser.refreshToken = foundUser.refreshToken.filter(
            rt => rt !== refreshToken
        );
        await foundUser.save();
    }

    res.clearCookie('jwt', cookieOptions);

    return res.sendStatus(204);
};

const putUsername = async (req, res, next) => {
    const { id, role } = req;
    const { newUsername } = req.body;

    if (!newUsername || !role) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        const User = require('../models/' + role);

        const duplicate = await User.findOne({ username: newUsername }).exec();
        if (duplicate) {
            return res.status(409).json({ message: 'Username taken' });
        }

        const user = await User.findById(id).exec();
        if (!user) return res.sendStatus(403);

        user.username = newUsername;
        await user.save();

        res.json({ success: 'Username updated' });

    } catch (err) {
        next(err);
    }
};

const putPassword = async (req, res, next) => {
    const { id, role } = req;
    const { prevPassword, newPassword } = req.body;

    if (!prevPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const User = require('../models/' + role);

        const user = await User.findById(id).exec();
        if (!user) return res.sendStatus(403);

        const match = await bcrypt.compare(prevPassword, user.password);
        if (!match) return res.status(401).json({ message: 'Wrong password' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: 'Password updated' });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleRegister,
    handleLogin,
    handleRefreshToken,
    handleLogout,
    putUsername,
    putPassword
};