const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// console.log("In handle signup")
const handleSignup = async (req, res, next) => {
    console.log("In handle signup")
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ 'message': 'Bad request - Username, Password and role are required' });
    if (password.length < 8) return res.status(400).json({ 'message': 'password must have minimun length of 8 characters' });
    if (!['student', 'college', 'recruiter'].includes(role)) return res.status(400).json({ 'message': 'invalid role' });

    const User = require('../models/' + role);
    const duplicateUser = await User.findOne({ username }).exec();
    if (duplicateUser) return res.status(409).json({ 'message': 'Conflict - User already exists!' });

    const regexUser = /^[A-Za-z][A-Za-z_0-9]{7,30}$/g;
    const validUser = regexUser.test(username);
    if (!validUser) return res.status(406).json({ 'message': 'Not acceptable - Username should contain only alphabets or numbers or underscore and minimun 8 characters required' });

    const pwdhash = await bcrypt.hash(password, 10);

    try {
        const query = await User.create({
            username,
            password: pwdhash
        });

        res.status(201).json({ 'success': `${role} created` });
    }
    catch (err) {
        next(err);
    }
}

const handleLogin = async (req, res, next) => {
    console.log("In handle login")
    const cookies = req.cookies;
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ 'message': 'Bad request - Username, Password and role are required' });
    if (!['student', 'college', 'recruiter', 'admin'].includes(role)) return res.status(400).json({ 'message': 'invalid role' });

    const User = require('../models/' + role);
    const foundUser = await User.findOne({ username }).exec();
    if (!foundUser) return res.status(401).json({ 'message': 'unauthorized' });

    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        const accessToken = jwt.sign(
            {
                'userInfo': {
                    'id': foundUser._id,
                    'username': foundUser.username,
                    'role': foundUser.role
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
            { 'username': foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );

        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter(rt => rt !== cookies.jwt);

        if (cookies?.jwt) {

            const refreshToken = cookies.jwt;
            const foundToken = await User.findOne({ refreshToken }).exec();
            if (!foundToken) {
                newRefreshTokenArray = [];
            }

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 });
        }
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const query = await foundUser.save();
        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 });
        res.json({
            'success': `${role} ${username} is logged in hello!`,
            accessToken
        });
    } else {
        res.status(401).json({ 'message': 'unauthorized' });
    }
}

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    const { role } = req.params;
    if (!role) return res.status(400).json({ 'message': 'Bad request - role is required' });
    if (!['student', 'college', 'recruiter', 'admin'].includes(role)) return res.status(400).json({ 'message': 'invalid role' });
    if (!cookies?.jwt) return res.status(401).json({ 'message': 'Bad request' });

    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 });

    const User = require('../models/' + role);
    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.status(403).json({ 'message': 'Forbidden' });
                const hackedUser = await User.findOne({ username: decoded.username }).exec();
                hackedUser.refreshToken = [];
                const query = await hackedUser.save();
            }
        )
        return res.status(403).json({ 'message': 'Forbidden' });
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                foundUser.refreshToken = [...newRefreshTokenArray];
                const query = await foundUser.save()
            }
            if (err || foundUser.username !== decoded.username) return res.status(403).json({ 'message': 'Forbidden' });
            const accessToken = jwt.sign(
                {
                    'userInfo': {
                        'id': foundUser._id,
                        'username': foundUser.username,
                        'role': role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { 'username': foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const query = await foundUser.save();

            res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 }); //put secure:true

            res.json({ accessToken });
        }
    );
}

const handleLogout = async (req, res) => {
    console.log("in logout")
    const { role } = req.body;
    if (!role) return res.status(400).json({ 'message': 'Bad request - role is required' });
    if (!['student', 'college', 'recruiter', 'admin'].includes(role)) return res.status(400).json({ 'message': 'invalid role' });

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204).json({ 'message': 'No content' });

    const refreshToken = cookies.jwt;
    const User = require('../models/' + role);
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 });//put secure:true
        return res.status(204).json({ 'message': 'No content' });
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);;
    const query = await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', maxAge: 24 * 60 * 60 * 1000 }); //put secure:true
    res.status(204).json({ 'message': 'No content' });
}

const putUsername = async (req, res, next) => {
    const { id, role } = req;
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ 'message': 'All fields required' });
    if (!role) return res.status(400).json({ 'message': 'Bad request - role is required' });
    try {
        const User = require('../models/' + role);
        const foundUser = await User.findById(id).exec();
        if (!foundUser) return res.status(400).json({ 'message': 'unauthorized' });

        const duplicateUser = await User.findOne({ username: newUsername }).exec();
        if (duplicateUser) return res.status(409).json({ 'message': 'Conflict - Username taken!' });

        foundUser.username = newUsername;
        await foundUser.save();

        res.json({ 'success': 'Username updated' });
    }
    catch (err) {
        next(err);
    }
}

const putPassword = async (req, res, next) => {
    const { id, role } = req;
    const { prevPassword, newPassword } = req.body;
    if (!newPassword || !prevPassword) return res.status(400).json({ 'message': 'All fields required' });
    if (!role) return res.status(400).json({ 'message': 'Bad request - role is required' });
    try {
        const User = require('../models/' + role);
        const foundUser = await User.findById(id).exec();
        if (!foundUser) return res.status(400).json({ 'message': 'unauthorized' });

        const match = await bcrypt.compare(prevPassword, foundUser.password);
        if (match) {
            const pwdhash = await bcrypt.hash(newPassword, 10);

            foundUser.password = pwdhash;
            await foundUser.save();
        }
        else {
            res.status(401).json({ 'message': 'unauthorized' });
        }

        res.json({ 'success': 'Password updated' });
    }
    catch (err) {
        next(err);
    }
}

module.exports = {
    handleLogin,
    handleSignup,
    handleRefreshToken,
    handleLogout,
    putUsername,
    putPassword
};