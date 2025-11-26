import express from "express"
import serverless from "serverless-http"
import { getApp, getApiBasePath } from "../app-setup.js"

let handler

export const config = {
    api: {
        bodyParser: false,
    },
}

app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "LifeLink API is running",
        timestamp: new Date().toISOString(),
    })
})

export default async function vercelHandler(req, res) {
    // Fast health check without DB connection
    if (req.url === "/" || req.url === "/api" || req.url === "/api/") {
        return res.status(200).json({
            status: "OK",
            message: "LifeLink API is running",
            timestamp: new Date().toISOString(),
        })
    }

    try {
        if (!handler) {
            const app = await getApp()
            handler = serverless(app)
        }

        const basePath = getApiBasePath() || "/api"
        if (!req.url.startsWith(basePath)) {
            req.url = `${basePath}${req.url === "/" ? "" : req.url}`
        }

        return handler(req, res)
    } catch (error) {
        console.error("Handler error:", error)
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message || "An error occurred",
        })
    }
}

