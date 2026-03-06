const express = require('express');
const router = express.Router();
const { submitExam, getExamResults } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitExam);
router.get('/results', protect, getExamResults);

module.exports = router;
