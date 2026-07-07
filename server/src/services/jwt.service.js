import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshTokenString } from '../utils/jwt.util.js';
import ApiError from '../utils/ApiError.js';

class JWTService {
  /**
   * Issue new Access and Refresh tokens
   */
  static async issueTokens(user, deviceId) {
    const accessToken = generateAccessToken(user);
    const refreshTokenString = generateRefreshTokenString();

    // Set expiration for refresh token (e.g., 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save refresh token to DB
    await RefreshToken.create({
      token: refreshTokenString,
      user: user._id,
      device: deviceId,
      expiresAt,
    });

    return { accessToken, refreshToken: refreshTokenString };
  }

  /**
   * Rotate a refresh token
   */
  static async rotateRefreshToken(oldTokenString, deviceId) {
    const oldToken = await RefreshToken.findOne({ token: oldTokenString });

    if (!oldToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (!oldToken.isValid) {
      // Possible token theft detected! Revoke all tokens for this user/device
      await RefreshToken.updateMany(
        { user: oldToken.user, device: deviceId },
        { $set: { revokedAt: new Date() } }
      );
      throw ApiError.unauthorized('Refresh token expired or revoked. Please log in again.');
    }

    // Mark old token as revoked/replaced
    const newTokenString = generateRefreshTokenString();
    oldToken.revokedAt = new Date();
    oldToken.replacedByToken = newTokenString;
    await oldToken.save();

    // Create new token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token: newTokenString,
      user: oldToken.user,
      device: deviceId,
      expiresAt,
    });

    // Fetch the full user so the access token carries roleName/fullName/email
    const User = (await import('../models/User.js')).default;
    const fullUser = await User.findById(oldToken.user).populate('role');
    const accessToken = generateAccessToken(fullUser);

    return { accessToken, refreshToken: newTokenString, userId: oldToken.user };
  }

  /**
   * Revoke a refresh token
   */
  static async revokeToken(tokenString) {
    await RefreshToken.findOneAndUpdate(
      { token: tokenString },
      { $set: { revokedAt: new Date() } }
    );
  }
}

export default JWTService;
