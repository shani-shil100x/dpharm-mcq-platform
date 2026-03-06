const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Question = require('./models/Question');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpharm-mcq');
    console.log('MongoDB Connected');

    // Only clear subjects and questions, leave users
    await Subject.deleteMany();
    await Question.deleteMany();
    
    console.log('Cleared existing subjects and questions');

    // Create Sample Subjects with 0 questions initially
    await Subject.insertMany([
      { subjectName: 'Pharmaceutics', subjectIcon: 'Pill', totalQuestions: 0 },
      { subjectName: 'Pharmaceutical Chemistry', subjectIcon: 'TestTubes', totalQuestions: 0 },
      { subjectName: 'Pharmacognosy', subjectIcon: 'Leaf', totalQuestions: 0 },
      { subjectName: 'Human Anatomy and Physiology', subjectIcon: 'HeartPulse', totalQuestions: 0 },
      { subjectName: 'Social Pharmacy', subjectIcon: 'Users', totalQuestions: 0 },
    ]);

    console.log('5 Base Subjects Created Successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
