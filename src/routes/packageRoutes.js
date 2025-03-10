import express from 'express';
import { createPackage, getPackagesByGuideId, getPackageById } from '../controllers/packageController.js';

const router = express.Router();

router.post('/create', createPackage);
router.get('/guide/:guideId', getPackagesByGuideId);
router.get('/package/:id', getPackageById);

export default router;