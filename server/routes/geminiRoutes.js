import express from 'express';
import { generateMilestones, generateJobDetails } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/milestones', generateMilestones);
router.post('/job-details', generateJobDetails);

export default router;
