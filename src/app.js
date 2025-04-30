import express from "express"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import compression from "compression"
import cors from "cors"
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./config/swagger.js"
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"
import sanitizeMiddleware from './middleware/sanatizeMiddleware.js';
import postRoutes from './routes/postRoutes.js';
import { protect, restrictTo } from "./middleware/authMiddleware.js"

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(sanitizeMiddleware);
app.use(compression());
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(cookieParser())

// API Documentation
app.use('/api-docs', protect, restrictTo('admin'), swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/posts', postRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to Taskify API',
        data: null,
    })
})

app.use(notFound)
app.use(errorHandler)

export default app