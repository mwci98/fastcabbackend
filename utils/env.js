"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
];
const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error('CRITICAL: Missing environment variables:');
        missing.forEach(m => console.error(` - ${m}`));
        process.exit(1);
    }
    console.log('Environment variables validated successfully.');
};
exports.validateEnv = validateEnv;
