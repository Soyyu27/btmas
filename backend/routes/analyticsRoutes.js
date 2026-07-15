const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getBreakdown, getAmountDistribution } = require('../controllers/analyticsController');

router.use(verifyToken);

router.get('/breakdown/:dimension', getBreakdown);
router.get('/amount-distribution', getAmountDistribution);

module.exports = router;