const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// Load .env file
function loadEnv() {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    });
  } catch {}
}

loadEnv();

// MIME types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// ─── Import the chat handler ──────────────────────────────────────────────────
// We use dynamic import for ESM module support
let chatHandler;
async function getChatHandler() {
  if (!chatHandler) {
    const mod = await import("./api/chat.js");
    chatHandler = mod.default;
  }
  return chatHandler;
}

// ─── Simple mock of Vercel req/res for the handler ───────────────────────────
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function createMockRes(nodeRes) {
  const mockRes = {
    _statusCode: 200,
    _headers: {},
    status(code) {
      this._statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this._headers[k] = v;
      return this;
    },
    json(data) {
      const body = JSON.stringify(data);
      Object.entries(this._headers).forEach(([k, v]) =>
        nodeRes.setHeader(k, v),
      );
      nodeRes.setHeader("Content-Type", "application/json");
      nodeRes.writeHead(this._statusCode);
      nodeRes.end(body);
    },
  };
  return mockRes;
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer(async (req, nodeRes) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Route: /api/chat
  if (pathname === "/api/chat") {
    try {
      const body = await parseBody(req);
      const mockReq = {
        method: req.method,
        headers: req.headers,
        body,
        socket: { remoteAddress: req.socket.remoteAddress },
      };
      const mockRes = createMockRes(nodeRes);
      const handler = await getChatHandler();
      await handler(mockReq, mockRes);
    } catch (err) {
      console.error("Handler error:", err);
      nodeRes.writeHead(500, { "Content-Type": "application/json" });
      nodeRes.end(JSON.stringify({ error: "Internal server error" }));
    }
    return;
  }

  // Route: Static files
  let filePath = pathname === "/" ? "/index.html" : pathname;
  filePath = path.join(__dirname, filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    nodeRes.writeHead(403);
    nodeRes.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        nodeRes.writeHead(404, { "Content-Type": "text/plain" });
        nodeRes.end("404 Not Found");
      } else {
        nodeRes.writeHead(500, { "Content-Type": "text/plain" });
        nodeRes.end("500 Internal Server Error");
      }
      return;
    }
    nodeRes.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    });
    nodeRes.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(
    `\n🚀 Portfolio dev server running at: http://localhost:${PORT}\n`,
  );
  console.log(`   API endpoint:   POST http://localhost:${PORT}/api/chat`);
  console.log(
    `   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here" ? "✅ Loaded" : "❌ Not set — add your key to .env"}`,
  );
  console.log(`\n   Press Ctrl+C to stop.\n`);
});
