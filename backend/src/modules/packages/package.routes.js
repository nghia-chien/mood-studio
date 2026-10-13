import { Router } from 'express';
import * as packageController from './package.controller.js';
import { authenticateAdmin } from '../../middlewares/auth.js';

export const publicPackageRouter = Router();
// Mounted under /api/public/concepts/:id/packages in app.js
publicPackageRouter.get('/:id/packages', packageController.getPublicPackagesByConceptId);

export const adminPackageRouter = Router();
adminPackageRouter.use(authenticateAdmin);
adminPackageRouter.get('/', packageController.getAdminPackages);
adminPackageRouter.post('/', packageController.createPackage);
adminPackageRouter.get('/:id', packageController.getAdminPackageById);
adminPackageRouter.patch('/:id', packageController.updatePackage);
adminPackageRouter.delete('/:id', packageController.deletePackage);
