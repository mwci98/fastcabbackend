import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
];

export const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error('CRITICAL: Missing environment variables:');
        missing.forEach(m => console.error(` - ${m}`));
        process.exit(1);
    }

    console.log('Environment variables validated successfully.');
};
