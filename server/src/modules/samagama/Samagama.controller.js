import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { SamagamaService } from './Samagama.service.js';
import Redemption from '../../models/Redemption.js';

export const syncSpurtiPoints = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Samagama email and password are required.');
  }

  const points = await SamagamaService.getSpurtiPoints(email, password);

  if (req.user) {
    req.user.spurtiPoints = points.points;
    req.user.spurtiPointsSyncedAt = points.syncedAt;
    await req.user.save();
  }

  res.status(200).json(ApiResponse.success(points, 'Samagama Spurti points synced'));
});

export const createRedemption = asyncHandler(async (req, res) => {
  const { title, cost, code } = req.body;
  const userId = req.user._id;

  if (!title || !cost || !code) {
    throw ApiError.badRequest('Title, cost, and code are required.');
  }

  // Deduct points on user document if points exist in db
  const user = req.user;
  if (user && user.spurtiPoints !== undefined && user.spurtiPoints !== null) {
    user.spurtiPoints = Math.max(0, user.spurtiPoints - cost);
    await user.save();
  }

  const redemption = await Redemption.create({
    user: userId,
    title,
    cost,
    code,
    used: false,
  });

  res.status(201).json(ApiResponse.success(redemption, 'Voucher redeemed successfully'));
});

export const getMyRedemptions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const redemptions = await Redemption.find({ user: userId }).sort({ redeemedAt: -1 });
  res.status(200).json(ApiResponse.success(redemptions));
});

export const useRedemption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const redemption = await Redemption.findOne({ _id: id, user: userId });
  if (!redemption) {
    throw ApiError.notFound('Redemption record not found.');
  }

  redemption.used = true;
  await redemption.save();

  res.status(200).json(ApiResponse.success(redemption, 'Voucher marked as used'));
});
