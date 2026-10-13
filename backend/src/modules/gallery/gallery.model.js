import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      default: null,
      index: true
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      trim: true
    },
    caption: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['PUBLISHED', 'HIDDEN'],
      default: 'PUBLISHED',
      index: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);
