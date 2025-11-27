import { createServer } from "http"
import { Server } from "socket.io"
import mongoose from "mongoose"
import { getApp } from "./app-setup.js"
import { logger } from "./utils/logger.js"
import { setSocketServerInstance } from "./utils/socket.js"

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        const app = await getApp()
        const server = createServer(app)
        const io = new Server(server, {
            cors: {
                origin:
                    process.env.NODE_ENV === "production"
                        ? [
                            "https://lifelink.health", 
                            "https://life-link-wt.vercel.app",
                            "https://life-link-git-map-kingshivams-projects.vercel.app"
                          ]
                        : ["http://localhost:3000", "http://localhost:5173"],
                methods: ["GET", "POST"],
            },
        })

        setSocketServerInstance(io)

        io.on("connection", (socket) => {
            logger.info(`User connected: ${socket.id}`)

            socket.on("join-location", (location) => {
                socket.join(`location-${location.city}`)
                logger.info(`User ${socket.id} joined location: ${location.city}`)
            })

            socket.on("emergency-request", (data) => {
                socket.to(`location-${data.city}`).emit("new-emergency", data)
                logger.info(`Emergency request broadcasted in ${data.city}`)
            })

            socket.on("donor-available", (data) => {
                socket.to(`location-${data.city}`).emit("donor-available", data)
                logger.info(
                    `Donor availability broadcasted: ${data.bloodType} in ${data.city}`
                )
            })

            socket.on("disconnect", () => {
                logger.info(`User disconnected: ${socket.id}`)
            })
        })

        server.listen(PORT, () => {
            logger.info(`LifeLink API Server running on port ${PORT}`)
            console.log(`LifeLink API Server running on port ${PORT}`)
            console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
            console.log("Socket.IO enabled for real-time features")
        })

        const shutdown = () => {
            logger.info("Shutdown signal received. Closing server...")
            server.close(() => {
                mongoose.connection.close()
                logger.info("Server closed. Database connection closed.")
                process.exit(0)
            })
        }

        process.on("SIGTERM", shutdown)
        process.on("SIGINT", shutdown)
    } catch (error) {
        logger.error("Server startup error", error)
        process.exit(1)
    }
}

startServer()
