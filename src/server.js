import "dotenv/config"
import http from "http"
import app from "./app.js"
import { connectDb } from "./config/connectDb.js"
import { connectRedis } from "./config/redis.js"

const server = http.createServer(app)

const PORT = process.env.PORT || 5000
console.log("port", PORT)

connectDb()
connectRedis()

server.listen(PORT, () => console.log(`http://localhost:${PORT}`))