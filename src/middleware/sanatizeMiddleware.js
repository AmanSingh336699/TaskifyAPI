const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    for (let key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/[<>]/g, '');
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
};

const sanitizeMiddleware = (req, res, next) => {
  if (!req || !res || typeof next !== 'function') {
    if (res && typeof res.status === 'function') {
      return res.status(500).json({ error: 'Invalid middleware context' });
    }
    return next(new Error('Invalid middleware context'));
  }

  sanitizeObject(req.query || {});
  sanitizeObject(req.body || {});
  sanitizeObject(req.params || {});

  next();
};

export default sanitizeMiddleware;
