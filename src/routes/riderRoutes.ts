import express from 'express';
import {
  getAllRiders,
  getRiderById,
  createRider,
  updateRider,
  deleteRider
} from '../controllers/riderController';

const router = express.Router();

// GET /v1/riders - Get all riders
router.get('/', getAllRiders);

// GET /v1/riders/:id - Get single rider
router.get('/:id', getRiderById);

// POST /v1/riders - Create new rider
router.post('/', createRider);

// PUT /v1/riders/:id - Update rider
router.put('/:id', updateRider);

// DELETE /v1/riders/:id - Delete rider
router.delete('/:id', deleteRider);

export default router;

