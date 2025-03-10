import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import hotelManagerRoutes from './routes/hotelManagerRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import fs from 'fs';
import path from 'path';
import errorHandler from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser'; // Import cookie-parser

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// Enable security headers
app.use(helmet());

// Enable CORS for specific origin
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable compression
app.use(compression());

// Add JSON body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie-parser middleware
app.use(cookieParser());

// Get the current directory
const __dirname = path.resolve();  // Correcting path here

// Ensure the uploads directory exists
const uploadsDir = path.resolve(__dirname, 'uploads');  // Ensure this is correctly constructed

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
} else {
    console.log('Uploads directory already exists');
}

// Serve static files from the uploads directory with CORS enabled
app.use('/uploads', cors(), express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/hotel-managers', hotelManagerRoutes);
app.use('/api/packages', packageRoutes);

// Use the error handling middleware
app.use(errorHandler);

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; object-src 'none';");
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});