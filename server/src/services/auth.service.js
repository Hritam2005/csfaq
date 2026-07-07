import UserRepository from '../repositories/user.repository.js';
import JWTService from './jwt.service.js';
import EmailService from './email.service.js';
import ApiError from '../utils/ApiError.js';
import VerificationToken from '../models/VerificationToken.js';
import { SamagamaService } from '../modules/samagama/Samagama.service.js';
import Device from '../models/Device.js';
import Role from '../models/Role.js';
import Redemption from '../models/Redemption.js';
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

    // Try to sync Spurti points using raw credentials if not already custom synced
    if (!user.spurtiPointsSyncedAt) {
      try {
        const syncResult = await SamagamaService.getSpurtiPoints(email, password);
        const unusedRedemptions = await Redemption.find({ user: user._id, used: false });
        const unusedCost = unusedRedemptions.reduce((total, r) => total + r.cost, 0);
        user.spurtiPoints = Math.max(0, syncResult.points - unusedCost);
        user.spurtiPointsSyncedAt = syncResult.syncedAt;
        await user.save();
      } catch (err) {
        console.warn(`Could not auto-sync Samagama points for user ${email}: ${err.message}`);
      }
    }

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

    const populatedUser = await UserRepository.findById(user._id);
    return { user: populatedUser || user, tokens };
  }

  /**
   * Authenticate or register via Google
   */
  static async googleLogin(token, fallbackEmail, fallbackName, deviceInfo, ipAddress, action) {
    let email = fallbackEmail;
    let name = fallbackName;
    let avatar = undefined;

    // Verify token against Google's official OAuth2 endpoints if token was provided
    if (token && typeof token === 'string') {
      try {
        // Try verifying as OAuth2 access_token first
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          email = data.email || email;
          name = fallbackName || data.name || data.given_name || name || email?.split('@')[0];
          avatar = data.picture;
        } else {
          // Fallback to tokeninfo endpoint if an id_token (credential) was provided
          const idRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
          if (idRes.ok) {
            const idData = await idRes.json();
            email = idData.email || email;
            name = fallbackName || idData.name || idData.given_name || name || email?.split('@')[0];
            avatar = idData.picture;
          } else if (!email) {
            throw ApiError.unauthorized('Invalid Google authentication token');
          }
        }
      } catch (err) {
        if (!email) {
          throw ApiError.unauthorized('Could not verify Google token: ' + err.message);
        }
      }
    }

    if (!email) {
      throw ApiError.unauthorized('No verified Google email address found');
    }

    let user = await UserRepository.findByEmail(email, true);

    if (user && user.role?.name?.toLowerCase().includes('admin')) {
      throw ApiError.forbidden('Google authentication is disabled for Admin accounts. Please use email and password to sign in to the Admin portal.');
    }

    if (user && action === 'register') {
      throw ApiError.badRequest('An account associated with this Google email already exists. Please sign in instead.');
    }

    if (!user && action === 'login') {
      throw ApiError.notFound('No account found associated with this Google email. Please create an account first.');
    }

    if (!user) {
      let defaultRole = await Role.findOne({ name: 'Registered User' });
      if (!defaultRole) {
        defaultRole = await Role.create({
          name: 'Registered User',
          description: 'Default role for newly registered users',
          isSystem: true,
          isActive: true,
        });
      }
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      user = await UserRepository.create({
        fullName: name || username,
        username,
        email,
        password: crypto.randomBytes(32).toString('hex'),
        role: defaultRole._id,
        avatar: avatar || undefined,
        accountStatus: 'active',
        emailVerified: true,
      });
    } else {
      let updated = false;
      if (!user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      if (avatar && !user.avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (user.failedLoginAttempts > 0) {
        user.failedLoginAttempts = 0;
        user.accountLockedUntil = null;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    if (user.accountStatus !== 'active') {
      throw ApiError.forbidden(`Account is ${user.accountStatus}`);
    }

    // Update lastLogin and lastActivity timestamps in MongoDB
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    await user.save();

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

    const populatedUser = await UserRepository.findById(user._id);
    return { user: populatedUser || user, tokens };
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
