import { Router } from 'express';
import projectController from '../controllers/project.controller';
import authMiddleware from '../middleware/auth.middleware';
import rbacMiddleware from '../middleware/rbac.middleware';

const router = Router();

// Create new project
router.post('/', authMiddleware, projectController.createProject);

// Get project details
router.get('/:id', authMiddleware, projectController.getProject);

// Update project metadata
router.put('/:id', authMiddleware, projectController.updateProject);

// Delete or archive project (admin/owner only)
router.delete('/:id', authMiddleware, rbacMiddleware(['admin', 'owner']), projectController.deleteProject);

// Assign user to project (owner/manager only)
router.post('/:id/assign', authMiddleware, rbacMiddleware(['owner', 'manager']), projectController.assignUser);

// Remove user from project (owner/manager only)
router.delete('/:id/remove/:userId', authMiddleware, rbacMiddleware(['owner', 'manager']), projectController.removeUser);

// Lock project (studio level or above)
router.post('/:id/lock', authMiddleware, rbacMiddleware(['owner', 'studio']), projectController.lockProject);

// Get project history (versions and sessions)
router.get('/:id/history', authMiddleware, projectController.getProjectHistory);

// Save new project version
router.post('/:id/version', authMiddleware, projectController.saveProjectVersion);

// Get access list (users/roles with access)
router.get('/:id/access', authMiddleware, projectController.getProjectAccess);

export default router;
