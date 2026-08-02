require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');
const { OpenAI } = require('openai');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./user');
const Blog = require('./Blog');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skillrise';
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required in production');
}

async function connectDatabase() {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in production');
  }
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn(`Failed to connect to MongoDB at ${MONGO_URI}. Falling back to in-memory database. ${error.message}`);
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri(), { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to in-memory MongoDB');
  }
}

// Register
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashed });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ token });
});

// Middleware for admin
function isAdmin(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(403).json({ error: 'No token provided' });
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
}

// Post Blog (Admin only)
app.post('/blogs', isAdmin, async (req, res) => {
  const { title, content, tags, author } = req.body;
  const blog = new Blog({ title, content, tags, author });
  await blog.save();
  res.json({ message: 'Blog posted successfully' });
});

// Get Blogs with Pagination
app.get('/blogs', async (req, res) => {
  const { tag, page = 1, limit = 10 } = req.query;
  const query = tag ? { tags: tag } : {};
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };
  
  const blogs = await Blog.paginate(query, options);
  res.json(blogs);
});
// Like Blog
app.post('/blogs/:id/like', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  blog.likes += 1;
  await blog.save();
  res.json({ likes: blog.likes });
});

// Comment Blog
app.post('/blogs/:id/comment', async (req, res) => {
  const { user, text } = req.body;
  const blog = await Blog.findById(req.params.id);
  blog.comments.push({ user, text });
  await blog.save();
  res.json({ comments: blog.comments });
});

// Recommendation System (AI Integration)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/recommendations/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const blogs = await Blog.find();
  
  const interests = user.interests.length ? user.interests.join(', ') : 'general learning';
  const prompt = `User interests: ${interests}. Recommend the most relevant blogs from this list: ${blogs.map(b => b.title).join(', ')}`;
  
  const aiResponse = await openai.completions.create({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 150
  });

  res.json({ recommendations: aiResponse.choices[0].text.trim() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

connectDatabase().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
