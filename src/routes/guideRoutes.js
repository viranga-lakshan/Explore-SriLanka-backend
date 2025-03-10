import express from 'express';
import { getGuides, registerGuideStep1, registerGuideStep2, loginGuide, getGuideProfile, getGuideById } from '../controllers/guideController.js';
import { verifyToken } from '../config/auth.js';

const router = express.Router();

router.post('/register/step1', registerGuideStep1);
router.post('/register/step2', registerGuideStep2);
router.get('/guides', getGuides);
router.post('/login', loginGuide);
router.get('/me', verifyToken, getGuideProfile);
router.get('/:guideId', getGuideById);

export default router;