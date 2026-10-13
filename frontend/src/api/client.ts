import type { Concept, Package, GalleryImage, Booking, CreateBookingPayload, BookingResponseData } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // sends cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();
  if (!response.ok || data.success === false) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data.data !== undefined ? data.data : data;
}

// Public API
export async function getPublicConcepts(): Promise<Concept[]> {
  return request<Concept[]>('/api/public/concepts');
}

export async function getPublicConceptBySlug(slug: string): Promise<Concept> {
  return request<Concept>(`/api/public/concepts/${slug}`);
}

export async function getPublicConceptPackages(conceptId: string): Promise<Package[]> {
  return request<Package[]>(`/api/public/concepts/${conceptId}/packages`);
}

export async function getPublicGallery(): Promise<GalleryImage[]> {
  return request<GalleryImage[]>('/api/public/gallery');
}

export async function submitBooking(payload: CreateBookingPayload): Promise<BookingResponseData> {
  return request<BookingResponseData>('/api/public/bookings', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// Admin API
export async function adminLogin(email: string, password: string): Promise<{ admin: { email: string; role: string }; token?: string }> {
  return request('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function adminLogout(): Promise<void> {
  await request('/api/admin/auth/logout', { method: 'POST' });
}

export async function getAdminMe(): Promise<{ email: string; role: string }> {
  return request('/api/admin/auth/me');
}

export async function getAdminBookings(status?: string): Promise<Booking[]> {
  const query = status && status !== 'ALL' ? `?status=${status}` : '';
  return request<Booking[]>(`/api/admin/bookings${query}`);
}

export async function getAdminBookingById(id: string): Promise<Booking> {
  return request<Booking>(`/api/admin/bookings/${id}`);
}

export async function updateBookingStatus(id: string, status: string, adminNote?: string): Promise<Booking> {
  return request<Booking>(`/api/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, adminNote })
  });
}
