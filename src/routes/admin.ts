import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import prisma from '../utils/prisma';

const router = express.Router();

// Middleware: All routes below require admin auth
router.use(authenticateToken, isAdmin);

// --- Booking Management ---

router.get('/bookings', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: { user: true, driver: true, vehicle: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});

router.patch('/bookings/:id', async (req, res) => {
    try {
        const { status, driverId, vehicleId } = req.body;
        const booking = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status, driverId, vehicleId },
        });
        res.json(booking);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
});

// --- Fleet Management ---

router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({ include: { driver: true } });
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
    }
});

router.post('/vehicles', async (req, res) => {
    try {
        const { type, model, plateNumber, capacity, pricePerKm } = req.body;
        const vehicle = await prisma.vehicle.create({
            data: { type, model, plateNumber, capacity, pricePerKm },
        });
        res.status(201).json(vehicle);
    } catch (error: any) {
        res.status(400).json({ message: 'Failed to add vehicle', error: error.message });
    }
});

// --- Driver Management ---

router.get('/drivers', async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({ include: { vehicle: true } });
        res.json(drivers);
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
    }
});

router.post('/drivers', async (req, res) => {
    try {
        const { name, licenseNumber, phone, vehicleId } = req.body;
        const driver = await prisma.driver.create({
            data: { name, licenseNumber, phone, vehicleId },
        });
        res.status(201).json(driver);
    } catch (error: any) {
        res.status(400).json({ message: 'Failed to add driver', error: error.message });
    }
});

// --- Analytics ---

router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await prisma.booking.count();
        const totalRevenue = await prisma.booking.aggregate({
            _sum: { totalFare: true },
            where: { status: 'COMPLETED' }
        });
        const activeDrivers = await prisma.driver.count({ where: { isAvailable: true } });
        const fleetSize = await prisma.vehicle.count();

        res.json({
            totalBookings,
            totalRevenue: totalRevenue._sum.totalFare || 0,
            activeDrivers,
            fleetSize
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
    }
});

export default router;
