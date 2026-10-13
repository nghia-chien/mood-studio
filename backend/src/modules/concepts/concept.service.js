import { Concept } from './concept.model.js';
import { Booking } from '../bookings/booking.model.js';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function getPublicConcepts() {
  return await Concept.find({ status: 'PUBLISHED' })
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();
}

export async function getPublicConceptBySlug(slug) {
  const concept = await Concept.findOne({ slug: slug.toLowerCase(), status: 'PUBLISHED' }).lean();
  if (!concept) {
    const error = new Error('Concept not found or unavailable');
    error.statusCode = 404;
    throw error;
  }
  return concept;
}

export async function getAdminConcepts({ page = 1, limit = 20, status } = {}) {
  const query = {};
  if (status) {
    query.status = status;
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const total = await Concept.countDocuments(query);
  const items = await Concept.find(query)
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

export async function getConceptById(id) {
  const concept = await Concept.findById(id).lean();
  if (!concept) {
    const error = new Error('Concept not found');
    error.statusCode = 404;
    throw error;
  }
  return concept;
}

export async function createConcept(data) {
  if (!data.name) {
    const error = new Error('Concept name is required');
    error.statusCode = 400;
    throw error;
  }

  const slug = (data.slug || slugify(data.name)).toLowerCase().trim();
  const existing = await Concept.findOne({ slug });
  if (existing) {
    const error = new Error(`Concept slug "${slug}" is already in use`);
    error.statusCode = 409;
    throw error;
  }

  const concept = new Concept({
    name: data.name.trim(),
    slug,
    shortDescription: data.shortDescription ? data.shortDescription.trim() : '',
    description: data.description ? data.description.trim() : '',
    coverImage: data.coverImage ? data.coverImage.trim() : '',
    category: data.category ? data.category.trim() : 'personal',
    status: data.status || 'DRAFT',
    displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0
  });

  return await concept.save();
}

export async function updateConcept(id, data) {
  const concept = await Concept.findById(id);
  if (!concept) {
    const error = new Error('Concept not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.slug) {
    const slug = data.slug.toLowerCase().trim();
    if (slug !== concept.slug) {
      const existing = await Concept.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        const error = new Error(`Slug "${slug}" already in use`);
        error.statusCode = 409;
        throw error;
      }
      concept.slug = slug;
    }
  }

  if (data.name !== undefined) concept.name = data.name.trim();
  if (data.shortDescription !== undefined) concept.shortDescription = data.shortDescription.trim();
  if (data.description !== undefined) concept.description = data.description.trim();
  if (data.coverImage !== undefined) concept.coverImage = data.coverImage.trim();
  if (data.category !== undefined) concept.category = data.category.trim();
  if (data.status !== undefined) concept.status = data.status;
  if (data.displayOrder !== undefined) concept.displayOrder = data.displayOrder;

  return await concept.save();
}

export async function deleteConcept(id) {
  const concept = await Concept.findById(id);
  if (!concept) {
    const error = new Error('Concept not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if concept is referenced by bookings
  const bookingCount = await Booking.countDocuments({ conceptId: id });
  if (bookingCount > 0) {
    // Soft delete / archive to avoid breaking history
    concept.status = 'ARCHIVED';
    await concept.save();
    return {
      message: 'Concept has associated bookings. Marked as ARCHIVED instead of physical deletion.',
      archived: true
    };
  }

  await Concept.findByIdAndDelete(id);
  return { message: 'Concept deleted successfully', archived: false };
}
