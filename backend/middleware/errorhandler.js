const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server Error';
  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid ID'; }
  if (err.code === 11000) { statusCode = 400; message = `${Object.keys(err.keyValue)} already exists`; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  res.status(statusCode).json({ message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
};
module.exports = errorHandler;