import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
    guideId: {
        type: String,
        required: true,
        unique: true,
    },
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
    address: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    yearsOfExperience: {
        type: Number,
    },
    languages: {
        type: [String],
    },
    profilePicture: {
        type: String, // URL or path to the uploaded image
    },
    companyDescription: {
        type: String, // New field for company description
    },
}, { timestamps: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;