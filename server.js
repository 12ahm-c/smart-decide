const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const { Client, FileCreateTransaction, FileContentsQuery, Hbar, AccountId, PrivateKey, FileId } = require("@hashgraph/sdk");

const config = require('./config');
const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = 'smartdecide_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد Multer للصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// جعل مجلد uploads متاح للوصول من المتصفح
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// قاعدة البيانات
const db = new sqlite3.Database('./data/Smart.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Connected to Smart.db SQLite database.');
});

db.serialize(() => {
  // جدول المستخدمين
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

  // جدول القرارات مع userId كمفتاح خارجي
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

  // جدول المؤسسات
db.run(`
  CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orgName TEXT NOT NULL,
    adminCode TEXT NOT NULL UNIQUE,
    memberCodes TEXT, -- نخزن الأكواد كـ JSON string
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

});

// Signup مع رفع الصورة
// ============================
app.post('/api/signup', upload.single('avatar'), async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

  try {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
      if (err) return res.status(500).json({ message: 'حدث خطأ في السيرفر' });
      if (user) return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });

      const hashedPassword = await bcrypt.hash(password, 10);

      const hederaAccountId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      const publicKey = `PUB_KEY_${Math.floor(Math.random() * 1000000)}`;

      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;

      db.run(
        `INSERT INTO users (fullName, email, password, hederaAccountId, publicKey, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
        [fullName, email, hashedPassword, hederaAccountId, publicKey, avatarPath],
        function(err) {
          if (err) return res.status(500).json({ message: err.message });
          res.status(200).json({ message: 'تم إنشاء الحساب بنجاح' });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
  }
});

// ============================
// Login
// ============================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'حدث خطأ في السيرفر' });
    if (!user) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    // إنشاء JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ 
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar }
    });
  });
});

app.post('/api/create-organization', authenticateToken, (req, res) => {
  const { orgName, adminCode, memberCodes } = req.body;

  if (!orgName || !adminCode) {
    return res.status(400).json({ error: 'اسم الجمعية وكود المشرف مطلوبان' });
  }

  const members = memberCodes ? memberCodes.join(',') : null;

  const sql = `INSERT INTO organizations (orgName, adminCode, memberCodes) VALUES (?, ?, ?)`;
  db.run(sql, [orgName, adminCode, members], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'تم إنشاء الجمعية بنجاح', orgId: this.lastID });
  });
});
// =========== Hedera Client setup (Testnet) ===========
if (!config.HEDERA_OPERATOR_ID || !config.HEDERA_OPERATOR_KEY || config.HEDERA_OPERATOR_KEY.startsWith("your")) {
  console.warn("⚠ Warning: Hedera operator id/key not set or placeholder. Set HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in .env or config.js");
}

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(config.HEDERA_OPERATOR_ID),
  PrivateKey.fromString(config.HEDERA_OPERATOR_KEY)
);

// Helper: store text on Hedera as a file, returns fileId string
async function storeDecisionOnHedera(text) {
  try {
    console.log("🚀 Storing on Hedera (file create) ... length:", text.length);
    const tx = new FileCreateTransaction()
      .setContents(text)
      .setMaxTransactionFee(new Hbar(2)); // تجربة / يمكنك تعديل

    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client); // قد يرمي خطأ إن لم يكن هناك رصيد
    const fileId = receipt.fileId.toString();
    console.log("✅ Stored on Hedera with FileId:", fileId);
    return fileId;
  } catch (err) {
    console.error("❌ Hedera store error:", err);
    throw err;
  }
}

// Helper: read file contents from Hedera
async function readFileFromHedera(fileIdStr) {
  try {
    const contents = await new FileContentsQuery()
      .setFileId(FileId.fromString(fileIdStr))
      .execute(client);
    const text = Buffer.from(contents).toString('utf8');
    return text;
  } catch (err) {
    console.error("❌ Hedera read error:", err);
    throw err;
  }
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // هنا يكون فيه { id, email }
    next();
  });
}


// =========== API Endpoints ===========

// POST /api/decision
// body: { domain?: string, input: string }
// تخزن على Hedera وتدون سجل في SQLite
app.post('/api/decision', authenticateToken, async (req, res) => {
  try {
    const { domain, input } = req.body;
    if (!input) return res.status(400).json({ error: "input field is required" });

    // استدعاء AI
    const aiResponse = await axios.post('http://127.0.0.1:5001/api/decision', { input });
    const aiResult = aiResponse.data.result;

    const timestamp = new Date().toISOString();
    const payloadString = JSON.stringify({ domain, input, aiResult, timestamp }, null, 2);

    // تخزين على Hedera
    const fileId = await storeDecisionOnHedera(payloadString);

    // تخزين في SQLite مع userId
    const insertPromise = new Promise((resolve, reject) => {
      const sql = `INSERT INTO decisions ( domain, input, aiResult, fileId, timestamp, userId) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [domain || null, input, aiResult, fileId, timestamp, req.user.id], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    const recordId = await insertPromise;
    return res.json({ result: aiResult, blockchainId: fileId, recordId });

  } catch (err) {
    console.error("/api/decision error:", err.message || err);
    return res.status(500).json({ error: "Failed to store decision. See server logs." });
  }
});// GET /api/decisions  -> list all decisions (local DB)
app.get('/api/decisions', authenticateToken, (req, res) => {
  db.all(
    `SELECT id, domain, input, aiResult, fileId, timestamp 
     FROM decisions 
     WHERE userId = ? 
     ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({ decisions: rows });
    }
  );
});
// GET /api/decisions/:id  -> specific DB row
app.get('/api/decisions/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM decisions WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ decision: row });
  });
});

// GET /api/file/:fileId -> قراءة محتوى الملف من Hedera (مباشر)
app.get('/api/file/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const text = await readFileFromHedera(fileId);
    return res.json({ fileId, content: text });
  } catch (err) {
    return res.status(500).json({ error: "Failed to read file from Hedera. See server logs." });
  }
});

app.get('/api/decisions', authenticateToken, (req, res) => {
  const userId = req.user.id; // جلب معرف المستخدم من التوكن
  db.all(
    'SELECT id, domainId, domainName, formData, aiResult, blockchainId, createdAt FROM decisions WHERE userId = ? ORDER BY createdAt DESC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ decisions: rows });
    }
  );
});

app.get('/api/organizations', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM organizations ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });

    // تحويل memberCodes من JSON string إلى Array
    const organizations = rows.map(org => ({
      ...org,
      memberCodes: org.memberCodes ? JSON.parse(org.memberCodes) : []
    }));

    res.json({ organizations });
  });
});

app.post('/api/join-organization', authenticateToken, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ message: 'الكود مطلوب' });

  const sql = `SELECT * FROM organizations WHERE adminCode = ? OR memberCodes LIKE ?`;
  db.get(sql, [code, `%${code}%`], (err, org) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!org) return res.status(404).json({ message: 'الكود غير صحيح' });

    // تحديد نوع المستخدم
    const isAdmin = code === org.adminCode;

    res.json({
      message: 'تم الدخول بنجاح',
      orgId: org.id,
      role: isAdmin ? 'admin' : 'member'
    });
  });
});

// ============================

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});