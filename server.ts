import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const db = new Database("immorim.db");
const JWT_SECRET = process.env.JWT_SECRET || "immorim-secret-key-2024";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'admin', 'operator'
    status TEXT, -- 'active', 'inactive'
    language TEXT DEFAULT 'fr',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY, -- PRP-XXXXXX
    name TEXT,
    province TEXT,
    region TEXT,
    status TEXT, -- 'rented', 'available', 'maintenance'
    rent_amount REAL,
    payment_status TEXT, -- 'paid', 'unpaid', 'overdue', 'doubtful'
    type TEXT, -- 'apartment', 'villa', 'shop', 'office', 'warehouse'
    area REAL,
    rooms INTEGER,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tenants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    whatsapp TEXT,
    property_id TEXT,
    payment_status TEXT,
    id_card TEXT,
    rating TEXT, -- 'excellent', 'good', 'average', 'bad'
    notes TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT,
    tenant_id INTEGER,
    amount REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    operator_id INTEGER,
    method TEXT, -- 'cash', 'bank', 'check', 'mobile'
    status TEXT,
    receipt_path TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT,
    type TEXT,
    date DATETIME,
    cost REAL,
    status TEXT,
    provider TEXT,
    description TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id TEXT,
    tenant_id INTEGER,
    start_date DATETIME,
    end_date DATETIME,
    terms TEXT,
    status TEXT,
    document_path TEXT,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  CREATE TABLE IF NOT EXISTS operation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    operator_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES users(id)
  );
