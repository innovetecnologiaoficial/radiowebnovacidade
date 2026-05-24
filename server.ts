import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // RSS Feed Proxy Endpoint
  app.get("/api/rss", async (req, res) => {
    try {
      const response = await fetch("https://www.vitrinedosul.com.br/rss.xml", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/xml, text/xml, */*"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.send(text);
    } catch (error: any) {
      console.error("Error in RSS Proxy:", error);
      res.status(500).json({ error: error.message || "Failed to fetch RSS feed" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development or serving compiled files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Web Nova Cidade running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
