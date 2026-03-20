import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as carController from '../controllers/carController.js';
import { authorize } from '../middleware/authMiddleware.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(dirname, '../public/images'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const router = new express.Router();

// 1. Home page
router.get('/', carController.renderHome);

// 2. Display the form for a new car ad
router.get('/new', authorize(), carController.renderCreateForm);

// 3. Save the new car ad
router.post('/new', authorize(), carController.createCar);

// 4. Upload an image for a specific car
router.post('/upload', authorize(), upload.single('carImage'), carController.uploadImage);

// 5. Display car details
router.get('/:id', carController.renderDetails);

// 6. API Route to fetch extra information
router.get('/api/cars/:id/info', carController.getCarInfoJSON);

// 7. API Route to delete an image
router.delete('/api/photos/:id', authorize(), carController.deleteImage);

export default router;