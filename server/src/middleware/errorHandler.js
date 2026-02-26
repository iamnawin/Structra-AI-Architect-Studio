export function notFound(req, res) {
  res.status(404).json({
    error: 'not_found',
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  });
}

export function errorHandler(err, req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const isOperational = status < 500;

  if (!isOperational) {
    console.error(`[error] ${err.message}`, { requestId: req.id, stack: err.stack });
  }

  res.status(status).json({
    error: err.code ?? 'internal_error',
    message: isOperational ? err.message : 'An unexpected error occurred',
    requestId: req.id,
  });
}

export function createError(status, code, message) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
}
