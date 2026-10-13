import mongoose from 'mongoose';

const conceptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Concept name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Concept slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    shortDescription: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    coverImage: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'personal'
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
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

export const Concept = mongoose.model('Concept', conceptSchema);
