"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const admin_1 = __importDefault(require("./routes/admin"));
const env_1 = require("./utils/env");
dotenv_1.default.config();
(0, env_1.validateEnv)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for network access
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/admin', admin_1.default);
app.get('/', (req, res) => {
    res.send('Fast Cab API is running');
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (Listening on all interfaces)`);
});
