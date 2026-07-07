import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';
import path from 'path';
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
  const { email, password, deviceId, deviceName, browser, os, loginType } = req.body;
  const ipAddress = req.ip;

  const deviceInfo = { deviceId, deviceName, browser, os };
  
  const { user, tokens } = await AuthService.login(email, password, deviceInfo, ipAddress);

  const roleName = user.role?.name?.toLowerCase() || '';
  const isAdmin = roleName.includes('admin');
  
  if (loginType === 'admin' && !isAdmin) {
    throw ApiError.forbidden('Access denied. Admin credentials required.');
  }
  if (loginType === 'user' && isAdmin) {
    throw ApiError.forbidden('Please use the Admin Sign In portal.');
  }

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
    role: user.role?.name || 'Registered User',
    permissions: user.role?.permissions?.map(p => p.name || p) || [],
    spurtiPoints: user.spurtiPoints || 0,
    spurtiPointsSyncedAt: user.spurtiPointsSyncedAt || null,
  };

  res.status(200).json(ApiResponse.success({ user: userData, token: tokens.accessToken }, 'Login successful'));
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { token, credential, email, name, deviceId, deviceName, browser, os, loginType, action } = req.body;
  const ipAddress = req.ip;

  if (loginType === 'admin') {
    throw ApiError.forbidden('Google authentication is disabled for Admin accounts. Please use email and password to sign in to the Admin portal.');
  }

  const deviceInfo = { deviceId, deviceName, browser, os };
  
  const { user, tokens } = await AuthService.googleLogin(token || credential, email, name, deviceInfo, ipAddress, action);

  const roleName = user.role?.name?.toLowerCase() || '';
  const isAdmin = roleName.includes('admin');
  
  if (isAdmin) {
    throw ApiError.forbidden('Google authentication is disabled for Admin accounts. Please use email and password to sign in to the Admin portal.');
  }

  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  const userData = {
    _id: user._id,
    uuid: user.uuid,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role?.name || 'Registered User',
    permissions: user.role?.permissions?.map(p => p.name || p) || [],
    spurtiPoints: user.spurtiPoints || 0,
    spurtiPointsSyncedAt: user.spurtiPointsSyncedAt || null,
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
    role: req.user.role?.name || 'Registered User',
    permissions: req.userPermissions,
    spurtiPoints: req.user.spurtiPoints || 0,
    spurtiPointsSyncedAt: req.user.spurtiPointsSyncedAt || null,
  };
  res.status(200).json(ApiResponse.success(userData, 'Profile retrieved'));
});

export const dropOutInternship = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.isDeleted = true;
    req.user.deletedAt = new Date();
    await req.user.save();
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json(ApiResponse.success(null, 'Successfully dropped out from internship. Account deleted.'));
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const filename = req.file.filename;
  const dbPath = `uploads/${filename}`;

  if (req.user.avatar) {
    const prevPath = path.join(process.cwd(), req.user.avatar);
    if (fs.existsSync(prevPath)) {
      try {
        fs.unlinkSync(prevPath);
      } catch (err) {
        console.error('Failed to unlink previous avatar', err);
      }
    }
  }

  req.user.avatar = dbPath;
  await req.user.save();

  const userData = {
    _id: req.user._id,
    uuid: req.user.uuid,
    fullName: req.user.fullName,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role?.name || 'Registered User',
    permissions: req.userPermissions,
    spurtiPoints: req.user.spurtiPoints || 0,
    spurtiPointsSyncedAt: req.user.spurtiPointsSyncedAt || null,
  };

  res.status(200).json(ApiResponse.success(userData, 'Profile picture updated'));
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  if (req.user.avatar) {
    const prevPath = path.join(process.cwd(), req.user.avatar);
    if (fs.existsSync(prevPath)) {
      try {
        fs.unlinkSync(prevPath);
      } catch (err) {
        console.error('Failed to unlink deleted avatar', err);
      }
    }
  }

  req.user.avatar = '';
  await req.user.save();

  const userData = {
    _id: req.user._id,
    uuid: req.user.uuid,
    fullName: req.user.fullName,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    role: req.user.role?.name || 'Registered User',
    permissions: req.userPermissions,
    spurtiPoints: req.user.spurtiPoints || 0,
    spurtiPointsSyncedAt: req.user.spurtiPointsSyncedAt || null,
  };

  res.status(200).json(ApiResponse.success(userData, 'Profile picture removed'));
});
