import UserRepository from '../repositories/user.repository.js';
import JWTService from './jwt.service.js';
import EmailService from './email.service.js';
import ApiError from '../utils/ApiError.js';
import VerificationToken from '../models/VerificationToken.js';
import Device from '../models/Device.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    // Check if email or username exists
    const existingEmail = await UserRepository.findByEmail(userData.email);
    if (existingEmail) throw ApiError.conflict('Email is already registered');

    const existingUsername = await UserRepository.findByUsername(userData.username);
    if (existingUsername) throw ApiError.conflict('Username is already taken');

    // Create user (role should be assigned to default "Registered User" ID by controller before passing here)
    const user = await UserRepository.create(userData);

    // Generate Verification Token
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      user: user._id,
      token,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send email async
    EmailService.sendVerificationEmail(user.email, token);

    return user;
  }

  /**
   * Authenticate user and issue tokens
   */
  static async login(email, password, deviceInfo, ipAddress) {
    const user = await UserRepository.findByEmail(email, true);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.accountStatus === 'locked') {
      if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        throw ApiError.forbidden(`Account is locked. Try again after ${user.accountLockedUntil}`);
      } else {
        // Lock expired
        user.accountStatus = 'active';
      }
    }

    if (user.accountStatus !== 'active') {
      throw ApiError.forbidden(`Account is ${user.accountStatus}`);
    }

    // Verify Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await UserRepository.incrementFailedLogins(user._id);
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Success! Reset failed logins
    await UserRepository.resetFailedLogins(user._id);

    // Register Device if new
    let device = await Device.findOne({ user: user._id, deviceId: deviceInfo.deviceId });
    if (!device) {
      device = await Device.create({
        user: user._id,
        ...deviceInfo,
        ipAddress,
      });
      // Alert user of new login location
      EmailService.sendSecurityAlert(user.email, `New login from ${deviceInfo.browser} on ${deviceInfo.os}. IP: ${ipAddress}`);
    } else {
      device.lastActive = new Date();
      device.ipAddress = ipAddress;
      await device.save();
    }

    // Issue JWTs
    const tokens = await JWTService.issueTokens(user, device._id);

    return { user, tokens };
  }

  /**
   * Authenticate or register via Google
   */
  static async googleLogin(email, name, deviceInfo, ipAddress) {
    let user = await UserRepository.findByEmail(email, true);

    if (!user) {
      let defaultRole = await Role.findOne({ name: 'Registered User' });
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      user = await UserRepository.create({
        fullName: name || username,
        username,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        role: defaultRole ? defaultRole._id : undefined,
        accountStatus: 'active',
      });
    }

    if (user.accountStatus !== 'active') {
      throw ApiError.forbidden(`Account is ${user.accountStatus}`);
    }

    let device = await Device.findOne({ user: user._id, deviceId: deviceInfo.deviceId });
    if (!device) {
      device = await Device.create({
        user: user._id,
        ...deviceInfo,
        ipAddress,
      });
      EmailService.sendSecurityAlert(user.email, `New Google login from ${deviceInfo.browser} on ${deviceInfo.os}. IP: ${ipAddress}`);
    } else {
      device.lastActive = new Date();
      device.ipAddress = ipAddress;
      await device.save();
    }

    const tokens = await JWTService.issueTokens(user, device._id);
    return { user, tokens };
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(refreshTokenString) {
    await JWTService.revokeToken(refreshTokenString);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(oldRefreshTokenString, deviceId) {
    return await JWTService.rotateRefreshToken(oldRefreshTokenString, deviceId);
  }
}

export default AuthService;
