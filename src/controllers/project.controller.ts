import { Request, Response } from 'express';
import projectService from '../services/project.service';

const projectController = {
  createProject: async (req: Request, res: Response) => {
    try {
      const project = await projectService.createProject(req.body, req.user);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProject: async (req: Request, res: Response) => {
    try {
      const project = await projectService.getProject(req.params.id, req.user);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProject: async (req: Request, res: Response) => {
    try {
      const project = await projectService.updateProject(req.params.id, req.body, req.user);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteProject: async (req: Request, res: Response) => {
    try {
      await projectService.deleteProject(req.params.id, req.user);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  assignUser: async (req: Request, res: Response) => {
    try {
      const result = await projectService.assignUser(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeUser: async (req: Request, res: Response) => {
    try {
      await projectService.removeUser(req.params.id, req.params.userId, req.user);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  lockProject: async (req: Request, res: Response) => {
    try {
      const result = await projectService.lockProject(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectHistory: async (req: Request, res: Response) => {
    try {
      const history = await projectService.getProjectHistory(req.params.id, req.user);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  saveProjectVersion: async (req: Request, res: Response) => {
    try {
      const version = await projectService.saveProjectVersion(req.params.id, req.body, req.user);
      res.status(201).json(version);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProjectAccess: async (req: Request, res: Response) => {
    try {
      const access = await projectService.getProjectAccess(req.params.id, req.user);
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default projectController;
