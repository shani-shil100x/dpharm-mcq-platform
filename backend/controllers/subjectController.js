const Subject = require('../models/Subject');
const Question = require('../models/Question');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a subject
// @route   POST /api/admin/subjects
// @access  Private/Admin
const createSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectIcon } = req.body;

    const subjectExists = await Subject.findOne({ subjectName });
    if (subjectExists) {
      res.status(400);
      throw new Error('Subject already exists');
    }

    const subject = new Subject({
      subjectName,
      subjectIcon,
    });

    const createdSubject = await subject.save();
    res.status(201).json(createdSubject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Private/Admin
const updateSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectIcon } = req.body;

    const subject = await Subject.findById(req.params.id);

    if (subject) {
      if (subjectName) subject.subjectName = subjectName;
      if (subjectIcon) subject.subjectIcon = subjectIcon;

      const updatedSubject = await subject.save();
      res.json(updatedSubject);
    } else {
      res.status(404);
      throw new Error('Subject not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (subject) {
      // Delete all questions for this subject first
      await Question.deleteMany({ subjectId: subject._id });
      await subject.deleteOne();
      res.json({ message: 'Subject removed' });
    } else {
      res.status(404);
      throw new Error('Subject not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
