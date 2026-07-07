import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import fs from 'fs';
import path from 'path';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, profile, avatar } = req.body;
  const user = req.user;

  if (name) {
    user.fullName = name;
  }
  if (profile) {
    user.profile = {
      title: profile.title || '',
      bio: profile.bio || '',
    };
    user.bio = profile.bio || '';
  }
  if (avatar !== undefined) {
    if (avatar && avatar.startsWith('data:image/')) {
      const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        let extension = 'png';
        if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
        else if (mimeType.includes('gif')) extension = 'gif';
        else if (mimeType.includes('webp')) extension = 'webp';
        
        const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
        const uploadDir = path.join(path.resolve(), 'uploads');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        
        // Remove previous local avatar if it exists
        if (user.avatar && user.avatar.startsWith('uploads/')) {
          const oldPath = path.join(path.resolve(), user.avatar);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (err) {
              console.error('Failed to delete old avatar:', err);
            }
          }
        }
        
        user.avatar = `uploads/${filename}`;
      }
    } else if (avatar === '') {
      if (user.avatar && user.avatar.startsWith('uploads/')) {
        const oldPath = path.join(path.resolve(), user.avatar);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error('Failed to delete old avatar:', err);
          }
        }
      }
      user.avatar = '';
    } else {
      user.avatar = avatar;
    }
  }

  await user.save();

  // Populate role check as in getProfile / login
  const populatedUser = await user.populate('role');

  const userData = {
    _id: populatedUser._id,
    uuid: populatedUser.uuid,
    fullName: populatedUser.fullName,
    username: populatedUser.username,
    email: populatedUser.email,
    avatar: populatedUser.avatar,
    profile: populatedUser.profile || { title: '', bio: '' },
    role: populatedUser.role?.name || 'Registered User',
    permissions: req.userPermissions,
    spurtiPoints: populatedUser.spurtiPoints || 0,
    spurtiPointsSyncedAt: populatedUser.spurtiPointsSyncedAt || null,
  };

  res.status(200).json(ApiResponse.success(userData, 'Profile updated successfully'));
});
