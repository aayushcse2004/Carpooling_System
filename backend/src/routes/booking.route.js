import express from 'express';
import {
  createBooking,
  getMyBookings,
  getDriverRequests,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Passenger creates a booking request
router.post('/', protect, createBooking);

// Passenger gets all their bookings
router.get('/my-bookings', protect, getMyBookings);

// Driver gets all booking requests for their rides
router.get('/driver-requests', protect, getDriverRequests);

// Driver approves or rejects a request
router.patch('/:id/status', protect, updateBookingStatus);

// Passenger or Driver cancels a booking
router.patch('/:id/cancel', protect, cancelBooking);

export default router;
