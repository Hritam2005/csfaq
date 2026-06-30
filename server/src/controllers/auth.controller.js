import asyncHandler from '../utils/asyncHandler.js';
import AuthService from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import Role from '../models/Role.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * Cookie options for secure JWT storage
 */
const cookieOptions = {
  httpOnly: true, // Prevents XSS attacks
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 mins
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  // Find default role for new users
  let defaultRole = await Role.findOne({ name: 'Registered User' });
  if (!defaultRole) {
    defaultRole = await Role.create({
      name: 'Registered User',
      description: 'Default role for newly registered users',
      isSystem: true,
      isActive: true,
    });
  }

  const { name, email, password } = req.body;
  const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

  const userData = {
    fullName: name,
    username,
    email,
    password,
    role: defaultRole._id,
    accountStatus: 'active', // Automatically active for now, pending email verification
  };

  const user = await AuthService.register(userData);

  res.status(201).json(
    ApiResponse.success({ userId: user._id, email: user.email }, 'Registration successful. Please check your email to verify your account.')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, deviceId, deviceName, browser, os } = req.body;
  const ipAddress = req.ip;

  const deviceInfo = { deviceId, deviceName, browser, os };
  
  const { user, tokens } = await AuthService.login(email, password, deviceInfo, ipAddress);

  // Set cookies
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  const userData = {
    _id: user._id,
    uuid: user.uuid,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role.name,
  };

  res.status(200).json(ApiResponse.success({ user: userData, token: tokens.accessToken }, 'Login successful'));
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { email, name, deviceId, deviceName, browser, os } = req.body;
  const ipAddress = req.ip;

  const deviceInfo = { deviceId, deviceName, browser, os };
  
  const { user, tokens } = await AuthService.googleLogin(email, name, deviceInfo, ipAddress);

  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  const userData = {
    _id: user._id,
    uuid: user.uuid,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role ? user.role.name : 'Registered User',
  };

  res.status(200).json(ApiResponse.success({ user: userData, token: tokens.accessToken }, 'Google Login successful'));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (refreshToken) {
    await AuthService.logout(refreshToken);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

export const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  const { deviceId } = req.body;

  if (!oldRefreshToken) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  const tokens = await AuthService.refreshToken(oldRefreshToken, deviceId);

  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(200).json(ApiResponse.success({ accessToken: tokens.accessToken }, 'Token refreshed successfully'));
});

export const getProfile = asyncHandler(async (req, res) => {
  // req.user is populated by auth middleware
  const userData = {
    _id: req.user._id,
    uuid: req.user.uuid,
    fullName: req.user.fullName,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role.name,
    permissions: req.userPermissions,
  };
  res.status(200).json(ApiResponse.success(userData, 'Profile retrieved'));
});
