// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { Client, FileCreateTransaction, FileContentsQuery, Hbar, AccountId, PrivateKey, FileId } = require("@hashgraph/sdk");

const config = require('./config');
const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.SECRET_KEY || 'smartdecide_secret_key';
/*
const { Configuration, OpenAIApi } = require("openai");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
*/
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer للصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// قاعدة البيانات
const db = new sqlite3.Database('./data/Smart.db', (err) => {
  if (err) console.error(err.message);
  else console.log('✅ Connected to Smart.db SQLite database.');
});

db.serialize(() => {
  // users
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

  // decisions
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

  // sessions
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

  // session_members
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
      createdAt DATETIME,
      FOREIGN KEY (sessionId) REFERENCES sessions(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

});

// Hedera client (كما في كودك)
if (!config.HEDERA_OPERATOR_ID || !config.HEDERA_OPERATOR_KEY || config.HEDERA_OPERATOR_KEY.startsWith("your")) {
  console.warn("⚠ Warning: Hedera operator id/key not set or placeholder.");
}

const client = Client.forTestnet();
try {
  client.setOperator(
    AccountId.fromString(config.HEDERA_OPERATOR_ID),
    PrivateKey.fromString(config.HEDERA_OPERATOR_KEY)
  );
} catch (err) {
  console.warn("Hedera operator not configured or invalid - Hedera operations will fail until configured.");
}

async function storeDecisionOnHedera(text) {
  try {
    const tx = new FileCreateTransaction()
      .setContents(text)
      .setMaxTransactionFee(new Hbar(2));
    const submitTx = await tx.execute(client);
    const receipt = await submitTx.getReceipt(client);
    return receipt.fileId.toString();
  } catch (err) {
    console.error("Hedera store error:", err);
    throw err;
  }
}

async function readFileFromHedera(fileIdStr) {
  try {
    const contents = await new FileContentsQuery()
      .setFileId(FileId.fromString(fileIdStr))
      .execute(client);
    return Buffer.from(contents).toString('utf8');
  } catch (err) {
    console.error("Hedera read error:", err);
    throw err;
  }
}

// ====== Authentication middleware using JWT ======
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Invalid token:', err && err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // { id, email }
    next();
  });
}

// ====== Routes: signup / login ======
app.post('/api/signup', upload.single('avatar'), async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

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
        return res.status(200).json({ message: 'تم إنشاء الحساب بنجاح' });
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'حدث خطأ في السيرفر' });
    if (!user) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '6h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, avatar: user.avatar } });
  });
});

// ===== تسجيل رأي مع Hedera =====
app.post('/api/sessions/:sessionCode/opinion', authenticateToken, async (req, res) => {
  const { sessionCode } = req.params;
  const { opinion } = req.body;

  if (!opinion) return res.status(400).json({ message: "يرجى إدخال رأيك" });

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], async (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "كود الجلسة غير موجود" });

    const createdAt = new Date().toISOString();
    
    // تخزين على Hedera
    let fileId = null;
    try { fileId = await storeDecisionOnHedera(opinion); } 
    catch (hedErr) { console.error("Hedera store error:", hedErr); }

    db.run(
      'INSERT INTO opinions (sessionId, userId, opinion, createdAt, fileId) VALUES (?, ?, ?, ?, ?)',
      [session.id, req.user.id, opinion, createdAt, fileId],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({ 
          message: "تم تسجيل رأيك على البلوكشين ✅", 
          opinionId: this.lastID, 
          blockchainId: fileId 
        });
      }
    );
  });
});

// ===== قراءة محتوى ملف من Hedera Blockchain =====
app.get("/api/blockchain/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileContents = await new FileContentsQuery()
      .setFileId(fileId)
      .execute(client);

    const text = Buffer.from(fileContents).toString("utf8");
    res.json({ content: text });
  } catch (error) {
    console.error("❌ خطأ في قراءة الملف من البلوكشين:", error);
    res.status(500).json({ error: "فشل في جلب محتوى البلوكشين" });
  }
});

// ====== POST /api/decision (keeps using authenticateToken) ======
app.post('/api/decision', authenticateToken, async (req, res) => {
  try {
    const { domain, input } = req.body;
    if (!input) return res.status(400).json({ error: 'input field is required' });

    // call python AI service (if running)
    let aiResult = '';
    try {
      const aiResponse = await axios.post('http://127.0.0.1:5001/api/decision', { input });
      aiResult = aiResponse.data.result || '';
    } catch (aiErr) {
      console.warn('AI service call failed:', aiErr.message);
      aiResult = '[AI service unavailable]';
    }

    const timestamp = new Date().toISOString();
    const payloadString = JSON.stringify({ domain, input, aiResult, timestamp }, null, 2);

    let fileId = null;
    try {
      fileId = await storeDecisionOnHedera(payloadString);
    } catch (e) {
      // continue even if Hedera failed
      fileId = null;
    }

    const recordId = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO decisions (domain, input, aiResult, fileId, timestamp, userId) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [domain || null, input, aiResult, fileId, timestamp, req.user.id], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    res.json({ result: aiResult, blockchainId: fileId, recordId });
  } catch (err) {
    console.error('/api/decision error:', err);
    res.status(500).json({ error: 'Failed to store decision' });
  }
});

