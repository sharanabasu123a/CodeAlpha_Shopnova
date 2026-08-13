const notFound = (req, res, next) => {
  res.status(404).json({ error: { message: `Route not found: ${req.originalUrl}`, code: 'NOT_FOUND' } });
};

const errorHandler = (err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.originalUrl}`, err.message);

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ error: { message, code: 'VALIDATION' } });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: { message: 'Email already registered', code: 'CONFLICT' } });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: { message: err.message, code: err.code || 'BAD_REQUEST' } });
  }

  return res.status(500).json({ error: { message: 'Internal server error', code: 'SERVER_ERROR' } });
};

module.exports = { notFound, errorHandler };