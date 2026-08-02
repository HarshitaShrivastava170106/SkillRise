const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  author: String,
  likes: { type: Number, default: 0 },
  comments: [{ user: String, text: String }]
});

module.exports = mongoose.model('Blog', blogSchema);
