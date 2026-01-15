"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const prisma_1 = __importDefault(require("../utils/prisma"));
const razorpay_1 = require("../utils/razorpay");
const email_1 = require("../utils/email");
const pdf_1 = require("../utils/pdf");
const router = express_1.default.Router();
// Get available vehicles (Public access for fleet display)
router.get('/vehicles', async (req, res) => {
    try {
        const vehicles = await prisma_1.default.vehicle.findMany({
            include: { driver: true }
        });
        res.json(vehicles);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
    }
});
// Get all bookings for the logged-in user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const bookings = await prisma_1.default.booking.findMany({
            where: { userId: req.user.id },
            include: { vehicle: true, driver: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
});
// Create a new booking (and Razorpay order)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { pickupLocation, dropLocation, tripType, pickupTime, vehicleId, totalFare: clientFare } = req.body;
        // Basic Validation
        if (!pickupLocation || !dropLocation || !pickupTime || !vehicleId) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }
        console.log('--- New Booking Attempt ---');
        console.log('User ID:', req.user?.id);
        console.log('Payload:', { pickupLocation, dropLocation, tripType, pickupTime, vehicleId, clientFare });
        // Get vehicle details
        const vehicle = await prisma_1.default.vehicle.findUnique({
            where: { id: vehicleId }
        });
        if (!vehicle) {
            console.warn('Vehicle not found:', vehicleId);
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        // Use client fare if provided, otherwise calculate (mock 15km if no distance info)
        const distanceKm = 15;
        const totalFare = clientFare || (vehicle.pricePerKm * distanceKm);
        console.log('Fare determined:', totalFare);
        // Create booking in database
        console.log('Saving booking to database...');
        let booking;
        try {
            booking = await prisma_1.default.booking.create({
                data: {
                    userId: req.user.id,
                    pickupLocation,
                    dropLocation,
                    tripType: tripType || 'LOCAL',
                    pickupTime: new Date(pickupTime),
                    totalFare,
                    distanceKm,
                    status: 'PENDING',
                    vehicleId: vehicle.id
                },
            });
            console.log('Booking saved, ID:', booking.id);
        }
        catch (dbError) {
            console.error('DATABASE ERROR during booking creation:', dbError);
            throw new Error(`Database Error: ${dbError.message}`);
        }
        // Create Razorpay order (or bypass if MOCK_PAYMENT is enabled)
        console.log('Initiating Payment Order...');
        let order;
        if (process.env.MOCK_PAYMENT === 'true') {
            console.log('DEMO MODE: Creating Mock Order');
            order = { id: `mock_order_${Date.now()}`, amount: totalFare * 100, currency: 'INR' };
        }
        else {
            try {
                order = await (0, razorpay_1.createRazorpayOrder)(totalFare, `receipt_${booking.id}`);
                console.log('Razorpay Order Created:', order.id);
            }
            catch (rzpError) {
                console.error('RAZORPAY ERROR during order creation:', rzpError.message || rzpError);
                throw new Error(`Payment Gateway Error: ${rzpError.message || 'Check credentials'}`);
            }
        }
        // Update booking with payment reference (order ID)
        console.log('Updating booking with order ID...');
        await prisma_1.default.booking.update({
            where: { id: booking.id },
            data: { paymentId: order.id },
        });
        console.log('Booking process complete');
        res.json({ booking, razorpayOrder: order });
    }
    catch (error) {
        console.error('BOOKING 500 ERROR:', error);
        res.status(500).json({
            message: 'Failed to create booking',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
// Verify payment
router.post('/verify-payment', auth_1.authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        console.log('--- Payment Verification Start ---');
        console.log('Order ID:', razorpay_order_id);
        let isValid = false;
        if (razorpay_order_id?.startsWith('mock_order_')) {
            console.log('DEMO MODE: Bypassing Signature Verification');
            isValid = true;
        }
        else {
            isValid = (0, razorpay_1.verifyRazorpaySignature)(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        }
        if (!isValid) {
            console.warn('Invalid Payment Signature');
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
        // Find booking first because paymentId is not a unique field in prisma schema
        // and update needs a unique identifier.
        const bookingRecord = await prisma_1.default.booking.findFirst({
            where: { paymentId: razorpay_order_id },
            include: { user: true }
        });
        if (!bookingRecord) {
            console.error('Booking not found for order ID:', razorpay_order_id);
            return res.status(404).json({ message: 'Booking not found' });
        }
        console.log('Booking found, updating status:', bookingRecord.id);
        // Update booking status using unique ID
        const booking = await prisma_1.default.booking.update({
            where: { id: bookingRecord.id },
            data: {
                status: 'CONFIRMED',
                razorpayPaymentId: razorpay_payment_id,
            },
            include: { user: true },
        });
        console.log('Booking updated successfully');
        // Send confirmation emails (wrapped in try-catch to avoid failing the whole request if email fails)
        try {
            await (0, email_1.sendBookingConfirmationEmail)(booking.user.email, {
                ...booking,
                userName: booking.user.name,
            });
            await (0, email_1.sendPaymentConfirmationEmail)(booking.user.email, {
                bookingId: booking.id,
                amount: booking.totalFare,
                razorpayPaymentId: razorpay_payment_id,
            });
        }
        catch (emailError) {
            console.error('Email sending failed:', emailError.message);
        }
        res.json({ message: 'Payment verified and booking confirmed', booking });
    }
    catch (error) {
        console.error('PAYMENT VERIFY 500 ERROR:', error);
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
});
// Download invoice
router.get('/:id/invoice', auth_1.authenticateToken, async (req, res) => {
    try {
        const booking = await prisma_1.default.booking.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: { user: true, vehicle: true },
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        (0, pdf_1.generateInvoicePDF)(booking, res);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to generate invoice', error: error.message });
    }
});
exports.default = router;
