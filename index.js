import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import carRoutes from './routes/carRoutes.js';
import authRoutes from './routes/authRoutes.js';
import requestLogger from './middleware/requestLogger.js';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(dirname, 'public')));

// Log all incoming requests
app.use(requestLogger);

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Make auth state available to all EJS views
app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.userId);
  res.locals.currentUser = req.session.userName;
  res.locals.currentUserId = req.session.userId;
  next();
});

// Register routes
app.use('/', authRoutes);
app.use('/', carRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
