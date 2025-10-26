const express = require('express');
const router = express.Router();
const decisionController = require('../controllers/decisionController');
const { authenticateToken } = require('../middleware/auth');

router.post('/decision', authenticateToken, decisionController.createDecision);
router.get('/decisions', authenticateToken, decisionController.getUserDecisions);
router.get('/decisions/:id', decisionController.getDecisionById);
router.get('/file/:fileId', decisionController.getFileFromHedera);
router.get('/blockchain/:fileId', decisionController.getBlockchainContent);

module.exports = router;
