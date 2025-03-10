import Package from '../models/Packge.js'; // Ensure the model name is correct
import multer from 'multer';
import path from 'path';
import Guide from '../models/guideModel.js'; // Import Guide model

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads/' exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).fields([
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'itineraryImages', maxCount: 50 }, // Adjust maxCount as needed (more images per day)
]);

export const createPackage = (req, res) => {
  upload(req, res, async (err) => {
    // Handle Multer errors first
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field. Ensure the field names are correct.', error: err });
      }
      return res.status(400).json({ message: 'File upload error', error: err });
    } else if (err) {
      return res.status(500).json({ message: 'Unknown error occurred during file upload', error: err });
    }

    console.log('Files:', req.files); // Debugging log
    console.log('Body:', req.body); // Debugging log

    try {
      // Extract request body
      const { tripTitle, duration, itinerary, hotelOption, includedThings, hotelPrices, guideId } = req.body;

      // Validate required fields
      if (!tripTitle || !duration || !itinerary || !includedThings || !hotelPrices || !guideId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const coverPhoto = req.files.coverPhoto ? req.files.coverPhoto[0].path : null; // Store cover photo path

      // Parse itinerary and handle images for each day
      const parsedItinerary = JSON.parse(itinerary).map((day, index) => {
        // Find the images associated with this day
        const dayImages = req.files.itineraryImages
          ? req.files.itineraryImages.filter((file, i) => i >= index * 2 && i < (index + 1) * 2).map(file => file.path)
          : [];
        
        return { ...day, images: dayImages };
      });

      // Check if the guide exists
      const guide = await Guide.findOne({ guideId });
      if (!guide) {
        return res.status(404).json({ message: 'Guide not found' });
      }

      // Create new package instance
      const newPackage = new Package({
        tripTitle,
        duration,
        itinerary: parsedItinerary,
        hotelOption, 
        includedThings: JSON.parse(includedThings),
        hotelPrices: JSON.parse(hotelPrices),
        coverPhoto,
        guideId, 
      });

      // Save the new package to the database
      await newPackage.save();
      res.status(201).json({ message: 'Package created successfully', package: newPackage });

    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

export const updateGuide = async (req, res) => {
  const { guideId, yearsOfExperience, languages, profilePicture } = req.body;

  if (!guideId || !yearsOfExperience || !languages || !profilePicture) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingGuide = await Guide.findOne({ guideId });
    if (!existingGuide) {
      return res.status(400).json({ message: 'Guide ID does not exist' });
    }

    await Guide.findOneAndUpdate(
      { guideId },
      { yearsOfExperience, languages, profilePicture }
    );

    res.status(200).json({ message: 'Guide registration step 2 completed successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPackagesByGuideId = async (req, res) => {
  const { guideId } = req.params;

  try {
    const packages = await Package.find({ guideId }); // Fetch packages by guideId
    res.status(200).json(packages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPackageById = async (req, res) => {
  const { id } = req.params; // Get the id from the request parameters

  try {
    const pkg = await Package.findById(id); // Fetch package by MongoDB _id
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.status(200).json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
