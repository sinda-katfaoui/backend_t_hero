const fs   = require("fs");
const path = require("path");

// Logs go to root /logs/doc.log — not inside middlewares folder
const logsDirectory = path.join(__dirname, "../logs");
const logFilePath   = path.join(logsDirectory, "doc.log");

// Create logs folder and file automatically if they don't exist
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "");
}

function logMiddleware(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    appendLog(req, res, startTime);
  });

  next();
}

function appendLog(req, res, startTime) {
  const executionTime = Date.now() - startTime;

  // Sanitize body — never log passwords or tokens
  let safeBody = "N/A";
  if (req.body && Object.keys(req.body).length > 0) {
    const { motDePasse, password, token, ...safeFields } = req.body;
    safeBody = JSON.stringify(safeFields);
  }

  // Only log safe headers — never log Authorization token
  const safeHeaders = {
    "content-type":  req.headers["content-type"] || "N/A",
    "user-agent":    req.headers["user-agent"]    || "N/A",
  };

  const referer = req.headers.referer || "N/A";

  const log =
    `[${new Date().toISOString()}]` +
    ` - ${req.method}` +
    ` - ${req.originalUrl}` +
    ` - Status: ${res.statusCode}` +
    ` - ExecutionTime: ${executionTime}ms` +
    ` - Referer: ${referer}` +
    ` - Body: ${safeBody}` +
    ` - Headers: ${JSON.stringify(safeHeaders)}\n`;

  fs.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.error("Log write error:", err);
    }
  });
}

module.exports = logMiddleware;