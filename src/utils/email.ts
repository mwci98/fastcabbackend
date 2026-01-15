import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendBookingConfirmationEmail = async (to: string, bookingDetails: any) => {
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
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
    }
};

export const sendPaymentConfirmationEmail = async (to: string, paymentDetails: any) => {
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
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
    }
};
