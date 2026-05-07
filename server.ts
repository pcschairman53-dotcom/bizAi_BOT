import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/ping", (req, res) => {
    res.json({ status: "pong", time: new Date().toISOString() });
  });

  // API Proxy for Google Sheets to bypass CORS
  app.get("/api/leads", async (req, res) => {
    const API_URL = 'https://script.google.com/macros/s/AKfycbz7d8KTg4n41jXe4FJfsweQOvK94EmqG4OACdCsbtUXjVGo1YVEWcjJI-UUQjj6BleDuA/exec';
    
    const fetchWithRetry = async (retries = 3): Promise<any> => {
      try {
        console.log(`Fetching leads from Google Script (Retries left: ${retries})...`);
        const response = await axios.get(API_URL, {
          maxRedirects: 10,
          timeout: 60000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        return response.data;
      } catch (error: any) {
        // Retry on 500, 502, 503, 504 and timeout errors
        const isRetryable = !error.response || (error.response.status >= 500) || error.code === 'ECONNABORTED';
        
        if (retries > 0 && isRetryable) {
          const delay = (4 - retries) * 3000; // Exponential-ish backoff: 3s, 6s, 9s
          console.log(`Retrying fetch in ${delay}ms due to error: ${error.message} (Status: ${error.response?.status || 'TIMEOUT'})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1);
        }
        throw error;
      }
    };

    try {
      const data = await fetchWithRetry();
      res.json(data);
    } catch (error: any) {
      console.error('Proxy Fetch Error Exception:', error.message);
      if (error.response) {
        console.error('Error Status:', error.response.status);
        res.status(error.response.status).json({ error: `Source error: ${error.response.status}` });
      } else {
        res.status(500).json({ error: error.message });
      }
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
