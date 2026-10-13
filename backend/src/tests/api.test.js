import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Admin } from '../modules/admin/admin.model.js';
import { Concept } from '../modules/concepts/concept.model.js';
import { Package } from '../modules/packages/package.model.js';
import { Booking, BOOKING_STATUSES } from '../modules/bookings/booking.model.js';

const app = createApp();

describe('MOOD Studio Backend API Tests', () => {
  let adminToken = '';
  let publishedConceptId = '';
  let draftConceptId = '';
  let activePackageId = '';
  let inactivePackageId = '';
  let foreignConceptId = '';
  let foreignPackageId = '';

  before(async () => {
    await connectDB();

    // Clean up test data
    await Admin.deleteMany({ email: 'test_admin@moodstu.com' });
    await Concept.deleteMany({ slug: { $in: ['test-concept-pub', 'test-concept-draft', 'test-concept-foreign'] } });
    await Booking.deleteMany({ customerName: 'Test Customer Runner' });

    // Seed test admin
    const passwordHash = await bcrypt.hash('TestAdminPass123!', 10);
    await Admin.create({
      email: 'test_admin@moodstu.com',
      passwordHash,
      role: 'admin'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'test_admin@moodstu.com', password: 'TestAdminPass123!' });

    assert.equal(loginRes.status, 200);
    adminToken = loginRes.body.data.token;

    // Seed test concepts
    const pubConcept = await Concept.create({
      name: 'Test Concept Published',
      slug: 'test-concept-pub',
      shortDescription: 'Published test concept',
      description: 'Full description',
      category: 'personal',
      status: 'PUBLISHED'
    });
    publishedConceptId = pubConcept._id.toString();

    const draftConcept = await Concept.create({
      name: 'Test Concept Draft',
      slug: 'test-concept-draft',
      shortDescription: 'Draft test concept',
      description: 'Draft description',
      category: 'personal',
      status: 'DRAFT'
    });
    draftConceptId = draftConcept._id.toString();

    const foreignConcept = await Concept.create({
      name: 'Foreign Concept',
      slug: 'test-concept-foreign',
      status: 'PUBLISHED'
    });
    foreignConceptId = foreignConcept._id.toString();

    // Seed test packages
    const activePkg = await Package.create({
      conceptId: pubConcept._id,
      name: 'Test Active Package',
      price: 1500000,
      includedItems: ['Item 1', 'Item 2'],
      status: 'ACTIVE'
    });
    activePackageId = activePkg._id.toString();

    const inactivePkg = await Package.create({
      conceptId: pubConcept._id,
      name: 'Test Inactive Package',
      price: 900000,
      status: 'INACTIVE'
    });
    inactivePackageId = inactivePkg._id.toString();

    const foreignPkg = await Package.create({
      conceptId: foreignConcept._id,
      name: 'Foreign Package',
      price: 2000000,
      status: 'ACTIVE'
    });
    foreignPackageId = foreignPkg._id.toString();
  });

  after(async () => {
    // Cleanup
    await Admin.deleteMany({ email: 'test_admin@moodstu.com' });
    await Concept.deleteMany({ slug: { $in: ['test-concept-pub', 'test-concept-draft', 'test-concept-foreign'] } });
    await Package.deleteMany({ _id: { $in: [activePackageId, inactivePackageId, foreignPackageId] } });
    await Booking.deleteMany({ customerName: 'Test Customer Runner' });
    await disconnectDB();
  });

  describe('1. Health check & Diagnostics', () => {
    it('GET /api/health returns 200 with status and database state', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.ok(['connected', 'disconnected'].includes(res.body.database));
      assert.ok(typeof res.body.uptime === 'number');
      assert.ok(res.body.timestamp);
    });
  });

  describe('2. Concept Public APIs & Visibility', () => {
    it('GET /api/public/concepts lists published concepts only', async () => {
      const res = await request(app).get('/api/public/concepts');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      const items = res.body.data;
      const foundPublished = items.some(c => c.slug === 'test-concept-pub');
      const foundDraft = items.some(c => c.slug === 'test-concept-draft');
      assert.equal(foundPublished, true, 'Published concept should be visible');
      assert.equal(foundDraft, false, 'Draft concept must be hidden from public');
    });

    it('GET /api/public/concepts/:slug returns 404 for draft concept', async () => {
      const res = await request(app).get('/api/public/concepts/test-concept-draft');
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it('GET /api/public/concepts/:slug returns 200 for published concept', async () => {
      const res = await request(app).get('/api/public/concepts/test-concept-pub');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.slug, 'test-concept-pub');
    });
  });

  describe('3. Booking Business Rules & Validation', () => {
    it('Rejects booking when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({ customerName: 'Test Customer Runner' });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });

    it('Rejects booking for unpublished/draft concept', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({
          customerName: 'Test Customer Runner',
          phone: '0901234567',
          conceptId: draftConceptId,
          packageId: activePackageId,
          requestedDate: '2026-11-20',
          requestedTime: '14:00'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message, /concept is unavailable/i);
    });

    it('Rejects booking for inactive package', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({
          customerName: 'Test Customer Runner',
          phone: '0901234567',
          conceptId: publishedConceptId,
          packageId: inactivePackageId,
          requestedDate: '2026-11-20',
          requestedTime: '14:00'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message, /package is unavailable/i);
    });

    it('Rejects booking when package belongs to a different concept', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({
          customerName: 'Test Customer Runner',
          phone: '0901234567',
          conceptId: publishedConceptId,
          packageId: foreignPackageId, // Belongs to foreignConceptId
          requestedDate: '2026-11-20',
          requestedTime: '14:00'
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message, /does not belong to the selected concept/i);
    });

    it('Creates valid booking in PENDING status, ignores client-submitted price and status', async () => {
      const res = await request(app)
        .post('/api/public/bookings')
        .send({
          customerName: 'Test Customer Runner',
          phone: '0901234567',
          email: 'test@example.com',
          conceptId: publishedConceptId,
          packageId: activePackageId,
          requestedDate: '2026-11-20',
          requestedTime: '14:00',
          note: 'Prefer natural lighting',
          // Malicious overrides attempt:
          status: 'CONFIRMED',
          priceSnapshot: 100,
          price: 100,
          adminNote: 'Secret backdoor note'
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      const data = res.body.data;

      assert.equal(data.status, BOOKING_STATUSES.PENDING, 'New booking must always start with PENDING');
      assert.equal(data.priceSnapshot, 1500000, 'Price must be taken from database package snapshot, not client');
      assert.equal(data.packageNameSnapshot, 'Test Active Package');
      assert.ok(data.bookingCode.startsWith('BK-'));
      assert.equal(data.adminNote, undefined, 'Public response must not expose adminNote');

      // Verify directly in database
      const dbBooking = await Booking.findOne({ bookingCode: data.bookingCode });
      assert.ok(dbBooking);
      assert.equal(dbBooking.status, BOOKING_STATUSES.PENDING);
      assert.equal(dbBooking.priceSnapshot, 1500000);
      assert.equal(dbBooking.adminNote, '', 'Client cannot set adminNote');
    });
  });

  describe('4. Admin Security & State Machine', () => {
    it('Rejects unauthenticated requests to /api/admin/bookings', async () => {
      const res = await request(app).get('/api/admin/bookings');
      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
    });

    it('Allows authenticated admin to view bookings', async () => {
      const res = await request(app)
        .get('/api/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
    });

    it('Enforces booking state machine: PENDING -> CONFIRMED is valid', async () => {
      // Find our test booking
      const booking = await Booking.findOne({ customerName: 'Test Customer Runner' });
      assert.ok(booking);

      const res = await request(app)
        .patch(`/api/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: BOOKING_STATUSES.CONFIRMED,
          adminNote: 'Confirmed via phone call with customer'
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, BOOKING_STATUSES.CONFIRMED);
      assert.ok(res.body.data.confirmedAt);
      assert.equal(res.body.data.adminNote, 'Confirmed via phone call with customer');
    });

    it('Enforces booking state machine: CONFIRMED -> PENDING is INVALID and rejected', async () => {
      const booking = await Booking.findOne({ customerName: 'Test Customer Runner' });
      assert.equal(booking.status, BOOKING_STATUSES.CONFIRMED);

      const res = await request(app)
        .patch(`/api/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: BOOKING_STATUSES.PENDING
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message, /invalid status transition/i);
    });

    it('Enforces booking state machine: CONFIRMED -> COMPLETED is valid', async () => {
      const booking = await Booking.findOne({ customerName: 'Test Customer Runner' });
      assert.equal(booking.status, BOOKING_STATUSES.CONFIRMED);

      const res = await request(app)
        .patch(`/api/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: BOOKING_STATUSES.COMPLETED
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.status, BOOKING_STATUSES.COMPLETED);
    });

    it('Enforces booking state machine: COMPLETED cannot transition to CANCELLED', async () => {
      const booking = await Booking.findOne({ customerName: 'Test Customer Runner' });
      assert.equal(booking.status, BOOKING_STATUSES.COMPLETED);

      const res = await request(app)
        .patch(`/api/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: BOOKING_STATUSES.CANCELLED
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });
});
