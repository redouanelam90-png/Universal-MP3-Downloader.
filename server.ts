import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint to get video info
  app.post("/api/info", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      if (ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        res.json({
          title: info.videoDetails.title,
          thumbnail: info.videoDetails.thumbnails[0].url,
          duration: info.videoDetails.lengthSeconds,
        });
      } else {
        // For non-YouTube URLs, we might need another library
        // For now, let's just support YouTube
        res.status(400).json({ error: "Only YouTube URLs are supported currently due to environment limitations." });
      }
    } catch (error: any) {
      console.error("Info error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch video info" });
    }
  });

  // API Endpoint to download MP3
  app.get("/api/download", async (req, res) => {
    const url = req.query.url as string;
    if (!url) return res.status(400).send("URL is required");

    try {
      if (ytdl.validateURL(url)) {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        res.setHeader("Content-Disposition", `attachment; filename="${title}.mp3"`);
        res.setHeader("Content-Type", "audio/mpeg");

        // Use ytdl to get audio only stream
        const stream = ytdl(url, {
          quality: "highestaudio",
          filter: "audioonly",
        });

        stream.pipe(res);
      } else {
        res.status(400).send("Only YouTube URLs are supported currently.");
      }
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).send(error.message || "Failed to download audio");
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
