import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

// Validate car listing input fields
function validateCarInput(brand, city, price, year) {
  const errors = [];
  if (!brand || brand.trim() === '') errors.push('Brand is required');
  if (!city || city.trim() === '') errors.push('City is required');
  if (!price || Number(price) <= 0) errors.push('Price must be a positive number');
  if (!year || Number(year) < 1900 || Number(year) > 2025) errors.push('Year must be between 1900 and 2025');
  return errors;
}

// Render home page with all listings
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
    res.status(500).render('error', { message: 'Error fetching data from the database' });
  }
};

// Render the new listing form
export const renderCreateForm = (req, res) => {
  try {
    res.render('create', {
      errors: [],
      formData: {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load the form' });
  }
};

// Handle new listing submission
export const createCar = async (req, res) => {
  const { brand, city, price, year } = req.body;
  const errors = validateCarInput(brand, city, price, year);
  const userId = req.session.userId;

  // Return form with validation errors if any
  if (errors.length > 0) {
    try {
      return res.status(400).render('create', {
        errors,
        formData: req.body,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).render('error', { message: 'Critical error while reloading form' });
    }
  }

  try {
    await db.createCar({ brand, city, price, year, userId });
    return res.redirect('/');
  } catch (err) {
    console.error('Save error:', err);
    return res.status(500).render('error', { message: 'Failed to save to the database' });
  }
};

// Handle image upload for a listing
export const uploadImage = async (req, res) => {
  const { carId } = req.body;

  if (!req.file) {
    return res.status(400).render('error', { message: 'No image file was selected!' });
  }

  try {
    const carResult = await db.getCarById(carId);
    if (carResult.recordset.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).render('error', { message: 'Car not found' });
    }

    const car = carResult.recordset[0];

    // Only the owner can upload images to their listing
    if (car.user_id !== req.session.userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).render('error', { message: 'You are not authorized to upload images to this listing!' });
    }

    await db.addPhoto(req.file.filename, carId);
    return res.redirect(`/${carId}`);
  } catch (err) {
    console.error('Image upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).render('error', { message: 'Failed to save the image' });
  }
};

// Render the details page for a single listing
export const renderDetails = async (req, res) => {
  const carId = req.params.id;

  if (isNaN(carId)) {
    return res.status(404).render('error', { message: 'Invalid listing ID.' });
  }

  try {
    const carResult = await db.getCarById(carId);

    if (carResult.recordset.length === 0) {
      return res.status(404).render('error', { message: 'This listing does not exist.' });
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
    console.error('Details error:', err);
    return res.status(500).render('error', { message: 'Database error while fetching listing details' });
  }
};

// API endpoint: return creation date for a listing
export const getCarInfoJSON = async (req, res) => {
  const carId = req.params.id;

  try {
    const result = await db.getCarCreatedAt(carId);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    return res.json({
      createdAt: result.recordset[0].created_at,
    });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Server error while fetching data' });
  }
};

// Handle image deletion
export const deleteImage = async (req, res) => {
  const photoId = req.params.id;
  const currentUserId = req.session.userId;

  try {
    const result = await db.getPhotoById(photoId);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const photo = result.recordset[0];

    const carResult = await db.getCarById(photo.ad_id);
    const car = carResult.recordset[0];

    // Only the owner of the listing can delete its images
    if (car.user_id !== currentUserId) {
      return res.status(403).json({ error: 'You are not authorized to delete this image!' });
    }

    const filename = photo.filename;
    await db.deletePhoto(photoId);

    // Remove the physical file from disk
    const filePath = path.join(currentDir, '..', 'public', 'images', filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Filesystem error (file may not exist):', err.message);
      }
    });

    return res.json({ message: 'Successfully deleted', id: photoId });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({ error: 'Server error during deletion' });
  }
};
