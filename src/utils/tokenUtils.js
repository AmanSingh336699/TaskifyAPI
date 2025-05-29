import jwt from 'jsonwebtoken';
import parseTimeToSeconds from './parseTime.js';
import { hashToken } from '../helper/helper.js';
import redisClient from '../config/redis.js';

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY }
  );
};

export const storeRefreshToken = async (userId, token) => {
  const expiryString = process.env.JWT_REFRESH_EXPIRY || '7d';
  const expiryInSeconds = parseTimeToSeconds(expiryString);
  const hashedToken = hashToken(token);
  await redisClient.set(
    `refresh_token:${userId}`,
    hashedToken,
    'EX',
    expiryInSeconds
  );
};

export const deleteRefreshToken = async (userId) => {
  await redisClient.del(`refresh_token:${userId}`);
};

export const setToken = (res, accessToken, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 9 * 24 * 60 * 60 * 1000,
  });
  return {
    accessToken,
  };
};