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
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupSessionsJob = void 0;
const typeorm_1 = require("typeorm");
const Session_1 = require("../models/Session");
const cleanupSessionsJob = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionRepository = (0, typeorm_1.getRepository)(Session_1.Session);
        const now = new Date();
        const result = yield sessionRepository
            .createQueryBuilder()
            .delete()
            .from(Session_1.Session)
            .where('expiresAt < :now', { now })
            .execute();
        console.log(`Cleaned up ${result.affected} expired sessions.`);
    }
    catch (error) {
        console.error('Error cleaning up sessions:', error);
    }
});
exports.cleanupSessionsJob = cleanupSessionsJob;
//# sourceMappingURL=cleanupSessions.job.js.map