const express = require('express');
const router = express.Router();
const opinionController = require('../controllers/opinionController');
const { authenticateToken } = require('../middleware/auth');

router.post('/sessions/:sessionCode/opinion', authenticateToken, opinionController.createOpinion);
router.get('/sessions/:sessionCode', authenticateToken, opinionController.getSessionWithOpinions);
router.put('/sessions/:sessionCode/opinion/:opinionId', authenticateToken, opinionController.updateOpinion);
router.delete('/sessions/:sessionCode/opinion/:opinionId', authenticateToken, opinionController.deleteOpinion);
router.get('/sessions/:sessionCode/analysis', authenticateToken, opinionController.getSessionAnalysis);

module.exports = router;
