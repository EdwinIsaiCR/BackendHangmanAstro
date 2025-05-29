const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rutas para login
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/forgot', authController.forgot);

module.exports = router;
