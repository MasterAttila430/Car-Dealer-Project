import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as carController from '../controllers/carController.js';
import { authorize } from '../middleware/authMiddleware.js';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Multer konfiguráció
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

// 1. Főoldal
router.get('/', carController.renderHome);

// 2. Új hirdetés űrlap megjelenítése
router.get('/new', authorize(), carController.renderCreateForm);

// 3. Új hirdetés mentése
router.post('/new', authorize(), carController.createCar);

// 4. Kép feltöltése
router.post('/upload', authorize(), upload.single('carImage'), carController.uploadImage);

// 5. Részletek
router.get('/:id', carController.renderDetails);

// 6. API Route az extra információkhoz
router.get('/api/cars/:id/info', carController.getCarInfoJSON);

// 7. API Route a kép törléséhez
router.delete('/api/photos/:id', authorize(), carController.deleteImage);

export default router;
