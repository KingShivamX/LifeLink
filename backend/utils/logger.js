import fs from "fs"
import path from "path"
import winston from "winston"

const logDir = path.join(process.cwd(), "logs")
const transports = []
const level = process.env.LOG_LEVEL || "info"
const isFileLoggingEnabled = !process.env.VERCEL && !process.env.DISABLE_FILE_LOGS

const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true })
)

if (isFileLoggingEnabled) {
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
    }

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        })
    )

    transports.push(
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        })
    )
}

transports.push(
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString =
                    meta && Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 2)}` : ""
                return `${timestamp} [${level}]: ${message}${metaString}`
            })
        ),
    })
)

const logger = winston.createLogger({
    level,
    format: winston.format.combine(baseFormat, winston.format.json()),
    defaultMeta: { service: "lifelink-api" },
    transports,
})

export { logger }
