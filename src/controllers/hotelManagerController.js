import HotelManager from '../models/hotelManagerModel.js';
import bcrypt from 'bcryptjs';

export const registerHotelManager = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newHotelManager = new HotelManager({ name, email, password: hashedPassword });
        await newHotelManager.save();
        res.status(201).json({ message: 'Hotel Manager registered successfully', hotelManager: newHotelManager });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getHotelManagers = async (req, res) => {
    try {
        const hotelManagers = await HotelManager.find();
        res.status(200).json(hotelManagers);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 