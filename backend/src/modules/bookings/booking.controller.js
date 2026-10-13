import * as bookingService from './booking.service.js';

export async function createPublicBooking(req, res, next) {
  try {
    const booking = await bookingService.createBookingRequest(req.body);
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Yêu cầu đặt lịch đã được ghi nhận. MOOD Studio sẽ liên hệ xác nhận cuộc hẹn với bạn sớm nhất.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBookings(req, res, next) {
  try {
    const { status, conceptId, search, page, limit } = req.query;
    const result = await bookingService.getAdminBookings({ status, conceptId, search, page, limit });
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminBooking(req, res, next) {
  try {
    const booking = await bookingService.updateBookingDetails(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminBookingStatus(req, res, next) {
  try {
    const { status, adminNote } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Target status is required in body',
          code: 'STATUS_REQUIRED'
        }
      });
    }

    const booking = await bookingService.transitionBookingStatus(req.params.id, status, adminNote);
    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking status updated to ${booking.status}`
    });
  } catch (error) {
    next(error);
  }
}
