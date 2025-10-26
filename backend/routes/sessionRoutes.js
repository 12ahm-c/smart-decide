const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

// Get all sessions for authenticated user
router.get('/sessions', authenticateToken, sessionController.getUserSessions);

router.post('/create-session', authenticateToken, sessionController.createSession);
router.post('/join-session', sessionController.joinSession);
router.get('/session/:code', sessionController.getSessionByCode);
router.post('/sessions/join', authenticateToken, sessionController.joinSessionAuth);

module.exports = router;
