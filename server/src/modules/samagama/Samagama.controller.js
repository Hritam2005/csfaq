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
    // Find all unused redemptions for this user
    const unusedRedemptions = await Redemption.find({ user: req.user._id, used: false });
    const unusedCost = unusedRedemptions.reduce((total, r) => total + r.cost, 0);

    // Subtract unused cost from synced points
    const netPoints = Math.max(0, points.points - unusedCost);

    req.user.spurtiPoints = netPoints;
    req.user.spurtiPointsSyncedAt = points.syncedAt;
    await req.user.save();

    // Align returned points with the net balance
    points.points = netPoints;
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

export const resetSpurtiPoints = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.spurtiPoints = 0;
    req.user.spurtiPointsSyncedAt = new Date();
    await req.user.save();
  }

  await Redemption.deleteMany({ user: req.user._id });

  res.status(200).json(ApiResponse.success(null, 'Samagama Spurti points reset to 0'));
});
