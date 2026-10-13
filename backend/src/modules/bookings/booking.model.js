import mongoose from 'mongoose';

export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

export const VALID_STATUS_TRANSITIONS = {
  [BOOKING_STATUSES.PENDING]: [BOOKING_STATUSES.CONFIRMED, BOOKING_STATUSES.REJECTED],
  [BOOKING_STATUSES.CONFIRMED]: [BOOKING_STATUSES.COMPLETED, BOOKING_STATUSES.CANCELLED],
  [BOOKING_STATUSES.REJECTED]: [],
  [BOOKING_STATUSES.CANCELLED]: [],
  [BOOKING_STATUSES.COMPLETED]: []
};

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },
    conceptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Concept',
      required: [true, 'Concept ID is required'],
      index: true
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: [true, 'Package ID is required'],
      index: true
    },
    packageNameSnapshot: {
      type: String,
      required: true,
      trim: true
    },
    priceSnapshot: {
      type: Number,
      default: null
    },
    requestedDate: {
      type: String,
      required: [true, 'Requested date is required (YYYY-MM-DD)'],
      trim: true
    },
    requestedTime: {
      type: String,
      required: [true, 'Requested time is required (HH:mm)'],
      trim: true
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUSES),
      default: BOOKING_STATUSES.PENDING,
      index: true
    },
    adminNote: {
      type: String,
      default: '',
      trim: true
    },
    confirmedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
