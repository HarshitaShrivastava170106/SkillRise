const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  author: String,
  likes: { type: Number, default: 0 },
  comments: [{ user: String, text: String }]
});

blogSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Blog', blogSchema);
