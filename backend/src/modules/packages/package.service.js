import { Package } from './package.model.js';
import { Concept } from '../concepts/concept.model.js';
import { Booking } from '../bookings/booking.model.js';

export async function getPublicPackagesByConceptId(conceptId) {
  // Concept must exist and be PUBLISHED
  const concept = await Concept.findOne({ _id: conceptId, status: 'PUBLISHED' });
  if (!concept) {
    const error = new Error('Concept not found or unavailable');
    error.statusCode = 404;
    throw error;
  }

  return await Package.find({ conceptId, status: 'ACTIVE' })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();
}

export async function getAdminPackages({ conceptId, status, page = 1, limit = 50 } = {}) {
  const query = {};
  if (conceptId) query.conceptId = conceptId;
  if (status) query.status = status;

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Package.countDocuments(query);
  const items = await Package.find(query)
    .populate('conceptId', 'name slug status')
    .sort({ displayOrder: 1, createdAt: -1 })
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

export async function getPackageById(id) {
  const pkg = await Package.findById(id).populate('conceptId', 'name slug status').lean();
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }
  return pkg;
}

export async function createPackage(data) {
  if (!data.conceptId) {
    const error = new Error('conceptId is required');
    error.statusCode = 400;
    throw error;
  }
  if (!data.name) {
    const error = new Error('Package name is required');
    error.statusCode = 400;
    throw error;
  }

  const concept = await Concept.findById(data.conceptId);
  if (!concept) {
    const error = new Error('Referenced concept does not exist');
    error.statusCode = 400;
    throw error;
  }

  const pkg = new Package({
    conceptId: data.conceptId,
    name: data.name.trim(),
    description: data.description ? data.description.trim() : '',
    price: data.price !== undefined && data.price !== null ? Number(data.price) : null,
    includedItems: Array.isArray(data.includedItems) ? data.includedItems.map(item => String(item).trim()) : [],
    status: data.status || 'ACTIVE',
    displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0
  });

  return await pkg.save();
}

export async function updatePackage(id, data) {
  const pkg = await Package.findById(id);
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.conceptId) {
    const concept = await Concept.findById(data.conceptId);
    if (!concept) {
      const error = new Error('Referenced concept does not exist');
      error.statusCode = 400;
      throw error;
    }
    pkg.conceptId = data.conceptId;
  }

  if (data.name !== undefined) pkg.name = data.name.trim();
  if (data.description !== undefined) pkg.description = data.description.trim();
  if (data.price !== undefined) pkg.price = data.price !== null ? Number(data.price) : null;
  if (data.includedItems !== undefined) {
    pkg.includedItems = Array.isArray(data.includedItems) ? data.includedItems.map(item => String(item).trim()) : [];
  }
  if (data.status !== undefined) pkg.status = data.status;
  if (data.displayOrder !== undefined) pkg.displayOrder = data.displayOrder;

  return await pkg.save();
}

export async function deletePackage(id) {
  const pkg = await Package.findById(id);
  if (!pkg) {
    const error = new Error('Package not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingCount = await Booking.countDocuments({ packageId: id });
  if (bookingCount > 0) {
    pkg.status = 'INACTIVE';
    await pkg.save();
    return {
      message: 'Package has associated bookings. Marked as INACTIVE instead of physical deletion.',
      archived: true
    };
  }

  await Package.findByIdAndDelete(id);
  return { message: 'Package deleted successfully', archived: false };
}
