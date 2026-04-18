const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/register', userController.handleRegister);

router.post('/login', userController.handleLogin);

router.get('/refresh/', userController.handleRefreshToken);

router.post('/logout', userController.handleLogout);

router.put('/username', verifyJWT, userController.putUsername);

router.put('/password', verifyJWT, userController.putPassword);

router.post('/forgot-password', userController.handleForgotPassword);

router.post('/reset-password', userController.handleResetPassword);



module.exports = router;