import express from "express"
import mongoose from "mongoose"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import compression from "compression"
import rateLimit from "express-rate-limit"
import donorRoutes from "./routes/donors.js"
import requestRoutes from "./routes/requests.js"
import emergencyRoutes from "./routes/emergency.js"
import authRoutes from "./routes/auth.js"
import analyticsRoutes from "./routes/analytics.js"
import { errorHandler } from "./middleware/errorHandler.js"
import { logger } from "./utils/logger.js"

const API_BASE_PATH = process.env.API_BASE_PATH || "/api"
const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://shivamhippalgave_db_user:ee8jd4FBOzPqLoUv@cluster0.gwufynq.mongodb.net/lifelink?retryWrites=true&w=majority&appName=Cluster0"

const defaultOrigins =
    process.env.NODE_ENV === "production"
        ? [
            "https://lifelink.health", 
            "https://life-link-wt.vercel.app",
            "https://life-link-git-map-kingshivams-projects.vercel.app"
          ]
        : ["http://localhost:3000", "http://localhost:5173"]
const originsEnv = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || ""
const customOrigins = originsEnv
    ? originsEnv
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean)
    : null

const allowedOrigins = customOrigins && customOrigins.length ? customOrigins : defaultOrigins

let cachedApp = null
let mongoPromise = null

const connectDatabase = async () => {
    if (mongoose.connection?.readyState === 1) {
        return mongoose.connection
    }

    if (!mongoPromise) {
        mongoPromise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 3000,
                socketTimeoutMS: 10000,
                maxPoolSize: 1,
                minPoolSize: 0,
                connectTimeoutMS: 3000,
            })
            .then((connection) => {
                logger.info("MongoDB connected")
                return connection
            })
            .catch((error) => {
                logger.error("MongoDB connection error", error)
                mongoPromise = null
                throw error
            })
    }

    return mongoPromise
}

const createAppInstance = async () => {
    await connectDatabase()

    const app = express()
    app.set("trust proxy", 1)

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
        })
    )

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            error: "Too many requests from this IP, please try again later.",
        },
    })

    const strictLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        message: {
            error: "Too many sensitive requests from this IP, please try again later.",
        },
    })

    app.use(`${API_BASE_PATH}/auth`, strictLimiter)
    app.use(`${API_BASE_PATH}/emergency`, strictLimiter)
    app.use(API_BASE_PATH, limiter)

    app.use(compression())
    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    )

    app.use(
        morgan("combined", {
            stream: {
                write: (message) => logger.info(message.trim()),
            },
        })
    )

    app.use(express.json({ limit: "10mb" }))
    app.use(express.urlencoded({ extended: true, limit: "10mb" }))

    app.get(`${API_BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: "OK",
            message: "LifeLink API is running",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        })
    })

    app.use(`${API_BASE_PATH}/auth`, authRoutes)
    app.use(`${API_BASE_PATH}/donors`, donorRoutes)
    app.use(`${API_BASE_PATH}/requests`, requestRoutes)
    app.use(`${API_BASE_PATH}/emergency`, emergencyRoutes)
    app.use(`${API_BASE_PATH}/analytics`, analyticsRoutes)

    app.use("*", (req, res) => {
        res.status(404).json({
            error: "Route not found",
            message: `Cannot ${req.method} ${req.originalUrl}`,
        })
    })

    app.use(errorHandler)

    return app
}

export const getApp = async () => {
    if (!cachedApp) {
        cachedApp = await createAppInstance()
    }
    return cachedApp
}

export const getApiBasePath = () => API_BASE_PATH

