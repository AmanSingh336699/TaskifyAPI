import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { promisify } from 'util';
import { errorResponse } from '../utils/responseUtils.js';
import redisClient from '../config/redis.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Not authorized, token missing', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Not authorized, token malformed', 401);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded?.id) {
      return errorResponse(res, 'Invalid token payload', 401);
    }

    const user = await User.findById(decoded.id).select('+isVerified +role');
    if (!user) {
      return errorResponse(res, 'User does not exist', 401);
    }

    if (!user.isVerified) {
      return errorResponse(res, 'Email is not verified', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, `Authorization failed: ${error.message}`, 500);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action', 403);
    }
    next();
  }
};

export const validateRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is missing', 401);
    }

    const decoded = await promisify(jwt.verify)(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (!decoded?.id) {
      return errorResponse(res, 'Invalid token payload', 401);
    }

    const redisKey = `refresh_token:user:${decoded.id}`;
    const storedToken = await redisClient.get(redisKey).catch(() => null);
    if (!storedToken || storedToken !== refreshToken) {
      return errorResponse(res, 'Refresh token is invalid or reused', 401);
    }

    const user = await User.findById(decoded.id).select('+isVerified +role');
    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, `Authentication failed: ${error.message}`, 500);
  }
};
