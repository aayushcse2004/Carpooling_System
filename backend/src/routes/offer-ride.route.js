import express from "express";
import Ride from "../models/offer-rides.model.js";
import Driver from "../models/driver.model.js";

const router = express.Router();

// Helper to fetch single ride by ID
const getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findById(id)
      .populate('driver', 'name email phone carnumber gender bio vehicleModel')
      .populate('confirmedRiders', 'name email phone');

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    res.status(200).json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch ride details", error: error.message });
  }
};

// POST - Offer a new ride
const createRide = async (req, res) => {
  try {
    const { from, to, date, time, transport, passengers, contribution, driver, confirmedRiders } = req.body;

    if (!from || !to || !date || !time || passengers === undefined || contribution === undefined) {
      return res.status(400).json({ success: false, message: "Missing required ride fields" });
    }

    const driverId = driver || req.user?._id;
    if (!driverId) {
      return res.status(400).json({ success: false, message: "Driver identification is required" });
    }

    const driverExists = await Driver.findById(driverId);
    if (!driverExists) {
      return res.status(404).json({ success: false, message: "Driver account not found" });
    }

    const ride = new Ride({
      from: from.trim(),
      to: to.trim(),
      date,
      time,
      transport: transport || "Car",
      passengers: parseInt(passengers, 10),
      contribution: parseFloat(contribution),
      driver: driverId,
      confirmedRiders: confirmedRiders || []
    });

    await ride.save();
    res.status(201).json({ success: true, message: "Ride successfully published", ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post("/offer-ride", createRide);
router.post("/", createRide);

// GET - All rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('driver', 'name email carnumber phone gender vehicleModel')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rides", error: error.message });
  }
};

router.get("/allRides", getAllRides);
router.get("/", getAllRides);

// GET - Driver's rides
router.get("/my-rides", async (req, res) => {
  try {
    const driverId = req.query.driverId || req.user?._id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: "Driver ID is required" });
    }
    const rides = await Ride.find({ driver: driverId })
      .populate('confirmedRiders', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rides", error: error.message });
  }
});

router.get("/allRides/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    const rides = await Ride.find({ driver: driverId })
      .populate('confirmedRiders', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Rides fetched successfully",
      rides
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rides", error: error.message });
  }
});

// GET - Single ride by ID
router.get("/rides/:id", getRideById);
router.get("/:id", getRideById);

// PATCH - Edit a ride
const updateRide = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const ride = await Ride.findByIdAndUpdate(id, update, { new: true });
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    res.status(200).json({ success: true, message: "Ride updated", ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.patch("/rides/:id", updateRide);
router.patch("/:id", updateRide);

// PATCH - Mark a ride as completed
const completeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findByIdAndUpdate(id, { completed: true }, { new: true });
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    res.status(200).json({ success: true, message: "Ride marked as completed", ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.patch("/rides/:id/complete", completeRide);
router.patch("/:id/complete", completeRide);

// DELETE - Delete a ride
const deleteRide = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findByIdAndDelete(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }
    res.status(200).json({ success: true, message: "Ride deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.delete("/rides/:id", deleteRide);
router.delete("/:id", deleteRide);

export default router;
