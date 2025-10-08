const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  templateId: {
    type: String,
    unique: true, // Ensures that each templateId is unique in the database
    required: true // Makes the field required
  },
  userId: {
    type: String, // Correct type
    required: true // Makes the field required
  }
});

module.exports = mongoose.model('Token', tokenSchema);
