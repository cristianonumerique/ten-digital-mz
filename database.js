const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    this.dbPath = path.join(dbDir, 'tendigital.db');
    this.db = null;
  }

  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('✅ Database connected:', this.dbPath);
        this.createTables();
      }
    });
  }

  createTables() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          address TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT NOT NULL,
          price REAL NOT NULL,
          stock INTEGER DEFAULT 999,
          image TEXT,
          region TEXT,
          supplier TEXT,
          active BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          productId INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          totalPrice REAL NOT NULL,
          code TEXT UNIQUE,
          paymentMethod TEXT NOT NULL,
          paymentStatus TEXT DEFAULT 'pending',
          deliveryStatus TEXT DEFAULT 'pending',
          email TEXT NOT NULL,
          notes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          deliveredAt DATETIME,
          FOREIGN KEY(userId) REFERENCES users(id),
          FOREIGN KEY(productId) REFERENCES products(id)
        )
      `);

      // Payments table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER NOT NULL,
          gateway TEXT NOT NULL,
          amount REAL NOT NULL,
          currency TEXT DEFAULT 'MT',
          transactionId TEXT UNIQUE,
          status TEXT DEFAULT 'pending',
          metadata TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(orderId) REFERENCES orders(id)
        )
      `);

      // Delivery codes table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS delivery_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          orderId INTEGER UNIQUE NOT NULL,
          code TEXT UNIQUE NOT NULL,
          type TEXT,
          sent BOOLEAN DEFAULT 0,
          sentAt DATETIME,
          sentTo TEXT,
          FOREIGN KEY(orderId) REFERENCES orders(id)
        )
      `);

      console.log('✅ Database tables created/verified');
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
