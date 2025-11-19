import express from 'express';
import { uploadImage, uploadMultipleImages } from '../controllers/upload.controller.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

// Upload single image
router.post('/single', upload.single('image'), uploadImage);

// Upload multiple images
router.post('/multiple', upload.array('images', 6), uploadMultipleImages);

export default router;

