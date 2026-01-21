import bcrypt from 'bcrypt';
import db from '../config/db.js';

// Login oldal megjelenitése
export const getLoginPage = (req, res) => {
  return res.render('login', { error: null });
};

// Bejelentkezés feldolgozása
export const login = async (req, res) => {
  const { name, password } = req.body;

  try {
    const result = await db.getUserByName(name);
    const user = result.recordset[0];

    if (user) {
      // Jelszó ellenőrzése
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        // Session beállitása
        Object.assign(req.session, {
          userId: user.id,
          userName: user.name,
          role: user.role,
        });

        return res.redirect('/');
      }
    }

    // Ha nem jó a jelszó vagy a felhasználó
    return res.render('login', { error: 'Hibás felhasználónév vagy jelszó' });
  } catch (err) {
    console.error(err);
    return res.render('login', { error: 'Adatbázis hiba történt' });
  }
};

// Kijelentkezés
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).send('Hiba történt kijelentkezéskor');
    }
    return res.redirect('/');
  });
};

// Regisztráció
export const register = async (req, res) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(name, hashedPassword, 'user');

    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return res.render('error', { message: `Hiba a regisztráció során: ${err.message}` });
  }
};

export const getRegisterPage = (req, res) => {
  return res.render('register');
};
