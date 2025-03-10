import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  tripTitle: { type: String, required: true },
  duration: { type: String, required: true },
  itinerary: [
    {
      day: { type: Number, required: true },
      location: { type: String, required: true },
      description: { type: String, required: true },
      images: [{ type: String }], // Array of image paths for each day
    },
  ],
  includedThings: [{ type: String }],
  hotelOption: { type: String, enum: ['withoutHotel', 'withHotel'], default: 'withoutHotel' },
  hotelPrices: {
    threeStar: { type: String },
    fourStar: { type: String },
    fiveStar: { type: String },
  },
  coverPhoto: { type: String }, // Single cover photo for the entire package
  guideId: { type: String, required: true }, // Guide identifier, assuming it is a string
});

const Package = mongoose.model('Package', packageSchema);
export default Package;
