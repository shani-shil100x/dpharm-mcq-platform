const express = require('express');
const router = express.Router();
const { getQuestions, bulkUploadQuestions, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getQuestions);

router.post('/bulk-upload', protect, admin, bulkUploadQuestions);

router.route('/:id')
  .put(protect, admin, updateQuestion)
  .delete(protect, admin, deleteQuestion);

module.exports = router;