// ====== GET user decisions (only for authenticated user) ======
app.get('/api/decisions', authenticateToken, (req, res) => {
  db.all(`SELECT id, domain, input, aiResult, fileId, timestamp FROM decisions WHERE userId = ? ORDER BY id DESC`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ decisions: rows });
  });
});

// ====== GET a single decision by id (public) ======
app.get('/api/decisions/:id', (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM decisions WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ decision: row });
  });
});

// ====== Hedera file read ======
app.get('/api/file/:fileId', async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const text = await readFileFromHedera(fileId);
    res.json({ fileId, content: text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read file from Hedera' });
  }
});

// ====== Create session (authenticated) ======
app.post('/api/create-session', authenticateToken, (req, res) => {
  const { title, description, durationHours, analysisMethod } = req.body;

  if (!title || !durationHours || !analysisMethod) {
    return res.status(400).json({ message: 'الحقول المطلوبة ناقصة' });
  }

  const sessionCode = uuidv4().split('-')[0];
  const createdAt = new Date();
  const expiryDate = new Date(createdAt.getTime() + Number(durationHours) * 60 * 60 * 1000);

  db.run(
    `INSERT INTO sessions (sessionCode, title, description, analysisMethod, createdBy, createdAt, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [sessionCode, title, description || null, analysisMethod, req.user.id, createdAt.toISOString(), expiryDate.toISOString()],
    function(err) {
      if (err) {
        console.error('Create session DB error:', err);
        return res.status(500).json({ message: err.message });
      }
      res.json({ sessionCode, createdAt: createdAt.toISOString(), expiryDate: expiryDate.toISOString() });
    }
  );
});

// ====== Join session (public) ======
app.post('/api/join-session', (req, res) => {
  const { sessionCode, userEmail } = req.body;
  if (!sessionCode || !userEmail) return res.status(400).json({ message: 'الكود والبريد مطلوبان' });

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: 'جلسة غير موجودة' });

    // تحقق من انتهاء الجلسة
    if (session.expiryDate && new Date(session.expiryDate) < new Date()) {
      return res.status(403).json({ message: 'انتهت صلاحية الجلسة' });
    }

    db.run('INSERT INTO session_members (sessionId, userEmail, joinedAt) VALUES (?, ?, ?)', [session.id, userEmail, new Date().toISOString()], function(err) {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'تم الانضمام للجلسة' });
    });
  });
});

// ====== Get session details by code (public) ======
app.get('/api/session/:code', (req, res) => {
  const code = req.params.code;
  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [code], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: 'جلسة غير موجودة' });
    res.json({ session });
  });
});

// 🔹 الانضمام إلى جلسة
app.post('/api/sessions/join', authenticateToken, (req, res) => {
  const { sessionCode } = req.body;
  if (!sessionCode) return res.status(400).json({ message: "كود الجلسة مطلوب" });

  db.get(`SELECT * FROM sessions WHERE sessionCode = ?`, [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: "خطأ في قاعدة البيانات" });
    if (!session) return res.status(404).json({ message: "لم يتم العثور على الجلسة" });

    const now = Date.now();
    if (now > session.expiryTime) {
      return res.status(403).json({ message: "انتهت صلاحية هذه الجلسة ⏰" });
    }

    res.json({
      message: "تم الانضمام بنجاح ✅",
      session,
    });
  });
});

app.post('/api/sessions/:sessionCode/opinion', authenticateToken, (req, res) => {
  const { sessionCode } = req.params;
  const { opinion } = req.body;

  if (!opinion) return res.status(400).json({ message: "يرجى إدخال رأيك" });

  // جلب الجلسة من الكود
  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "كود الجلسة غير موجود" });

    const createdAt = new Date().toISOString();
    db.run(
      'INSERT INTO opinions (sessionId, userId, opinion, createdAt) VALUES (?, ?, ?, ?)',
      [session.id, req.user.id, opinion, createdAt],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
res.json({ 
  message: "تم تسجيل رأيك على البلوكشين ✅", 
  opinionId: this.lastID,
  blockchainId: fileId,
  content: opinion // هكذا نرسل المحتوى نفسه
});      }
    );
  });
});

app.get('/api/sessions/:sessionCode', authenticateToken, (req, res) => {
  const { sessionCode } = req.params;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "كود الجلسة غير موجود" });

    // جلب الآراء
db.all(
  'SELECT opinions.id, opinions.opinion, opinions.fileId, users.fullName, opinions.userId = ? AS isMine FROM opinions JOIN users ON opinions.userId = users.id WHERE sessionId = ? ORDER BY opinions.createdAt ASC',
  [req.user.id, session.id],
  async (err, opinions) => {
    if (err) return res.status(500).json({ message: err.message });

    // جلب محتوى Hedera لكل رأي إذا كان موجود
    const opinionsWithContent = await Promise.all(
      opinions.map(async (o) => {
        if (o.fileId) {
          try {
            const fileRes = await readFileFromHedera(o.fileId);
            o.blockchainContent = fileRes; // الآن يحتوي على محتوى Hedera
          } catch (err) {
            console.warn("فشل جلب محتوى Hedera:", err);
          }
        }
        return o;
      })
    );

    res.json({
      session: {
        title: session.title,
        description: session.description,
        analysisMethod: session.analysisMethod,
        expiryDate: session.expiryDate
      },
      opinions: opinionsWithContent
    });
  }
);  });

});

app.put('/api/sessions/:sessionCode/opinion/:opinionId', authenticateToken, async (req, res) => {
  const { sessionCode, opinionId } = req.params;
  const { opinion } = req.body;

  if (!opinion) return res.status(400).json({ message: "يرجى إدخال رأيك" });

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], async (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "جلسة غير موجودة" });

    // أولاً: توليد نسخة Hedera جديدة للرأي المعدل
    let newFileId = null;
    try {
      newFileId = await storeDecisionOnHedera(opinion);
    } catch (hedErr) {
      console.error("Hedera store error:", hedErr);
    }

    // تعديل الرأي وقيمته الجديدة على Hedera
    db.run(
      'UPDATE opinions SET opinion = ?, fileId = ? WHERE id = ? AND userId = ?',
      [opinion, newFileId, opinionId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(403).json({ message: "لا يمكنك تعديل هذا الرأي" });
        res.json({ 
          message: "تم تعديل رأيك بنجاح ✅", 
          blockchainId: newFileId 
        });
      }
    );
  });
});
app.delete('/api/sessions/:sessionCode/opinion/:opinionId', authenticateToken, (req, res) => {
  const { sessionCode, opinionId } = req.params;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "جلسة غير موجودة" });

    // حذف الرأي إذا كان هذا المستخدم هو صاحب الرأي
    db.run(
      'DELETE FROM opinions WHERE id = ? AND userId = ?',
      [opinionId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) return res.status(403).json({ message: "لا يمكنك حذف هذا الرأي" });
        res.json({ message: "تم حذف رأيك ✅" });
      }
    );
  });
});

async function analyzeSessionAI(session, opinions) {
  if (!opinions || opinions.length === 0) return { summary: "لا توجد آراء", recommended: null, blockchainHash: null };

  const topic = session.title;
  const description = session.description;
  const opinionsText = opinions.map(o => `- ${o.fullName || 'مجهول'}: ${o.opinion}`).join('\n');

  const prompt = `
  لديك جلسة بعنوان: "${topic}".
  الوصف: "${description}".
  آراؤ المشاركين:
  ${opinionsText}

  طريقة التحليل: ${session.analysisMethod}.
  اختر القرار النهائي بناءً على الطريقة (أغلبية أو الأفضلية).
  أعطني الملخص، القرار النهائي، وختم رمزي للبلوكشين.

  صيغة الإخراج: JSON { "summary": "...", "recommended": "...", "blockchainHash": "..." }
  `;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    });

    const resultText = response.data.choices[0].message.content;
    let result = {};
    try { result = JSON.parse(resultText); } catch { result = { summary: resultText, recommended: null, blockchainHash: null }; }

    return result;

  } catch (err) {
    console.error("AI analysis failed:", err);
    return { summary: "فشل تحليل AI", recommended: null, blockchainHash: null };
  }
}

app.get('/api/sessions/:sessionCode/analysis', authenticateToken, async (req, res) => {
  const { sessionCode } = req.params;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], async (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "جلسة غير موجودة" });

    db.all(
      'SELECT opinions.opinion, users.fullName FROM opinions JOIN users ON opinions.userId = users.id WHERE sessionId = ?',
      [session.id],
      async (err, opinions) => {
        if (err) return res.status(500).json({ message: err.message });

        const aiResult = await analyzeSessionAI(session, opinions);
        res.json({ analysis: aiResult });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});