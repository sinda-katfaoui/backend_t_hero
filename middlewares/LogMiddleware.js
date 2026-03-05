// LogMiddleware.js
const fs = require("fs");
const path = require("path");

function logMiddleware(req, res, next) {
    const startTime = Date.now();

    res.on("finish", () => {
        appendLog(req, res, startTime);
    });

    next();
}

function appendLog(req, res, startTime) {
    const executionTime = Date.now() - startTime;

    const logsDirectory = path.join(__dirname, "logs");
    const logFilePath = path.join(logsDirectory, "doc.log");

    
    if (!fs.existsSync(logsDirectory) || !fs.existsSync(logFilePath)) {
        console.warn("Log file or directory missing. Logging skipped.");
        return;
    }

    const body =
        req.body && Object.keys(req.body).length > 0
            ? JSON.stringify(req.body)
            : "N/A";

    const headers = JSON.stringify(req.headers);
    const referer = req.headers.referer || "N/A";

    const log = `[${new Date().toISOString()}] - ${req.method} - ${
        req.originalUrl
    } - Status: ${res.statusCode} - ExecutionTime: ${executionTime}ms - Referer: ${referer} - Body: ${body} - Headers: ${headers}\n`;

    fs.appendFile(logFilePath, log, (err) => {
        if (err) {
            console.error("Log write error:", err);
        }
    });
}

module.exports = logMiddleware;