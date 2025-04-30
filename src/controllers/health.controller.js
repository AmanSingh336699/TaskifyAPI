import mongoose from "mongoose";
import redisClient from "../config/redis.js";
import os from "os"
import { errorResponse, successResponse } from "../utils/responseUtils.js";

export const healthCheckController = async (req, res) => {
    const start = Date.now()
    const healthData = {
        status: "healthy",
        timestamp: new Date(),
        version: "1.0.0",
        uptime: process.uptime,
        hostname: os.hostname(),
        environment: process.env.NODE_ENV || 'development',
        services: {
            mongodb: {
                status: "unknown",
                responseTimeMs: null,
            },
            redis: {
                status: 'unknown',
                responseTimeMs: null,
            }
        }
    }
    try {
        const mongoStart = Date.now()
        const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
        healthData.services.mongodb.status = mongoStatus === 'connected' ? 'healthy' : 'unavailable'
        healthData.services.mongodb.responseTimeMs = Date.now() - mongoStart;
        
        const redisStart = Date.now()
        try {
            const redisPing = await redisClient.ping()
            healthData.services.redis.status = redisPing === 'PONG' ? 'healthy' : 'unavailable';
        } catch (error) {
            healthData.services.redis.status = 'unavailable';
        }
        healthData.services.redis.responseTimeMs = Date.now() - redisStart;

        if(healthData.services.mongodb.status !== 'healthy' ||
            healthData.services.redis.status !== 'healthy') {
                healthData.status = "degraded"
        }
        const totalDuration = Date.now() - start;
        healthData.responseTimeMs = totalDuration;
        return successResponse(res, 'Health check successful', 200, healthData);
    } catch (error) {
        return errorResponse(res, 'Health check failed', 500);
    }
}