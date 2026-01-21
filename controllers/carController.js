import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

function validateCarInput(brand, city, price, year) {
  const errors = [];
  if (!brand || brand.trim() === '') errors.push('Márka kötelező');
  if (!city || city.trim() === '') errors.push('Város kötelező');
  if (!price || Number(price) <= 0) errors.push('Ár pozitív szám kell');
  if (!year || Number(year) < 1900 || Number(year) > 2025) errors.push('Évjárat 1900-2025 között');
  return errors;
}

// FŐOLDAL
export const renderHome = async (req, res) => {
  try {
    const usersResult = await db.getAllUsers();
    const carsResult = await db.getCars(req.query);

    res.render('index', {
      cars: carsResult.recordset,
      users: usersResult.recordset,
      query: req.query,
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Hiba történt az adatbázis lekérdezésekor' });
  }
};

// ÚJ HIRDETÉS FORM
export const renderCreateForm = (req, res) => {
  try {
    res.render('create', {
      errors: [],
      formData: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Nem sikerült betölteni az űrlapot' });
  }
};

// MENTÉS
export const createCar = async (req, res) => {
  const { brand, city, price, year } = req.body;
  const errors = validateCarInput(brand, city, price, year);
  const userId = req.session.userId;

  if (errors.length > 0) {
    try {
      return res.status(400).render('create', {
        errors,
        formData: req.body,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).render('error', { message: 'Kritikus hiba az űrlap újratöltésekor' });
    }
  }

  try {
    await db.createCar({ brand, city, price, year, userId });
    return res.redirect('/');
  } catch (err) {
    console.error('Mentési hiba:', err);
    return res.status(500).render('error', { message: 'Nem sikerült menteni az adatbázisba' });
  }
};

// FELTÖLTÉS
export const uploadImage = async (req, res) => {
  const { carId } = req.body;

  if (!req.file) {
    return res.status(400).render('error', { message: 'Nem választottál ki képet!' });
  }

  try {
    const carResult = await db.getCarById(carId);
    if (carResult.recordset.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).render('error', { message: 'Autó nem található' });
    }

    const car = carResult.recordset[0];

    if (car.user_id !== req.session.userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).render('error', { message: 'Nincs jogosultságod képet feltölteni ehhez a hirdetéshez!' });
    }

    await db.addPhoto(req.file.filename, carId);
    return res.redirect(`/${carId}`);
  } catch (err) {
    console.error('Képfeltöltési hiba:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).render('error', { message: 'Nem sikerült menteni a képet' });
  }
};

// RÉSZLETEK
export const renderDetails = async (req, res) => {
  const carId = req.params.id;

  if (isNaN(carId)) {
    return res.status(404).render('error', { message: 'Nem érvényes azonosító.' });
  }

  try {
    const carResult = await db.getCarById(carId);

    if (carResult.recordset.length === 0) {
      return res.status(404).render('error', { message: 'Sajnos ilyen hirdetés nem létezik.' });
    }

    const photosResult = await db.getPhotosByCarId(carId);

    const car = carResult.recordset[0];

    const currentUserId = req.session.userId;

    const isOwner = currentUserId && currentUserId === car.user_id;

    return res.render('details', {
      car,
      photos: photosResult.recordset,
      isOwner,
    });
  } catch (err) {
    console.error('Részletek hiba:', err);
    return res.status(500).render('error', { message: 'Adatbázis hiba a részletek lekérésekor' });
  }
};

// API: Egy hirdetés extra adatainak lekérése
export const getCarInfoJSON = async (req, res) => {
  const carId = req.params.id;

  try {
    const result = await db.getCarCreatedAt(carId);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Hirdetés nem található' });
    }

    return res.json({
      createdAt: result.recordset[0].created_at,
    });
  } catch (err) {
    console.error('API hiba:', err);
    return res.status(500).json({ error: 'Szerver hiba az adatok lekérésekor' });
  }
};

// Kép törlése
export const deleteImage = async (req, res) => {
  const photoId = req.params.id;
  const currentUserId = req.session.userId;

  try {
    const result = await db.getPhotoById(photoId);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'A kép nem található' });
    }
    const photo = result.recordset[0];

    const carResult = await db.getCarById(photo.ad_id);
    const car = carResult.recordset[0];

    if (car.user_id !== currentUserId) {
      return res.status(403).json({ error: 'Nincs jogosultságod törölni ezt a képet!' });
    }

    const filename = photo.filename;
    await db.deletePhoto(photoId);

    const filePath = path.join(currentDir, '..', 'public', 'images', filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Fájlrendszer hiba (fájl nem volt meg?):', err.message);
      }
    });

    return res.json({ message: 'Sikeres törlés', id: photoId });
  } catch (err) {
    console.error('Törlési hiba:', err);
    return res.status(500).json({ error: 'Szerver hiba a törléskor' });
  }
};
