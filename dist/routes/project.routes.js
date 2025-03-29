"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = __importDefault(require("../controllers/project.controller"));
const middlewareHelper_1 = require("../utils/middlewareHelper");
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
// Basic project operations
router.post('/', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.createProject);
router.get('/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.getProject);
router.put('/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.updateProject);
router.delete('/:id', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['admin', 'owner']), project_controller_1.default.deleteProject);
// Team and access management
router.post('/:id/assign', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['owner', 'manager']), project_controller_1.default.assignUser);
router.delete('/:id/remove/:userId', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['owner', 'manager']), project_controller_1.default.removeUser);
router.post('/:id/lock', (0, middlewareHelper_1.auth)(auth_middleware_1.default), (0, middlewareHelper_1.rbac)(rbac_middleware_1.rbacMiddleware, ['owner', 'studio']), project_controller_1.default.lockProject);
// Project data operations
router.get('/:id/history', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.getProjectHistory);
router.post('/:id/version', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.saveProjectVersion);
router.get('/:id/access', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.getProjectAccess);
router.get('/user/all', (0, middlewareHelper_1.auth)(auth_middleware_1.default), project_controller_1.default.getUserProjects);
exports.default = router;
//# sourceMappingURL=project.routes.js.map