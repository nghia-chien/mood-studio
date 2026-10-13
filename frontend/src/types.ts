export interface Concept {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImage?: string;
  category?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  _id: string;
  conceptId: string;
  name: string;
  description?: string;
  price: number | null;
  includedItems: string[];
  status: 'ACTIVE' | 'INACTIVE';
  displayOrder: number;
}

export interface GalleryImage {
  _id: string;
  conceptId?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  imageUrl: string;
  publicId: string;
  caption?: string;
  status: 'PUBLISHED' | 'HIDDEN';
  displayOrder: number;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  _id: string;
  bookingCode: string;
  customerName: string;
  phone: string;
  email?: string;
  conceptId: {
    _id: string;
    name: string;
    slug: string;
    coverImage?: string;
  };
  packageId: {
    _id: string;
    name: string;
    price: number | null;
    description?: string;
  };
  packageNameSnapshot: string;
  priceSnapshot: number | null;
  requestedDate: string;
  requestedTime: string;
  note?: string;
  status: BookingStatus;
  adminNote?: string;
  confirmedAt?: string | null;
  createdAt: string;
}

export interface CreateBookingPayload {
  customerName: string;
  phone: string;
  email?: string;
  conceptId: string;
  packageId: string;
  requestedDate: string;
  requestedTime: string;
  note?: string;
}

export interface BookingResponseData {
  bookingCode: string;
  customerName: string;
  requestedDate: string;
  requestedTime: string;
  packageNameSnapshot: string;
  priceSnapshot: number | null;
  status: BookingStatus;
  createdAt: string;
}
