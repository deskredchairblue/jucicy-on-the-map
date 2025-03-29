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
exports.mongoose = exports.initializeDatabase = exports.AppDataSource = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.mongoose = mongoose_1.default;
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
// Import models
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const Project_1 = require("../models/Project");
const ProjectAccess_1 = require("../models/ProjectAccess");
const Notification_1 = require("../models/Notification");
const Invoice_1 = require("../models/Invoice");
const FeatureUsage_1 = require("../models/FeatureUsage");
// TypeORM data source
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: config_1.config.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    entities: [
        User_1.User,
        Session_1.Session,
        Project_1.Project,
        ProjectAccess_1.ProjectAccess,
        Notification_1.Notification,
        Invoice_1.Invoice,
        FeatureUsage_1.FeatureUsage
    ],
    migrations: [__dirname + '/migrations/**/*.ts'],
    subscribers: []
});
// MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
};
/**
 * Initialize database connections
 * Supports both MongoDB and PostgreSQL (TypeORM)
 */
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Determine which database to connect to based on configuration
        const dbType = process.env.DB_TYPE || 'postgres';
        if (dbType === 'mongodb' && config_1.config.MONGODB_URI) {
            // Connect to MongoDB
            yield mongoose_1.default.connect(config_1.config.MONGODB_URI, mongooseOptions);
            logger_1.default.info('MongoDB connection established');
        }
        else {
            // Connect to PostgreSQL via TypeORM
            yield exports.AppDataSource.initialize();
            logger_1.default.info('PostgreSQL connection established via TypeORM');
        }
    }
    catch (error) {
        logger_1.default.error(`Database connection failed: ${error.message}`);
        throw error;
    }
});
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=index.js.map