import * as conceptService from './concept.service.js';

export async function getPublicConcepts(req, res, next) {
  try {
    const concepts = await conceptService.getPublicConcepts();
    res.status(200).json({
      success: true,
      data: concepts
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicConceptBySlug(req, res, next) {
  try {
    const concept = await conceptService.getPublicConceptBySlug(req.params.slug);
    res.status(200).json({
      success: true,
      data: concept
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminConcepts(req, res, next) {
  try {
    const { page, limit, status } = req.query;
    const result = await conceptService.getAdminConcepts({ page, limit, status });
    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminConceptById(req, res, next) {
  try {
    const concept = await conceptService.getConceptById(req.params.id);
    res.status(200).json({
      success: true,
      data: concept
    });
  } catch (error) {
    next(error);
  }
}

export async function createConcept(req, res, next) {
  try {
    const concept = await conceptService.createConcept(req.body);
    res.status(201).json({
      success: true,
      data: concept
    });
  } catch (error) {
    next(error);
  }
}

export async function updateConcept(req, res, next) {
  try {
    const concept = await conceptService.updateConcept(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: concept
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteConcept(req, res, next) {
  try {
    const result = await conceptService.deleteConcept(req.params.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
