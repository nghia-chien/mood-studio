import * as packageService from './package.service.js';

export async function getPublicPackagesByConceptId(req, res, next) {
  try {
    const packages = await packageService.getPublicPackagesByConceptId(req.params.id);
    res.status(200).json({
      success: true,
      data: packages
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPackages(req, res, next) {
  try {
    const { conceptId, status, page, limit } = req.query;
    const result = await packageService.getAdminPackages({ conceptId, status, page, limit });
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPackageById(req, res, next) {
  try {
    const pkg = await packageService.getPackageById(req.params.id);
    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (error) {
    next(error);
  }
}

export async function createPackage(req, res, next) {
  try {
    const pkg = await packageService.createPackage(req.body);
    res.status(201).json({
      success: true,
      data: pkg
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePackage(req, res, next) {
  try {
    const pkg = await packageService.updatePackage(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: pkg
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePackage(req, res, next) {
  try {
    const result = await packageService.deletePackage(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
