const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { SECRET_KEY } = require('../middleware/auth');

exports.signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

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
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'حدث خطأ في السيرفر' });
    if (!user) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '6h' });
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar
      }
    });
  });
};

exports.getMe = (req, res) => {
  db.get(
    `SELECT id, fullName, email, avatar, hederaAccountId, publicKey FROM users WHERE id = ?`,
    [req.user.id],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'خطأ في السيرفر' });
      if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

      res.json({
        user: {
          id: user.id,
          name: user.fullName,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          hederaAccountId: user.hederaAccountId,
          publicKey: user.publicKey
        }
      });
    }
  );
};
