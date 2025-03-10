import mongoose from 'mongoose';

const hotelManagerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const HotelManager = mongoose.model('HotelManager', hotelManagerSchema);
export default HotelManager; 