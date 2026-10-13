export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');

  // Only log detailed stack in non-production or for unexpected 500s
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  }

  res.status(status).json({
    success: false,
    error: {
      message,
      code,
      details: err.details || null
    }
  });
}
