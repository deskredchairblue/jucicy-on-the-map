"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata"); // Required for TypeORM
const rotating_file_stream_1 = require("rotating-file-stream");
// Import utilities and configs
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = require("./config");
// Create Express app
const app = (0, express_1.default)();
// Set up access logs
const logDirectory = path_1.default.join(process.cwd(), 'logs');
const accessLogStream = (0, rotating_file_stream_1.createStream)('access.log', {
    interval: '1d',
    path: logDirectory
});
// Apply middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, cookie_parser_1.default)()); // Parse cookies
app.use((0, compression_1.default)()); // Compress responses
app.use((0, morgan_1.default)(config_1.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: config_1.NODE_ENV === 'production' ? accessLogStream : undefined
}));
// Import routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/billing', billingRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`);
    // Return error response
    res.status(err.status || 500).json(Object.assign({ message: err.message || 'Internal Server Error' }, (config_1.NODE_ENV === 'development' && { stack: err.stack })));
});
exports.default = app;
//# sourceMappingURL=app.js.map