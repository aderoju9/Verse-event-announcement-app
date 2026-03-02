import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

// --- PERSISTENCE CONFIGURATION ---
// 1. Check for Supabase (Permanent Storage for Vercel)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// 2. Fallback to SQLite (Temporary Storage for Local Dev)
const db = new Database("stats.db");
db.exec(`CREATE TABLE IF NOT EXISTS stats (key TEXT PRIMARY KEY, value INTEGER)`);
if (!db.prepare("SELECT value FROM stats WHERE key = ?").get("total_visitors")) {
  db.prepare("INSERT INTO stats (key, value) VALUES (?, ?)").run("total_visitors", 0);
}

// --- SEED VALUE ---
// This ensures your total doesn't start from zero on Vercel.
// Updated to 109 to reflect your real tracked visitors.
const BASE_VISITOR_COUNT = 109; 

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  let activeUsers = 0;

  // Function to get current count from the best available source
  async function getPersistentCount(): Promise<number> {
    if (supabase) {
      try {
        // We assume a table named 'site_stats' with columns 'key' and 'value'
        const { data, error } = await supabase
          .from('site_stats')
          .select('value')
          .eq('key', 'total_visitors')
          .single();
        
        if (error || !data) {
          // If table doesn't exist or row missing, try to create it
          await supabase.from('site_stats').insert([{ key: 'total_visitors', value: 0 }]);
          return 0;
        }
        return data.value;
      } catch (err) {
        console.error("Supabase read error:", err);
      }
    }
    
    // Fallback to SQLite
    const row = db.prepare("SELECT value FROM stats WHERE key = ?").get("total_visitors") as { value: number };
    return row ? row.value : 0;
  }

  // Function to increment count in the best available source
  async function incrementPersistentCount() {
    if (supabase) {
      try {
        const current = await getPersistentCount();
        await supabase
          .from('site_stats')
          .update({ value: current + 1 })
          .eq('key', 'total_visitors');
        return;
      } catch (err) {
        console.error("Supabase increment error:", err);
      }
    }
    
    // Fallback to SQLite
    db.prepare("UPDATE stats SET value = value + 1 WHERE key = ?").run("total_visitors");
  }

  wss.on("connection", async (ws: WebSocket) => {
    activeUsers++;
    console.log(`New connection. Active users: ${activeUsers}`);
    
    await incrementPersistentCount();
    broadcastStats();

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === "INCREMENT_VISITORS") {
          await incrementPersistentCount();
          broadcastStats();
        }
      } catch (err) {
        console.error("Error handling message:", err);
      }
    });

    ws.on("close", () => {
      activeUsers--;
      broadcastStats();
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  async function broadcastStats() {
    try {
      const dbCount = await getPersistentCount();
      const totalVisitors = BASE_VISITOR_COUNT + dbCount;
      
      const message = JSON.stringify({ 
        type: "STATS_UPDATE", 
        activeCount: activeUsers,
        totalCount: totalVisitors
      });
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (err) {
      console.error("Broadcast error:", err);
    }
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
