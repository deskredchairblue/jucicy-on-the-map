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
const project_service_1 = __importDefault(require("../services/project.service"));
const projectController = {
    createProject: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const project = yield project_service_1.default.createProject(req.body, req.user);
            res.status(201).json(project);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getProject: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const project = yield project_service_1.default.getProject(req.params.id, req.user);
            if (!project)
                return res.status(404).json({ error: 'Project not found' });
            res.json(project);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    updateProject: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const project = yield project_service_1.default.updateProject(req.params.id, req.body, req.user);
            res.json(project);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteProject: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield project_service_1.default.deleteProject(req.params.id, req.user);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    assignUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield project_service_1.default.assignUser(req.params.id, req.body, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    removeUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield project_service_1.default.removeUser(req.params.id, req.params.userId, req.user);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    lockProject: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield project_service_1.default.lockProject(req.params.id, req.user);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getProjectHistory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const history = yield project_service_1.default.getProjectHistory(req.params.id, req.user);
            res.json(history);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    saveProjectVersion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const version = yield project_service_1.default.saveProjectVersion(req.params.id, req.body, req.user);
            res.status(201).json(version);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getProjectAccess: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const access = yield project_service_1.default.getProjectAccess(req.params.id, req.user);
            res.json(access);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
};
exports.default = projectController;
//# sourceMappingURL=project.controller.js.map