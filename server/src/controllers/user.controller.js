import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

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
    user.avatar = avatar;
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
