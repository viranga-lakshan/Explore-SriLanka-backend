import express from 'express';
import { registerHotelManager, getHotelManagers } from '../controllers/hotelManagerController.js';

const router = express.Router();

router.post('/register', registerHotelManager);
router.get('/hotel-managers', getHotelManagers);

export default router; 