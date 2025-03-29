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
const errorHandler_1 = require("../utils/errorHandler");
const database_1 = require("../database");
const User_1 = require("../models/User");
const Project_1 = require("../models/Project");
const ProjectAccess_1 = require("../models/ProjectAccess");
const logger_1 = __importDefault(require("../utils/logger"));
class ProjectService {
    /**
     * Create a new project
     */
    createProject(userId, name, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                // Find user
                const user = yield userRepository.findOne({
                    where: { id: userId }
                });
                if (!user) {
                    throw new errorHandler_1.ApiError('User not found', 404);
                }
                // Create project
                const project = new Project_1.Project();
                project.name = name;
                project.description = description || '';
                project.owner = user;
                yield projectRepository.save(project);
                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    ownerId: user.id,
                    createdAt: project.createdAt
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Create project error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to create project', 500);
            }
        });
    }
    /**
     * Get a project by ID
     */
    getProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Check if user has access to this project
                const userAccess = yield projectAccessRepository.findOne({
                    where: {
                        project: { id: projectId },
                        user: { id: userId }
                    }
                });
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner or has access
                if (project.owner.id !== userId && !userAccess) {
                    throw new errorHandler_1.ApiError('You do not have access to this project', 403);
                }
                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    ownerId: project.owner.id,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Get project error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get project', 500);
            }
        });
    }
    /**
     * Update a project
     */
    updateProject(userId, projectId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner
                if (project.owner.id !== userId) {
                    // Check if user has edit access
                    const userAccess = yield projectAccessRepository.findOne({
                        where: {
                            project: { id: projectId },
                            user: { id: userId },
                            role: 'editor' // Assuming 'editor' role can update
                        }
                    });
                    if (!userAccess) {
                        throw new errorHandler_1.ApiError('You do not have permission to update this project', 403);
                    }
                }
                // Update project fields if provided
                if (updateData.name !== undefined)
                    project.name = updateData.name;
                if (updateData.description !== undefined)
                    project.description = updateData.description;
                yield projectRepository.save(project);
                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    ownerId: project.owner.id,
                    updatedAt: project.updatedAt
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Update project error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to update project', 500);
            }
        });
    }
    /**
     * Delete a project
     */
    deleteProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner
                if (project.owner.id !== userId) {
                    throw new errorHandler_1.ApiError('You do not have permission to delete this project', 403);
                }
                yield projectRepository.remove(project);
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Delete project error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to delete project', 500);
            }
        });
    }
    /**
     * Get all projects for a user
     */
    getUserProjects(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Get projects user owns
                const ownedProjects = yield projectRepository.find({
                    where: { owner: { id: userId } },
                    relations: ['owner']
                });
                // Get projects user has access to
                const accessEntries = yield projectAccessRepository.find({
                    where: { user: { id: userId } },
                    relations: ['project', 'project.owner']
                });
                const accessProjects = accessEntries.map(entry => entry.project);
                // Combine and format results
                const allProjects = [...ownedProjects, ...accessProjects].map(project => ({
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    ownerId: project.owner.id,
                    isOwner: project.owner.id === userId,
                    createdAt: project.createdAt,
                    updatedAt: project.updatedAt
                }));
                return allProjects;
            }
            catch (error) {
                logger_1.default.error(`Get user projects error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get user projects', 500);
            }
        });
    }
    /**
     * Assign a user to a project
     */
    assignUser(userId, projectId, userIdToAssign, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userRepository = database_1.AppDataSource.getRepository(User_1.User);
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner
                if (project.owner.id !== userId) {
                    throw new errorHandler_1.ApiError('You do not have permission to assign users to this project', 403);
                }
                // Find user to assign
                const userToAssign = yield userRepository.findOne({
                    where: { id: userIdToAssign }
                });
                if (!userToAssign) {
                    throw new errorHandler_1.ApiError('User to assign not found', 404);
                }
                // Check if user already has access
                const existingAccess = yield projectAccessRepository.findOne({
                    where: {
                        project: { id: projectId },
                        user: { id: userIdToAssign }
                    }
                });
                if (existingAccess) {
                    // Update role if already exists
                    existingAccess.role = role;
                    yield projectAccessRepository.save(existingAccess);
                    return {
                        id: existingAccess.id,
                        projectId,
                        userId: userIdToAssign,
                        role
                    };
                }
                // Create new access
                const access = new ProjectAccess_1.ProjectAccess();
                access.project = project;
                access.user = userToAssign;
                access.role = role;
                access.permissions = this.getRolePermissions(role);
                yield projectAccessRepository.save(access);
                return {
                    id: access.id,
                    projectId,
                    userId: userIdToAssign,
                    role
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Assign user error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to assign user to project', 500);
            }
        });
    }
    /**
     * Remove a user from a project
     */
    removeUser(userId, projectId, userIdToRemove) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner
                if (project.owner.id !== userId) {
                    throw new errorHandler_1.ApiError('You do not have permission to remove users from this project', 403);
                }
                // Cannot remove the owner
                if (project.owner.id === userIdToRemove) {
                    throw new errorHandler_1.ApiError('Cannot remove the project owner', 400);
                }
                // Find access entry to remove
                const accessEntry = yield projectAccessRepository.findOne({
                    where: {
                        project: { id: projectId },
                        user: { id: userIdToRemove }
                    }
                });
                if (!accessEntry) {
                    throw new errorHandler_1.ApiError('User does not have access to this project', 404);
                }
                // Remove access
                yield projectAccessRepository.remove(accessEntry);
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Remove user error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to remove user from project', 500);
            }
        });
    }
    /**
     * Lock a project
     */
    lockProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user is owner
                if (project.owner.id !== userId) {
                    throw new errorHandler_1.ApiError('You do not have permission to lock this project', 403);
                }
                // Lock project (in a real implementation, you would set a locked flag)
                project.locked = true;
                yield projectRepository.save(project);
                return true;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Lock project error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to lock project', 500);
            }
        });
    }
    /**
     * Get project history
     */
    getProjectHistory(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user has access
                if (project.owner.id !== userId) {
                    const userAccess = yield projectAccessRepository.findOne({
                        where: {
                            project: { id: projectId },
                            user: { id: userId }
                        }
                    });
                    if (!userAccess) {
                        throw new errorHandler_1.ApiError('You do not have access to this project', 403);
                    }
                }
                // In a real implementation, you would fetch history from a separate table
                // For now, return mock history
                const mockHistory = [
                    {
                        id: '1',
                        version: '1.0',
                        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        userId,
                        changes: 'Initial version'
                    },
                    {
                        id: '2',
                        version: '1.1',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                        userId,
                        changes: 'Updated project settings'
                    },
                    {
                        id: '3',
                        version: '1.2',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                        userId,
                        changes: 'Added new feature'
                    }
                ];
                return mockHistory;
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Get project history error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get project history', 500);
            }
        });
    }
    /**
     * Save a version of the project
     */
    saveProjectVersion(userId, projectId, versionName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user has edit access
                if (project.owner.id !== userId) {
                    const userAccess = yield projectAccessRepository.findOne({
                        where: {
                            project: { id: projectId },
                            user: { id: userId },
                            role: 'editor' // Assuming 'editor' role can save versions
                        }
                    });
                    if (!userAccess) {
                        throw new errorHandler_1.ApiError('You do not have permission to save versions of this project', 403);
                    }
                }
                // In a real implementation, you would save to a versions table
                // For now, return mock result
                return {
                    id: Math.random().toString(36).substring(2, 15),
                    projectId,
                    versionName,
                    createdAt: new Date(),
                    userId
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Save project version error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to save project version', 500);
            }
        });
    }
    /**
     * Get project access information
     */
    getProjectAccess(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projectRepository = database_1.AppDataSource.getRepository(Project_1.Project);
                const projectAccessRepository = database_1.AppDataSource.getRepository(ProjectAccess_1.ProjectAccess);
                // Find project
                const project = yield projectRepository.findOne({
                    where: { id: projectId },
                    relations: ['owner']
                });
                if (!project) {
                    throw new errorHandler_1.ApiError('Project not found', 404);
                }
                // Check if user has access
                if (project.owner.id !== userId) {
                    const userAccess = yield projectAccessRepository.findOne({
                        where: {
                            project: { id: projectId },
                            user: { id: userId }
                        }
                    });
                    if (!userAccess) {
                        throw new errorHandler_1.ApiError('You do not have access to this project', 403);
                    }
                }
                // Get all access entries for this project
                const accessEntries = yield projectAccessRepository.find({
                    where: { project: { id: projectId } },
                    relations: ['user']
                });
                // Format the access entries
                const formattedEntries = accessEntries.map(entry => ({
                    id: entry.id,
                    userId: entry.user.id,
                    email: entry.user.email,
                    role: entry.role,
                    permissions: entry.permissions,
                    createdAt: entry.createdAt
                }));
                return {
                    owner: {
                        id: project.owner.id,
                        email: project.owner.email
                    },
                    accessList: formattedEntries
                };
            }
            catch (error) {
                if (error instanceof errorHandler_1.ApiError) {
                    throw error;
                }
                logger_1.default.error(`Get project access error: ${error}`);
                throw new errorHandler_1.ApiError('Failed to get project access', 500);
            }
        });
    }
    /**
     * Helper method to get permissions for a role
     */
    getRolePermissions(role) {
        switch (role.toLowerCase()) {
            case 'admin':
                return ['read', 'write', 'delete', 'manage'];
            case 'editor':
                return ['read', 'write'];
            case 'viewer':
                return ['read'];
            default:
                return ['read'];
        }
    }
}
exports.default = new ProjectService();
//# sourceMappingURL=project.service.js.map