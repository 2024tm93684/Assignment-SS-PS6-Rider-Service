import { Request, Response } from 'express';
import { Rider } from '../models';
import { RiderInput } from '../types/rider';

/**
 * Get all riders
 * GET /v1/riders
 */
export const getAllRiders = async (req: Request, res: Response): Promise<void> => {
  try {
    const riders = await Rider.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: riders.length,
      data: riders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching riders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get single rider by ID
 * GET /v1/riders/:id
 */
export const getRiderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const rider = await Rider.findById(req.params.id);
    
    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: rider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rider',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create new rider
 * POST /v1/riders
 */
export const createRider = async (req: Request, res: Response): Promise<void> => {
  try {
    const riderData: RiderInput = req.body;
    
    // Check if email already exists
    const existingEmail = await Rider.findOne({ email: riderData.email });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
      return;
    }

    // Check if phone already exists
    const existingPhone = await Rider.findOne({ phone: riderData.phone });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
      return;
    }

    const rider = await Rider.create(riderData);
    
    res.status(201).json({
      success: true,
      data: rider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating rider',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update rider by ID
 * PUT /v1/riders/:id
 */
export const updateRider = async (req: Request, res: Response): Promise<void> => {
  try {
    const riderData: Partial<RiderInput> = req.body;
    
    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      riderData,
      { new: true, runValidators: true }
    );

    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: rider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating rider',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete rider by ID
 * DELETE /v1/riders/:id
 */
export const deleteRider = async (req: Request, res: Response): Promise<void> => {
  try {
    const rider = await Rider.findByIdAndDelete(req.params.id);

    if (!rider) {
      res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Rider deleted successfully',
      data: rider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting rider',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

