import Redis from "ioredis"

const redisClient = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
    },
    maxRetriesPerRequest: 3
})

export const connectRedis = async () => {
    try {
        redisClient.ping()
        console.log("connecting redis")
    } catch (error) {
        console.log("error connecting redis", error)
        process.exit(1)
    }
}

redisClient.on('error', (err) => {
    console.error(`Redis error: ${err.message}`);
});
  
redisClient.on('connect', () => {
    console.info('Redis client connecting');
});

redisClient.on('ready', () => {
    console.info('Redis client ready');
});

redisClient.on('close', () => {
    console.info('Redis client closed connection');
});

export default redisClient