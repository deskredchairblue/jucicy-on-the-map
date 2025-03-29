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
const security_service_1 = __importDefault(require("../services/security.service"));
const securityController = {
    getStatus: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const status = yield security_service_1.default.getStatus(req.user);
            res.json(status);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    alertActivity: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.alertActivity(req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    banUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.banUser(req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    unbanUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.unbanUser(req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    analyzeIP: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const analysis = yield security_service_1.default.analyzeIP(req.body.ip, req.user);
            res.json(analysis);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    forceLogout: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.forceLogout(req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteAccount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield security_service_1.default.deleteAccount(req.user);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getAuditLog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const log = yield security_service_1.default.getAuditLog(req.user);
            res.json(log);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    validatePrivacy: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.validatePrivacy(req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    lockdown: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield security_service_1.default.lockdown(req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = securityController;
//# sourceMappingURL=security.controller.js.map