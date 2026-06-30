import User from '../models/User.js';

class UserRepository {
  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async findById(id) {
    return await User.findById(id).populate({
      path: 'role',
      populate: { path: 'permissions' }
    });
  }

  static async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return await query.populate('role');
  }

  static async findByUsername(username) {
    return await User.findOne({ username });
  }

  static async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async softDelete(id, deletedByUserId) {
    return await User.findByIdAndUpdate(id, { 
      isDeleted: true, 
      deletedAt: new Date(),
      updatedBy: deletedByUserId,
      accountStatus: 'inactive'
    });
  }

  static async incrementFailedLogins(id) {
    const user = await User.findById(id);
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.accountStatus = 'locked';
      // Lock for 15 minutes
      user.accountLockedUntil = new Date(Date.now() + 15 * 60000); 
    }
    return await user.save();
  }

  static async resetFailedLogins(id) {
    return await User.findByIdAndUpdate(id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      lastLogin: new Date()
    });
  }
}

export default UserRepository;
