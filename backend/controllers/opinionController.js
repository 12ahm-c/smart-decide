const db = require('../config/database');
const { storeDecisionOnHedera, readFileFromHedera } = require('../services/hederaService');
const { analyzeSessionAI } = require('../services/analysisService');

exports.createOpinion = async (req, res) => {
  const { sessionCode } = req.params;
  const { opinion } = req.body;

  if (!opinion) {
    return res.status(400).json({ message: "يرجى إدخال رأيك" });
  }

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], async (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "كود الجلسة غير موجود" });

    const createdAt = new Date().toISOString();

    let fileId = null;
    try {
      fileId = await storeDecisionOnHedera(opinion);
    } catch (hedErr) {
      console.error("Hedera store error:", hedErr);
    }

    db.run(
      'INSERT INTO opinions (sessionId, userId, opinion, createdAt, fileId) VALUES (?, ?, ?, ?, ?)',
      [session.id, req.user.id, opinion, createdAt, fileId],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        res.json({
          message: "تم تسجيل رأيك على البلوكشين ✅",
          opinionId: this.lastID,
          blockchainId: fileId,
          content: opinion
        });
      }
    );
  });
};

exports.getSessionWithOpinions = async (req, res) => {
  const { sessionCode } = req.params;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "كود الجلسة غير موجود" });

    db.all(
      'SELECT opinions.id, opinions.opinion, opinions.fileId, users.fullName, opinions.userId = ? AS isMine FROM opinions JOIN users ON opinions.userId = users.id WHERE sessionId = ? ORDER BY opinions.createdAt ASC',
      [req.user.id, session.id],
      async (err, opinions) => {
        if (err) return res.status(500).json({ message: err.message });

        const opinionsWithContent = await Promise.all(
          opinions.map(async (o) => {
            if (o.fileId) {
              try {
                const fileRes = await readFileFromHedera(o.fileId);
                o.blockchainContent = fileRes;
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
    );
  });
};

exports.updateOpinion = async (req, res) => {
  const { sessionCode, opinionId } = req.params;
  const { opinion } = req.body;

  if (!opinion) {
    return res.status(400).json({ message: "يرجى إدخال رأيك" });
  }

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], async (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "جلسة غير موجودة" });

    let newFileId = null;
    try {
      newFileId = await storeDecisionOnHedera(opinion);
    } catch (hedErr) {
      console.error("Hedera store error:", hedErr);
    }

    db.run(
      'UPDATE opinions SET opinion = ?, fileId = ? WHERE id = ? AND userId = ?',
      [opinion, newFileId, opinionId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) {
          return res.status(403).json({ message: "لا يمكنك تعديل هذا الرأي" });
        }
        res.json({
          message: "تم تعديل رأيك بنجاح ✅",
          blockchainId: newFileId
        });
      }
    );
  });
};

exports.deleteOpinion = (req, res) => {
  const { sessionCode, opinionId } = req.params;

  db.get('SELECT * FROM sessions WHERE sessionCode = ?', [sessionCode], (err, session) => {
    if (err) return res.status(500).json({ message: err.message });
    if (!session) return res.status(404).json({ message: "جلسة غير موجودة" });

    db.run(
      'DELETE FROM opinions WHERE id = ? AND userId = ?',
      [opinionId, req.user.id],
      function(err) {
        if (err) return res.status(500).json({ message: err.message });
        if (this.changes === 0) {
          return res.status(403).json({ message: "لا يمكنك حذف هذا الرأي" });
        }
        res.json({ message: "تم حذف رأيك ✅" });
      }
    );
  });
};

exports.getSessionAnalysis = async (req, res) => {
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
};
