
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    let message = err.message;
    if (err.name === 'CastError') {
      message = `Resource not found with id of ${err.value}`;
    }
  
    if (err.name === 'ValidationError') {
      message = Object.values(err.errors).map(val => val.message).join(', ');
    }
  
    if (err.code && err.code === 11000) {
      message = `Duplicate field value entered`;
    }
  
    if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }
    if (err.name === 'TokenExpiredError') {
      message = 'Token has expired';
    }
  
    res.status(statusCode).json({
      status: 'error',
      message,
      code: statusCode,
      data: null,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  };