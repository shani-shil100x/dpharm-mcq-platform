const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSubjects)
  .post(protect, admin, createSubject);

router.route('/:id')
  .put(protect, admin, updateSubject)
  .delete(protect, admin, deleteSubject);

module.exports = router;
