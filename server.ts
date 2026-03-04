import express from "express";
import { createServer as createViteServer } from "vite";
import fs from 'fs';
import path from 'path';
import { 
    DEFAULT_ROLES, 
    DEFAULT_USERS, 
    DEFAULT_PLANS, 
    DEFAULT_ANNUAL_PLANS_META, 
    DEFAULT_QC_LOGS, 
    DEFAULT_MISSION_CONFIG, 
    DEFAULT_LEADER_CONFIG, 
    DEFAULT_MEMBER_CONFIG, 
    DEFAULT_PROGRAM_CONFIG 
} from './src/constants';

// Simple file-based DB
const DB_FILE = path.join(process.cwd(), 'data.json');

// Initial Data Structure
const INITIAL_DATA = {
    app_roles: DEFAULT_ROLES,
    app_users: DEFAULT_USERS,
    app_plans: DEFAULT_PLANS,
    app_plans_meta: DEFAULT_ANNUAL_PLANS_META,
    app_qc_logs: DEFAULT_QC_LOGS,
    app_followup_items: [],
    app_activity_logs: [],
    app_config_mission: DEFAULT_MISSION_CONFIG,
    app_config_leader: DEFAULT_LEADER_CONFIG,
    app_config_member: DEFAULT_MEMBER_CONFIG,
    app_config_program: DEFAULT_PROGRAM_CONFIG
};

// Load DB
let dbData = { ...INITIAL_DATA };
if (fs.existsSync(DB_FILE)) {
    try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        dbData = { ...INITIAL_DATA, ...JSON.parse(fileContent) };
    } catch (e) {
        console.error("Error reading DB file, using defaults", e);
    }
} else {
    // Write initial defaults
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
}

// Save DB Helper
const saveDB = () => {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Get All Data (Initial Load)
  app.get("/api/data", (req, res) => {
    res.json(dbData);
  });

  // Update Specific Key
  app.post("/api/data/:key", (req, res) => {
      const { key } = req.params;
      const { value } = req.body;

      if (key in dbData) {
          // @ts-ignore
          dbData[key] = value;
          saveDB();
          res.json({ success: true });
      } else {
          res.status(400).json({ error: "Invalid key" });
      }
  });

  // Reset Data (Optional, for testing)
  app.post("/api/reset", (req, res) => {
      dbData = { ...INITIAL_DATA };
      saveDB();
      res.json({ success: true });
  });

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
      // Serve static files in production (if built)
      app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
