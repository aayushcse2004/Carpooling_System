import Booking from '../models/booking.model.js';
import Ride from '../models/offer-rides.model.js';

export const createBooking = async (req, res) => {
  try {
    const { rideId, seatsBooked = 1, pickupLocation = '', dropLocation = '', notes = '' } = req.body;
    const passengerId = req.user._id;

    if (!rideId) {
      return res.status(400).json({ success: false, message: 'rideId is required' });
    }

    const requestedSeats = parseInt(seatsBooked, 10);
    if (isNaN(requestedSeats) || requestedSeats < 1) {
      return res.status(400).json({ success: false, message: 'Valid seat count (at least 1) is required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }

    if (ride.completed) {
      return res.status(400).json({ success: false, message: 'This ride has already been marked as completed' });
    }

    // Check if the passenger is also the driver of this ride
    if (ride.driver.toString() === passengerId.toString()) {
      return res.status(400).json({ success: false, message: 'Drivers cannot book seats on their own published rides' });
    }

    // Prevent double active booking
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: passengerId,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingBooking.status} booking request for this ride`,
        booking: existingBooking,
      });
    }

    // Check seat availability
    if (ride.passengers < requestedSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.passengers} seat(s) currently available. Cannot book ${requestedSeats} seat(s).`,
      });
    }

    const totalPrice = (ride.contribution || 0) * requestedSeats;

    const booking = new Booking({
      ride: ride._id,
      passenger: passengerId,
      driver: ride.driver,
      seatsBooked: requestedSeats,
      totalPrice,
      pickupLocation: pickupLocation || ride.from,
      dropLocation: dropLocation || ride.to,
      notes,
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully to the driver for approval',
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error creating booking', error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const passengerId = req.user._id;

    const bookings = await Booking.find({ passenger: passengerId })
      .populate('ride')
      .populate('driver', 'name email phone carnumber vehicleModel')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching passenger bookings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings', error: error.message });
  }
};

export const getDriverRequests = async (req, res) => {
  try {
    const driverId = req.user._id;

    const bookings = await Booking.find({ driver: driverId })
      .populate('ride')
      .populate('passenger', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching driver requests:', error);
    res.status(500).json({ success: false, message: 'Server error fetching requests', error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' or 'rejected'
    const driverId = req.user._id;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be either 'confirmed' or 'rejected'" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    if (booking.driver.toString() !== driverId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot update a cancelled booking' });
    }

    if (status === 'confirmed') {
      if (booking.status === 'confirmed') {
        return res.status(200).json({ success: true, message: 'Booking is already confirmed', booking });
      }

      // Atomically decrement seats on the ride
      const updatedRide = await Ride.findOneAndUpdate(
        { _id: booking.ride, passengers: { $gte: booking.seatsBooked } },
        {
          $inc: { passengers: -booking.seatsBooked },
          $addToSet: { confirmedRiders: booking.passenger },
        },
        { new: true }
      );

      if (!updatedRide) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient seats available on this ride to confirm this request',
        });
      }

      booking.status = 'confirmed';
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Booking request approved and confirmed',
        booking,
        remainingSeats: updatedRide.passengers,
      });
    }

    if (status === 'rejected') {
      // If it was previously confirmed, restore seats
      if (booking.status === 'confirmed') {
        await Ride.findByIdAndUpdate(booking.ride, {
          $inc: { passengers: booking.seatsBooked },
          $pull: { confirmedRiders: booking.passenger },
        });
      }

      booking.status = 'rejected';
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Booking request rejected',
        booking,
      });
    }
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Server error updating booking status', error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify caller is either the passenger or the driver
    const isPassenger = booking.passenger.toString() === userId;
    const isDriver = booking.driver.toString() === userId;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // If booking was confirmed, atomically restore the seats to the ride
    if (booking.status === 'confirmed') {
      await Ride.findByIdAndUpdate(booking.ride, {
        $inc: { passengers: booking.seatsBooked },
        $pull: { confirmedRiders: booking.passenger },
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled',
      booking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking', error: error.message });
  }
};
