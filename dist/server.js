"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
const connection_1 = require("./database/connection");
// Create HTTP server
const server = http_1.default.createServer(app_1.default);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.default.info(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger_1.default.info(`Socket disconnected: ${socket.id}`);
    });
    // Add more socket event handlers here
});
// Start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize database connection
        yield (0, connection_1.initializeDatabase)();
        // Start HTTP server
        server.listen(config_1.PORT, () => {
            logger_1.default.info(`Server running on port ${config_1.PORT} in ${process.env.NODE_ENV} mode`);
        });
    }
    catch (error) {
        logger_1.default.error(`Server failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error(`Unhandled Rejection: ${err}`);
    // Graceful shutdown
    server.close(() => process.exit(1));
});
// Start the server
startServer();
//# sourceMappingURL=server.js.map