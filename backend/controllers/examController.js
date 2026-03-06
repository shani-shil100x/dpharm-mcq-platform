const ExamResult = require('../models/ExamResult');
const UserStats = require('../models/UserStats');
const Question = require('../models/Question');

// @desc    Submit exam and calculate results (server-side scoring)
// @route   POST /api/exam/submit
// @access  Private
const submitExam = async (req, res, next) => {
  try {
    const { subjectId, answers } = req.body;
    // answers = { questionId: selectedOption, ... }

    if (!subjectId) {
      res.status(400);
      throw new Error('subjectId is required');
    }

    // Fetch all questions for this subject to score server-side
    // OPTIMIZATION: Only request _id and correctAnswer, and use .lean() for raw JSON.
    // This dramatically reduces memory when fetching 50+ questions at once.
    const questions = await Question.find({ subjectId })
      .select('_id correctAnswer')
      .lean();

    if (questions.length === 0) {
      res.status(400);
      throw new Error('No questions found for this subject');
    }

    const totalQuestions = questions.length;
    let correct = 0;
    let wrong = 0;
    let attempted = 0;

    // Score each answer server-side
    const submittedAnswers = answers || {};
    questions.forEach((q) => {
      const userAnswer = submittedAnswers[q._id.toString()];
      if (userAnswer) {
        attempted++;
        if (userAnswer === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
        }
      }
    });

    const accuracy = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    const result = new ExamResult({
      userId: req.user._id,
      subjectId,
      totalQuestions,
      attempted,
      correct,
      wrong,
      accuracy,
    });

    const createdResult = await result.save();

    // Update UserStats
    let userStats = await UserStats.findOne({ userId: req.user._id, subjectId });

    if (userStats) {
      userStats.attempted += attempted;
      userStats.correct += correct;
      userStats.wrong += wrong;

      const totalAttemptedForAccuracy = userStats.attempted > 0 ? userStats.attempted : 1;
      userStats.accuracy = (userStats.correct / totalAttemptedForAccuracy) * 100;

      await userStats.save();
    } else {
      userStats = new UserStats({
        userId: req.user._id,
        subjectId,
        attempted,
        correct,
        wrong,
        accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
      });
      await userStats.save();
    }

    res.status(201).json(createdResult);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past exam results
// @route   GET /api/exam/results?subjectId=x
// @access  Private
const getExamResults = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.subjectId) {
      query.subjectId = req.query.subjectId;
    }

    const results = await ExamResult.find(query).sort({ completedAt: -1 }).populate('subjectId', 'subjectName');
    res.json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitExam, getExamResults };
