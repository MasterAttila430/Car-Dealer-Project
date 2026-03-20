import bcrypt from 'bcrypt';
import db from '../config/db.js';

// Render the login page
export const getLoginPage = (req, res) => {
  return res.render('login', { error: null });
};

// Handle login form submission
export const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const result = await db.getUserByName(name);
    const user = result.recordset[0];

    if (user) {
      // Compare submitted password with hashed password in DB
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Set session data on successful login
        Object.assign(req.session, {
          userId: user.id,
          userName: user.name,
          role: user.role,
        });

        return res.redirect('/');
      }
    }

    // Invalid username or password
    return res.render('login', { error: 'Invalid username or password' });
  } catch (err) {
    console.error(err);
    return res.render('login', { error: 'A database error occurred' });
  }
};

// Handle logout
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('An error occurred during logout');
    }
    return res.redirect('/');
  });
};

// Handle registration form submission
export const register = async (req, res) => {
  const { name, password } = req.body;
  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(name, hashedPassword, 'user');

    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('error', { message: `Registration error: ${err.message}` });
  }
};

// Render the registration page
export const getRegisterPage = (req, res) => {
  return res.render('register');
};
