const db = require('../config/database');
const { storeDecisionOnHedera, readFileFromHedera } = require('../services/hederaService');
const { callPythonAI } = require('../services/aiService');

exports.createDecision = async (req, res) => {
  try {
    const { domain, input } = req.body;

    if (!input) {
      return res.status(400).json({ error: 'input field is required' });
    }

    const aiResult = await callPythonAI(input);
    const timestamp = new Date().toISOString();
    const payloadString = JSON.stringify({ domain, input, aiResult, timestamp }, null, 2);

    let fileId = null;
    try {
      fileId = await storeDecisionOnHedera(payloadString);
    } catch (e) {
      console.warn('Hedera storage failed:', e);
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
};

exports.getUserDecisions = (req, res) => {
  db.all(
    `SELECT id, domain, input, aiResult, fileId, timestamp FROM decisions WHERE userId = ? ORDER BY id DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ decisions: rows });
    }
  );
};

exports.getDecisionById = (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM decisions WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json({ decision: row });
  });
};

exports.getFileFromHedera = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const text = await readFileFromHedera(fileId);
    res.json({ fileId, content: text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read file from Hedera' });
  }
};

exports.getBlockchainContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const text = await readFileFromHedera(fileId);
    res.json({ content: text });
  } catch (error) {
    console.error("❌ خطأ في قراءة الملف من البلوكشين:", error);
    res.status(500).json({ error: "فشل في جلب محتوى البلوكشين" });
  }
};
