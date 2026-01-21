import express from 'express';
import * as authController from '../controllers/authController.js';

const router = new express.Router();

// Login oldal es post
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

// Kijelentkezes
router.post('/logout', authController.logout);

// Regisztracio
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);

export default router;
