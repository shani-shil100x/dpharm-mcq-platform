const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');
const Subject = require('./models/Subject');

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dpharm-mcq');
  console.log('Connected to MongoDB');

  const deleted = await Question.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} preloaded questions`);

  // Reset totalQuestions count on all subjects to 0
  await Subject.updateMany({}, { totalQuestions: 0 });
  console.log('Reset all subject question counts to 0');

  process.exit();
};

run().catch(err => { console.error(err); process.exit(1); });