`);

// Seed default admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)").run("admin", hashedPassword, "admin", "active");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: "Account disabled" });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, language: user.language } });
  });

  // Users
  app.get("/api/users", authenticateToken, (req, res) => {
    const users = db.prepare("SELECT id, username, role, status, language, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/users", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    const { username, password, role, status } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
      db.prepare("INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)").run(username, hashedPassword, role, status);
      res.status(201).json({ message: "User created" });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.put("/api/users/:id", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin' && (req as any).user.id !== parseInt(req.params.id)) return res.sendStatus(403);
    const { username, role, status, password, language } = req.body;
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      db.prepare("UPDATE users SET username = ?, role = ?, status = ?, password = ?, language = ? WHERE id = ?").run(username, role, status, hashedPassword, language, req.params.id);
    } else {
      db.prepare("UPDATE users SET username = ?, role = ?, status = ?, language = ? WHERE id = ?").run(username, role, status, language, req.params.id);
    }
    res.json({ message: "User updated" });
  });

  app.delete("/api/users/:id", authenticateToken, (req, res) => {
    if ((req as any).user.role !== 'admin') return res.sendStatus(403);
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ message: "User deleted" });
  });

  // Properties
  app.get("/api/properties", authenticateToken, (req, res) => {
    const properties = db.prepare("SELECT * FROM properties").all();
    res.json(properties);
  });

  app.post("/api/properties", authenticateToken, (req, res) => {
    const { id, name, province, region, status, rent_amount, payment_status, type, area, rooms, description } = req.body;
    db.prepare(`INSERT INTO properties (id, name, province, region, status, rent_amount, payment_status, type, area, rooms, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, name, province, region, status, rent_amount, payment_status, type, area, rooms, description);
    res.status(201).json({ message: "Property created" });
  });

  app.put("/api/properties/:id", authenticateToken, (req, res) => {
    const { name, province, region, status, rent_amount, payment_status, type, area, rooms, description } = req.body;
    db.prepare(`UPDATE properties SET name = ?, province = ?, region = ?, status = ?, rent_amount = ?, payment_status = ?, type = ?, area = ?, rooms = ?, description = ? WHERE id = ?`)
      .run(name, province, region, status, rent_amount, payment_status, type, area, rooms, description, req.params.id);
    res.json({ message: "Property updated" });
  });

  app.delete("/api/properties/:id", authenticateToken, (req, res) => {
    db.prepare("DELETE FROM properties WHERE id = ?").run(req.params.id);
    res.json({ message: "Property deleted" });
  });

  // Tenants
  app.get("/api/tenants", authenticateToken, (req, res) => {
    const tenants = db.prepare("SELECT * FROM tenants").all();
    res.json(tenants);
  });

  app.post("/api/tenants", authenticateToken, (req, res) => {
    const { name, whatsapp, property_id, payment_status, id_card, rating, notes } = req.body;
    db.prepare(`INSERT INTO tenants (name, whatsapp, property_id, payment_status, id_card, rating, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(name, whatsapp, property_id, payment_status, id_card, rating, notes);
    res.status(201).json({ message: "Tenant created" });
  });

  // Payments
  app.get("/api/payments", authenticateToken, (req, res) => {
    const payments = db.prepare(`
      SELECT p.*, pr.name as property_name, t.name as tenant_name, u.username as operator_name
      FROM payments p
      JOIN properties pr ON p.property_id = pr.id
      JOIN tenants t ON p.tenant_id = t.id
      JOIN users u ON p.operator_id = u.id
    `).all();
    res.json(payments);
  });

  app.post("/api/payments", authenticateToken, (req, res) => {
    const { property_id, tenant_id, amount, method, status, receipt_path } = req.body;
    const operator_id = (req as any).user.id;
    db.prepare(`INSERT INTO payments (property_id, tenant_id, amount, operator_id, method, status, receipt_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(property_id, tenant_id, amount, operator_id, method, status, receipt_path);
    
    // Update property payment status
    db.prepare("UPDATE properties SET payment_status = ? WHERE id = ?").run(status, property_id);
    db.prepare("UPDATE tenants SET payment_status = ? WHERE property_id = ?").run(status, property_id);

    res.status(201).json({ message: "Payment recorded" });
  });

  // Stats
  app.get("/api/stats", authenticateToken, (req, res) => {
    const totalProperties = db.prepare("SELECT COUNT(*) as count FROM properties").get() as any;
    const rentedProperties = db.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'rented'").get() as any;
    const totalRent = db.prepare("SELECT SUM(rent_amount) as sum FROM properties WHERE status = 'rented'").get() as any;
    const totalDebt = db.prepare("SELECT SUM(rent_amount) as sum FROM properties WHERE payment_status != 'paid' AND status = 'rented'").get() as any;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as any;

    res.json({
      totalProperties: totalProperties.count,
      rentedProperties: rentedProperties.count,
      totalRent: totalRent.sum || 0,
      totalDebt: totalDebt.sum || 0,
      activeUsers: activeUsers.count
    });
  });

  // Maintenance
  app.get("/api/maintenance", authenticateToken, (req, res) => {
    const records = db.prepare(`
      SELECT m.*, p.name as property_name 
      FROM maintenance m 
      JOIN properties p ON m.property_id = p.id
    `).all();
    res.json(records);
  });

  app.post("/api/maintenance", authenticateToken, (req, res) => {
    const { property_id, type, date, cost, status, provider, description } = req.body;
    db.prepare(`INSERT INTO maintenance (property_id, type, date, cost, status, provider, description) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(property_id, type, date, cost, status, provider, description);
    res.status(201).json({ message: "Maintenance record created" });
  });

  // Contracts
  app.get("/api/contracts", authenticateToken, (req, res) => {
    const records = db.prepare(`
      SELECT c.*, p.name as property_name, t.name as tenant_name 
      FROM contracts c 
      JOIN properties p ON c.property_id = p.id
      JOIN tenants t ON c.tenant_id = t.id
    `).all();
    res.json(records);
  });

  app.post("/api/contracts", authenticateToken, (req, res) => {
    const { property_id, tenant_id, start_date, end_date, terms, status, document_path } = req.body;
    db.prepare(`INSERT INTO contracts (property_id, tenant_id, start_date, end_date, terms, status, document_path) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`).run(property_id, tenant_id, start_date, end_date, terms, status, document_path);
    res.status(201).json({ message: "Contract created" });
  });

  // Reports Data
  app.get("/api/reports/summary", authenticateToken, (req, res) => {
    const revenueByMonth = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, SUM(amount) as total 
      FROM payments 
      WHERE status = 'paid'
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 12
    `).all();

    const debtByProvince = db.prepare(`
      SELECT province, SUM(rent_amount) as total_debt 
      FROM properties 
      WHERE status = 'rented' AND payment_status != 'paid'
      GROUP BY province
    `).all();

    const occupancyStats = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM properties 
      GROUP BY status
    `).all();

    const paymentStatusStats = db.prepare(`
      SELECT payment_status, COUNT(*) as count 
      FROM properties 
      WHERE status = 'rented'
      GROUP BY payment_status
    `).all();

    res.json({
      revenueByMonth,
      debtByProvince,
      occupancyStats,
      paymentStatusStats
    });
  });

  // File Upload
  app.post("/api/upload", authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ path: `/uploads/${req.file.filename}` });
  });

  app.use("/uploads", express.static(uploadsDir));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
