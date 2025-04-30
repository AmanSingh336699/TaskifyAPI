import crypto from 'crypto';
import redisClient from '../config/redis.js';

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (email, otp) => {
  try {
    const key = `otp:${email}`;
    const otpString = String(otp);
    const expirySeconds = 300;

    try {
      await redisClient.set(key, otpString, { EX: expirySeconds });
    } catch {
      await redisClient.set(key, otpString, 'EX', expirySeconds);
    }
  } catch (error) {
    throw new Error(`Failed to store OTP: ${error.message}`);
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const storedOTP = await redisClient.get(`otp:${email}`);
    if (!storedOTP || storedOTP !== String(otp)) {
      return false;
    }
    await redisClient.del(`otp:${email}`);
    return true;
  } catch (error) {
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};
