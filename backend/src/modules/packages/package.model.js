import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: [true, 'Concept ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      min: [0, 'Price must be non-negative'],
      default: null
    },
    includedItems: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
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

export const Package = mongoose.model('Package', packageSchema);
