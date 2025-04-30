import redisClient from "../config/redis.js"

export const setCache = async (key, data, ttl = 600) => {
    try {
        await redisClient.set(key, JSON.stringify(data), "EX", ttl)
        return true
    } catch (error) {
        console.error("Error setting cache", error.message)
        return false
    }
}

export const getCache = async (key) => {
    try {
        const cachedData = await redisClient.get(key)
        return cachedData ? JSON.parse(cachedData) : null
    } catch (error) {
        console.error("error getting cached", error.message)
        return null
    }
}

export const deleteCache = async (key) => {
    try {
        await redisClient.del(key)
        return true
    } catch (error) {
        console.error(`Error deleting cache: ${error.message}`);
        return false;
    }
}

export const deleteCacheByPattern = async (pattern) => {
    try {
        const stream = redisClient.scanStream({
            match: pattern,
            count: 100
        })
        stream.on("data", async (keys) => {
            if(keys.length) {
                const pipeline = redisClient.pipeline()
                keys.forEach((key) => pipeline.del(key))
                await pipeline.exec()
            }
        })
        stream.on("end", () => {
            console.log(`Finished deleting keys matching pattern: ${pattern}`)
        })
        stream.on('error', (err) => {
            console.error(`Error scanning keys for pattern deletion: ${err.message}`);
        })
        return true
    } catch (error) {
        console.error(`Error deleting cache by pattern: ${error.message}`);
        return false
    }
}

export const cacheMiddleware = (keyPrefix, ttl = 600) => {
    return async (req, res, next) => {
        if(req.method !== "GET"){
            return next()
        }
        const params = new URLSearchParams(req.query).toString()
        const key = `${keyPrefix}:${req.path}${params ? ":" + params : ""}`

        try {
            const cachedData = await getCache(key)
            if(cachedData){
                res.set("Cache-Control", `public, max-age=${ttl}`)
                return res.status(200).json({
                    ...cachedData,
                    cached: true,
                })
            }
            const originalJson = res.json.bind(res)
            res.json = async (data) => {
                try {
                    await setCache(key, data, ttl)
                } catch (error) {
                    console.error('Cache set error:', err.message);
                }
                return originalJson(data)
            }
            next()
        } catch (error) {
            console.log(`cached middleware error: ${error.message}`)
            next()
        }
    }
}