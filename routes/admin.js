"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = express_1.default.Router();
// Middleware: All routes below require admin auth
router.use(auth_1.authenticateToken, auth_1.isAdmin);
// --- Booking Management ---
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await prisma_1.default.booking.findMany({
            include: { user: true, driver: true, vehicle: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});
router.patch('/bookings/:id', async (req, res) => {
    try {
        const { status, driverId, vehicleId } = req.body;
        const booking = await prisma_1.default.booking.update({
            where: { id: req.params.id },
            data: { status, driverId, vehicleId },
        });
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
});
// --- Fleet Management ---
router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await prisma_1.default.vehicle.findMany({ include: { driver: true } });
        res.json(vehicles);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
    }
});
router.post('/vehicles', async (req, res) => {
    try {
        const { type, model, plateNumber, capacity, pricePerKm } = req.body;
        const vehicle = await prisma_1.default.vehicle.create({
            data: { type, model, plateNumber, capacity, pricePerKm },
        });
        res.status(201).json(vehicle);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to add vehicle', error: error.message });
    }
});
// --- Driver Management ---
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await prisma_1.default.driver.findMany({ include: { vehicle: true } });
        res.json(drivers);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
    }
});
router.post('/drivers', async (req, res) => {
    try {
        const { name, licenseNumber, phone, vehicleId } = req.body;
        const driver = await prisma_1.default.driver.create({
            data: { name, licenseNumber, phone, vehicleId },
        });
        res.status(201).json(driver);
    }
    catch (error) {
        res.status(400).json({ message: 'Failed to add driver', error: error.message });
    }
});
// --- Analytics ---
router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await prisma_1.default.booking.count();
        const totalRevenue = await prisma_1.default.booking.aggregate({
            _sum: { totalFare: true },
            where: { status: 'COMPLETED' }
        });
        const activeDrivers = await prisma_1.default.driver.count({ where: { isAvailable: true } });
        const fleetSize = await prisma_1.default.vehicle.count();
        res.json({
            totalBookings,
            totalRevenue: totalRevenue._sum.totalFare || 0,
            activeDrivers,
            fleetSize
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
});
exports.default = router;
