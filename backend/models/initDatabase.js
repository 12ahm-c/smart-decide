const db = require('../config/database');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      hederaAccountId TEXT,
      publicKey TEXT,
      avatar TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT,
      input TEXT,
      aiResult TEXT,
      fileId TEXT,
      timestamp TEXT,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionCode TEXT UNIQUE,
      title TEXT,
      description TEXT,
      analysisMethod TEXT,
      createdBy INTEGER,
      createdAt DATETIME,
      expiryDate DATETIME,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS session_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER,
      userEmail TEXT,
      joinedAt DATETIME,
      FOREIGN KEY (sessionId) REFERENCES sessions(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS opinions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER,
      userId INTEGER,
      opinion TEXT,
      fileId TEXT,
      createdAt DATETIME,
      FOREIGN KEY (sessionId) REFERENCES sessions(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});

module.exports = db;
