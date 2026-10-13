import { Booking, BOOKING_STATUSES, VALID_STATUS_TRANSITIONS } from './booking.model.js';
import { Concept } from '../concepts/concept.model.js';
import { Package } from '../packages/package.model.js';

function generateBookingCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${timestamp}-${random}`;
}

export async function createBookingRequest(payload) {
  const {
    customerName,
    phone,
    email,
    conceptId,
    packageId,
    requestedDate,
    requestedTime,
    note
  } = payload;

  // Validation
  if (!customerName || !customerName.trim()) {
    const error = new Error('Customer name is required');
    error.statusCode = 400;
    throw error;
  }
  if (!phone || !phone.trim()) {
    const error = new Error('Phone number is required');
    error.statusCode = 400;
    throw error;
  }
  if (!conceptId) {
    const error = new Error('Concept selection is required');
    error.statusCode = 400;
    throw error;
  }
  if (!packageId) {
    const error = new Error('Package selection is required');
    error.statusCode = 400;
    throw error;
  }
  if (!requestedDate || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate.trim())) {
    const error = new Error('Requested date must be in YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }
  if (!requestedTime || !/^\d{1,2}:\d{2}$/.test(requestedTime.trim())) {
    const error = new Error('Requested time must be in HH:mm format');
    error.statusCode = 400;
    throw error;
  }

  // Verify Concept exists and is PUBLISHED
  const concept = await Concept.findById(conceptId);
  if (!concept || concept.status !== 'PUBLISHED') {
    const error = new Error('The selected concept is unavailable or not published');
    error.statusCode = 400;
    throw error;
  }

  // Verify Package exists and is ACTIVE
  const pkg = await Package.findById(packageId);
  if (!pkg || pkg.status !== 'ACTIVE') {
    const error = new Error('The selected package is unavailable or inactive');
    error.statusCode = 400;
    throw error;
  }

  // Verify Package belongs to selected Concept
  if (pkg.conceptId.toString() !== concept._id.toString()) {
    const error = new Error('The selected package does not belong to the selected concept');
    error.statusCode = 400;
    throw error;
  }

  // Create booking record with snapshot values from database
  const bookingCode = generateBookingCode();
  const booking = new Booking({
    bookingCode,
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : '',
    conceptId: concept._id,
    packageId: pkg._id,
    packageNameSnapshot: pkg.name,
    priceSnapshot: pkg.price !== undefined ? pkg.price : null,
    requestedDate: requestedDate.trim(),
    requestedTime: requestedTime.trim(),
    note: note ? note.trim() : '',
    status: BOOKING_STATUSES.PENDING,
    adminNote: '',
    confirmedAt: null
  });

  await booking.save();

  // Return public safe response without internal notes
  return {
    bookingCode: booking.bookingCode,
    customerName: booking.customerName,
    requestedDate: booking.requestedDate,
    requestedTime: booking.requestedTime,
    packageNameSnapshot: booking.packageNameSnapshot,
    priceSnapshot: booking.priceSnapshot,
    status: booking.status,
    createdAt: booking.createdAt
  };
}

export async function getAdminBookings({ status, conceptId, search, page = 1, limit = 20 } = {}) {
  const query = {};
  if (status) query.status = status;
  if (conceptId) query.conceptId = conceptId;
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { bookingCode: searchRegex },
      { customerName: searchRegex },
      { phone: searchRegex }
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Booking.countDocuments(query);
  const items = await Booking.find(query)
    .populate('conceptId', 'name slug')
    .populate('packageId', 'name price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  return {
    items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit)
    }
  };
}

export async function getBookingById(id) {
  const booking = await Booking.findById(id)
    .populate('conceptId', 'name slug coverImage')
    .populate('packageId', 'name price description')
    .lean();

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }
  return booking;
}

export async function updateBookingDetails(id, data) {
  const booking = await Booking.findById(id);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  // Update administrative or schedule details (does NOT update status here)
  if (data.adminNote !== undefined) booking.adminNote = data.adminNote.trim();
  if (data.note !== undefined) booking.note = data.note.trim();
  if (data.requestedDate !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(data.requestedDate.trim())) {
    booking.requestedDate = data.requestedDate.trim();
  }
  if (data.requestedTime !== undefined && /^\d{1,2}:\d{2}$/.test(data.requestedTime.trim())) {
    booking.requestedTime = data.requestedTime.trim();
  }

  return await booking.save();
}

export async function transitionBookingStatus(id, newStatus, adminNote) {
  const booking = await Booking.findById(id);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = booking.status;
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    const error = new Error(
      `Invalid status transition: cannot change booking status from "${currentStatus}" to "${newStatus}". Allowed transitions: [${allowedTransitions.join(', ') || 'none'}]`
    );
    error.statusCode = 400;
    throw error;
  }

  booking.status = newStatus;
  if (adminNote !== undefined) {
    booking.adminNote = adminNote.trim();
  }
  if (newStatus === BOOKING_STATUSES.CONFIRMED) {
    booking.confirmedAt = new Date();
  }

  return await booking.save();
}
