import serverless from "serverless-http"
import { getApp, getApiBasePath } from "../app-setup.js"

let handler

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function vercelHandler(req, res) {
    if (!handler) {
        const app = await getApp()
        handler = serverless(app)
    }

    const basePath = getApiBasePath() || "/api"
    if (!req.url.startsWith(basePath)) {
        req.url = `${basePath}${req.url === "/" ? "" : req.url}`
    }

    return handler(req, res)
}

