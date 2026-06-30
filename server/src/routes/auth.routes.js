import { Router } from 'express';
import { register, login, logout, refresh, getProfile } from '../controllers/auth.controller.js';
import { registerValidation, loginValidation, refreshValidation } from '../validators/auth.validator.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { auditAction } from '../middlewares/audit.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane.doe@enterprise.com"
 *         password:
 *           type: string
 *           example: "StrongPassword123!"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "jane.doe@enterprise.com"
 *         password:
 *           type: string
 *           example: "StrongPassword123!"
 *         deviceId:
 *           type: string
 *           example: "device-xyz123"
 *
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 */
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  auditAction('auth.register', 'User'),
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user & get tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  auditAction('auth.login', 'User'),
  login
);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate via Google
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful
 */
import { googleLogin } from '../controllers/auth.controller.js';
import { googleLoginValidation } from '../validators/auth.validator.js';

router.post(
  '/google',
  authLimiter,
  googleLoginValidation,
  validate,
  auditAction('auth.google', 'User'),
  googleLogin
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  '/logout',
  auditAction('auth.logout', 'User'),
  logout
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post(
  '/refresh',
  refreshValidation,
  validate,
  auditAction('auth.refresh', 'User'),
  refresh
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get(
  '/me',
  authenticate,
  getProfile
);

export default router;
