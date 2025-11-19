import { errorHandler } from '../utils/error.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(errorHandler(400, 'No file uploaded'));
    }

    console.log('Uploading file to Cloudinary:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'sitestate');

    console.log('Upload successful:', result.secure_url);

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    next(errorHandler(500, error.message || 'Failed to upload image'));
  }
};

export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(errorHandler(400, 'No files uploaded'));
    }

    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'sitestate')
    );

    const results = await Promise.all(uploadPromises);

    const urls = results.map(result => result.secure_url);

    return res.status(200).json({
      success: true,
      urls: urls,
      files: results.map(result => ({
        url: result.secure_url,
        public_id: result.public_id,
      })),
    });
  } catch (error) {
    next(errorHandler(500, error.message || 'Failed to upload images'));
  }
};
