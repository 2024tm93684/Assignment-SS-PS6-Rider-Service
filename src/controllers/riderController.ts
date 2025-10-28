import { Request, Response } from 'express';
import { Rider } from '../models';
import { RiderInput } from '../types/rider';
import { catchAsync } from '../middleware/errorHandler';
import { NotFoundError, ConflictError } from '../utils/AppError';

/**
 * Get all riders
 * GET /v1/riders
 */
export const getAllRiders = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const riders = await Rider.find({}).sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: riders.length,
    data: riders
  });
});

/**
 * Get single rider by ID
 * GET /v1/riders/:id
 */
export const getRiderById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const rider = await Rider.findById(req.params.id);
  
  if (!rider) {
    throw new NotFoundError('Rider not found');
  }

  res.status(200).json({
    success: true,
    data: rider
  });
});

/**
 * Create new rider
 * POST /v1/riders
 */
export const createRider = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const riderData: RiderInput = req.body;
  
  // Check if email already exists
  const existingEmail = await Rider.findOne({ email: riderData.email });
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  // Check if phone already exists
  const existingPhone = await Rider.findOne({ phone: riderData.phone });
  if (existingPhone) {
    throw new ConflictError('Phone number already registered');
  }

  const rider = await Rider.create(riderData);
  
  res.status(201).json({
    success: true,
    data: rider
  });
});

/**
 * Update rider by ID
 * PUT /v1/riders/:id
 */
export const updateRider = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const riderData: Partial<RiderInput> = req.body;
  
  // Check if email is being updated and if it already exists
  if (riderData.email) {
    const existingEmail = await Rider.findOne({ email: riderData.email, _id: { $ne: req.params.id } });
    if (existingEmail) {
      throw new ConflictError('Email already registered to another rider');
    }
  }

  // Check if phone is being updated and if it already exists
  if (riderData.phone) {
    const existingPhone = await Rider.findOne({ phone: riderData.phone, _id: { $ne: req.params.id } });
    if (existingPhone) {
      throw new ConflictError('Phone number already registered to another rider');
    }
  }
  
  const rider = await Rider.findByIdAndUpdate(
    req.params.id,
    riderData,
    { new: true, runValidators: true }
  );

  if (!rider) {
    throw new NotFoundError('Rider not found');
  }

  res.status(200).json({
    success: true,
    data: rider
  });
});

/**
 * Delete rider by ID
 * DELETE /v1/riders/:id
 */
export const deleteRider = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const rider = await Rider.findByIdAndDelete(req.params.id);

  if (!rider) {
    throw new NotFoundError('Rider not found');
  }

  res.status(200).json({
    success: true,
    message: 'Rider deleted successfully',
    data: rider
  });
});
