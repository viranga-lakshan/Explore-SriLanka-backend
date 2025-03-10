import Guide from '../models/guideModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage }); 

export const registerGuideStep1 = async (req, res) => {
    const { guideId, name, email, password, address, contactNumber } = req.body;

    if (!guideId || !name || !email || !password || !address || !contactNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const existingGuide = await Guide.findOne({ guideId });
        if (existingGuide) {
            return res.status(400).json({ message: 'Guide ID already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newGuide = new Guide({
            guideId,
            name,
            email,
            password: hashedPassword,
            address,
            contactNumber,
        });

        const savedGuide = await newGuide.save();

        res.status(201).json({
            message: 'Guide registered successfully',
            guide: {
                guideId: savedGuide.guideId,
                name: savedGuide.name,
                email: savedGuide.email,
                address: savedGuide.address,
                contactNumber: savedGuide.contactNumber,
                _id: savedGuide._id,
                createdAt: savedGuide.createdAt,
                updatedAt: savedGuide.updatedAt,
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const registerGuideStep2 = [
    upload.single('profilePicture'),
    async (req, res) => {
        const { guideId, yearsOfExperience, languages, companyDescription } = req.body;
        const profilePicture = req.file ? req.file.path : null;

        try {
            if (!guideId || !yearsOfExperience || !languages || !profilePicture || !companyDescription) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const guide = await Guide.findOneAndUpdate(
                { guideId },
                { yearsOfExperience, languages: languages.split(',').map(lang => lang.trim()), profilePicture, companyDescription },
                { new: true, upsert: true }
            );

            res.status(200).json({ message: 'Guide registration step 2 completed successfully', guide });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
];

export const getGuides = async (req, res) => {
    try {
        const guides = await Guide.find();
        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginGuide = async (req, res) => {
    const { email, password } = req.body;

    try {
        const guide = await Guide.findOne({ email });
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        const isMatch = await bcrypt.compare(password, guide.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: guide.guideId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set the JWT token and guide ID as cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
        });

        res.cookie('guideId', guide.guideId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error(error); // Log the error to the console
        res.status(500).json({ message: 'Server error' });
    }
};
 
export const getGuideProfile = async (req, res) => {
    try {
        const guide = await Guide.findOne({ guideId: req.user }).select('-password'); // Exclude password from the response
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        // Construct the full URL for the profile picture
        if (guide.profilePicture) {
            guide.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${path.basename(guide.profilePicture)}`;
            console.log('Constructed Profile Picture URL:', guide.profilePicture);
        }
        res.json(guide);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getGuideById = async (req, res) => {
    const { guideId } = req.params;

    try {
        const guide = await Guide.findOne({ guideId }).select('-password'); // Exclude password from the response
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        res.status(200).json(guide);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
