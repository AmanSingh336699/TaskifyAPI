import redisClient from "../config/redis.js"
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis"

const createLimiter = ({ windowMinutes, maxRequests, message, keyPrefix }) => {
    return rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        max: maxRequests,
        message: {
            status: 'error',
            message,
            code: 429,
            data: null,
        },
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            client: redisClient
        }),
        keyGenerator: (req) => {
            const identifier = keyPrefix === 'otp' ? (req.body.email || req.ip) : req.ip;
            return `${keyPrefix}:${identifier}`
        },
        handler: (req, res) => {
            res.status(429).json({
                status: 'error',
                message: message,
                code: 429,
                data: null
            })
        }
    })
}

export const loginLimiter = createLimiter({
    windowMinutes: 15,
    maxRequests: process.env.NODE_ENV === 'production' ? 10 : 30,
    message: 'Too many login attempts, please try again after 15 minutes',
    keyPrefix: 'login',
})

export const otpLimiter = createLimiter({
    windowMinutes: 10,
    maxRequests: process.env.NODE_ENV === 'production' ? 3 : 10,
    message: 'Too many OTP requests, please try again after 10 minutes',
    keyPrefix: 'otp',
})

export const apiLimiter = createLimiter({
    windowMinutes: 15,
    maxRequests: process.env.NODE_ENV === 'production' ? 100 : 500,
    message: 'Too many requests, please try again after 15 minutes',
    keyPrefix: 'api',
})