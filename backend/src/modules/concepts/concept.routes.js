import { Router } from 'express';
import * as conceptController from './concept.controller.js';
import { authenticateAdmin } from '../../middlewares/auth.js';

export const publicConceptRouter = Router();
publicConceptRouter.get('/', conceptController.getPublicConcepts);
publicConceptRouter.get('/:slug', conceptController.getPublicConceptBySlug);

export const adminConceptRouter = Router();
adminConceptRouter.use(authenticateAdmin);
adminConceptRouter.get('/', conceptController.getAdminConcepts);
adminConceptRouter.post('/', conceptController.createConcept);
adminConceptRouter.get('/:id', conceptController.getAdminConceptById);
adminConceptRouter.patch('/:id', conceptController.updateConcept);
adminConceptRouter.delete('/:id', conceptController.deleteConcept);
