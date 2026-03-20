import express from 'express';
import * as authController from '../controllers/authController.js';

const router = new express.Router();

// Render login page and handle login post request
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

// Handle logout request
router.post('/logout', authController.logout);

// Render register page and handle registration post request
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);

export default router;