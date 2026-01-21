import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import carRoutes from './routes/carRoutes.js';
import authRoutes from './routes/authRoutes.js';
import requestLogger from './middleware/requestLogger.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logger aktiválása a statikus fájlok előtt
app.use(express.static(path.join(dirname, 'public')));

// middleware használata
app.use(requestLogger);

// session beallitas
app.use(
  session({
    secret: 'titkos_kulcs_dev',
    resave: false,
    saveUninitialized: false,
  }),
);

// globalis valtozok ejs-nek (login statusz)
app.use((req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session.userId);
  res.locals.currentUser = req.session.userName;
  res.locals.currentUserId = req.session.userId;
  // res.locals.isAdmin = req.session.role === 'admin'; nem szukseges
  next();
});

// Útvonalak kezelése
app.use('/', authRoutes);
app.use('/', carRoutes);

app.listen(PORT, () => {
  console.log(`A szerver fut: http://localhost:${PORT}`);
});
