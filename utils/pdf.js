"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateInvoicePDF = (booking, res) => {
    const doc = new pdfkit_1.default();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${booking.id}.pdf`);
    doc.pipe(res);
    // Header
    doc.fontSize(25).text('Fast Cab Invoice', { align: 'center' });
    doc.moveDown();
    // Invoice Info
    doc.fontSize(12).text(`Booking ID: ${booking.id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Customer: ${booking.user.name}`);
    doc.text(`Email: ${booking.user.email}`);
    doc.moveDown();
    // Booking Details
    doc.fontSize(16).text('Trip Details', { underline: true });
    doc.fontSize(12).text(`Pickup: ${booking.pickupLocation}`);
    doc.text(`Drop: ${booking.dropLocation}`);
    doc.text(`Time: ${new Date(booking.pickupTime).toLocaleString()}`);
    doc.text(`Vehicle: ${booking.vehicle?.model || 'N/A'} (${booking.vehicle?.type || 'N/A'})`);
    doc.moveDown();
    // Fare Details
    doc.fontSize(16).text('Fare Summary', { underline: true });
    doc.fontSize(12).text(`Total Fare: ₹${booking.totalFare}`);
    doc.text(`Payment Status: ${booking.razorpayPaymentId ? 'Paid' : 'Pending'}`);
    if (booking.razorpayPaymentId) {
        doc.text(`Payment ID: ${booking.razorpayPaymentId}`);
    }
    // Footer
    doc.moveDown();
    doc.fontSize(10).text('Thank you for choosing Fast Cab!', { align: 'center' });
    doc.end();
};
exports.generateInvoicePDF = generateInvoicePDF;
