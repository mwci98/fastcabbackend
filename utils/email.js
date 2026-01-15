"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentConfirmationEmail = exports.sendBookingConfirmationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendBookingConfirmationEmail = async (to, bookingDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Booking Confirmation - Fast Cab',
        html: `
      <h1>Booking Confirmed!</h1>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Your booking with Fast Cab has been confirmed.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingDetails.id}</li>
        <li><strong>Pickup:</strong> ${bookingDetails.pickupLocation}</li>
        <li><strong>Drop:</strong> ${bookingDetails.dropLocation}</li>
        <li><strong>Pickup Time:</strong> ${new Date(bookingDetails.pickupTime).toLocaleString()}</li>
        <li><strong>Total Fare:</strong> ₹${bookingDetails.totalFare}</li>
      </ul>
      <p>Thank you for choosing Fast Cab!</p>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending booking confirmation email:', error);
    }
};
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
const sendPaymentConfirmationEmail = async (to, paymentDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Payment Confirmation - Fast Cab',
        html: `
      <h1>Payment Received!</h1>
      <p>Your payment for booking ${paymentDetails.bookingId} was successful.</p>
      <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
      <p><strong>Transaction ID:</strong> ${paymentDetails.razorpayPaymentId}</p>
      <p>You can download your invoice from your dashboard.</p>
    `,
    };
    try {
        await transporter.sendMail(mailOptions);
    }
    catch (error) {
        console.error('Error sending payment confirmation email:', error);
    }
};
exports.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;
