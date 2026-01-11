const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'leads.db');
const db = new Database(dbPath);

// Initialize Schema
const initDb = () => {
  // Users Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'boss', 'sales'))
    )
  `).run();

  // Leads Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      answered_whatsapp INTEGER DEFAULT 0, -- 0 or 1
      answered_phone INTEGER DEFAULT 0,    -- 0 or 1
      demo_scheduled INTEGER DEFAULT 0,    -- 0 or 1
      observations TEXT,
      assigned_to INTEGER,
      status TEXT, -- 'Cold', 'Warm', 'Hot' (can be calculated but storing for easier querying/override)
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `).run();

  // Create default admin if not exists
  const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('Default admin user created: admin / admin123');
  }
  
  // Create boss user
  const bossExists = db.prepare('SELECT * FROM users WHERE role = ?').get('boss');
  if (!bossExists) {
      const hash = bcrypt.hashSync('boss123', 10);
      db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('boss', hash, 'boss');
      console.log('Default boss user created: boss / boss123');
  }

  // Create sales user
  const salesExists = db.prepare('SELECT * FROM users WHERE role = ?').get('sales');
  if (!salesExists) {
      const hash = bcrypt.hashSync('sales123', 10);
      db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('sales', hash, 'sales');
      console.log('Default sales user created: sales / sales123');
  }
};

module.exports = { db, initDb };
