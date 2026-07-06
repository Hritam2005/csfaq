import UserRepository from '../repositories/user.repository.js';
import JWTService from './jwt.service.js';
import EmailService from './email.service.js';
import ApiError from '../utils/ApiError.js';
import VerificationToken from '../models/VerificationToken.js';
import Device from '../models/Device.js';
import Role from '../models/Role.js';
import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  findTriageUserByEmail,
  verifyTriagePassword,
  triageRoleToMainRoleName,
} from '../utils/triageUserLookup.js';

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
   * Ensure a Role document exists with the given name and return it.
   * Used when auto-provisioning a user that was authenticated via the
   * query-triage microservice.
   */
  static async ensureRoleByName(roleName) {
    let role = await Role.findOne({ name: roleName });
    if (!role) {
      role = await Role.create({
        name: roleName,
        description: `Auto-created ${roleName} role for cross-DB login`,
        isSystem: true,
        isActive: true,
      });
    }
    return role;
  }

  /**
   * Auto-provision a "mirror" user in the main server's users collection
   * based on a record from the query-triage microservice database. The
   * resulting user is active, has a unique username derived from the
   * email, and reuses the same ObjectId so JWTs stay stable.
   *
   * Returns the freshly-created user (already populated with its role).
   */
  static async provisionFromTriage(triageUser) {
    if (!triageUser || !triageUser.email) {
      throw ApiError.unauthorized('Invalid triage user payload');
    }

    const email = String(triageUser.email).toLowerCase();
    const triageRoleName = triageRoleToMainRoleName(triageUser.role);
    const role = await this.ensureRoleByName(triageRoleName);

    // Reuse the triage ObjectId so that the JWT issued by this endpoint
    // is also valid against the triage microservice (which stores the
    // same userId on its query cases).
    const userId = triageUser._id
      ? triageUser._id
      : new (await import('mongoose')).default.Types.ObjectId();

    // Pick a non-colliding username. The triage collection doesn't store
    // one, so we derive it from the local-part of the email and append
    // a short hash if there's a conflict.
    let baseUsername = email.split('@')[0].replace(/[^a-z0-9._-]/gi, '').toLowerCase();
    if (!baseUsername) baseUsername = 'user';
    let username = baseUsername;
    let suffix = 0;
    // Tight loop: there should be at most a handful of collisions in practice
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await UserRepository.findByUsername(username);
      if (!existing) break;
      suffix += 1;
      username = `${baseUsername}${suffix}`;
      if (suffix > 50) {
        username = `${baseUsername}-${Date.now().toString(36)}`;
        break;
      }
    }

    // Insert directly via the driver to bypass the User schema's pre-save
    // hook – the triage DB already stores a valid bcrypt hash and we
    // don't want it re-hashed (which would lock the user out).
    await User.collection.insertOne({
      _id: userId,
      uuid: crypto.randomUUID ? crypto.randomUUID() : undefined,
      fullName: triageUser.name || baseUsername,
      username,
      email,
      password: triageUser.password,
      role: role._id,
      accountStatus: triageUser.isActive === false ? 'inactive' : 'active',
      emailVerified: true,
      phoneVerified: false,
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLogin: null,
      lastActivity: null,
      isDeleted: false,
      passwordHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Re-fetch with populated role so the caller can build the JWT payload.
    return await UserRepository.findByEmail(email, true);
  }

  /**
   * Authenticate user and issue tokens.
   *
   * If the user is not present in the main server's database, we also
   * try the query-triage microservice database. If a matching record is
   * found there AND the password matches its bcrypt hash, we
   * auto-provision a mirror user in the main DB and continue with the
   * normal token-issuing flow.
   */
  static async login(email, password, deviceInfo, ipAddress) {
    let user = await UserRepository.findByEmail(email, true);

    // ---- Cross-DB fallback (query-triage microservice) -----------------
    if (!user) {
      const triageUser = await findTriageUserByEmail(email);
      if (triageUser) {
        const passwordOk = await verifyTriagePassword(triageUser, password);
        if (!passwordOk) {
          throw ApiError.unauthorized('Invalid email or password');
        }
        // Auto-provision a mirror user in the main DB so future requests
        // (which only look at csfaq_main.users) still work.
        user = await this.provisionFromTriage(triageUser);
      }
    }

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
      // First check if the user already exists in the triage DB. If so,
      // adopt their profile (avatar/role) instead of creating a generic
      // "Registered User".
      const triageUser = await findTriageUserByEmail(email);
      if (triageUser) {
        user = await this.provisionFromTriage(triageUser);
      }
    }

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