const db = require('../config/database');

exports.getDashboardStats = (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT COUNT(*) as count FROM sessions
     WHERE createdBy = ? AND datetime(expiryDate) > datetime('now')`,
    [userId],
    (err, activeSessions) => {
      if (err) return res.status(500).json({ message: err.message });

      db.get(
        `SELECT COUNT(*) as count FROM sessions
         WHERE createdBy = ? AND datetime(expiryDate) <= datetime('now')`,
        [userId],
        (err, completedSessions) => {
          if (err) return res.status(500).json({ message: err.message });

          db.get(
            `SELECT COUNT(DISTINCT sm.userEmail) as count
             FROM session_members sm
             JOIN sessions s ON sm.sessionId = s.id
             WHERE s.createdBy = ?`,
            [userId],
            (err, participants) => {
              if (err) return res.status(500).json({ message: err.message });

              res.json({
                activeSessions: activeSessions.count || 0,
                completedSessions: completedSessions.count || 0,
                totalParticipants: participants.count || 0
              });
            }
          );
        }
      );
    }
  );
};
