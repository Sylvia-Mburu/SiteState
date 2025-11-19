import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
// IMPORTANT: Get these values from your Cloudinary Dashboard:
// Dashboard URL: https://console.cloudinary.com/
// Go to Settings > Access Keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dl8z6kbza',
  api_key: process.env.CLOUDINARY_API_KEY || '387428113279491',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'f72BMPH1fN1qqrKKsqwsU7wIfmg',
});

// Verify configuration on startup
const config = cloudinary.config();
if (!config.cloud_name || !config.api_key || !config.api_secret) {
  console.warn('⚠️  Cloudinary configuration may be incomplete. Check your environment variables.');
} else {
  console.log('✅ Cloudinary configured:', {
    cloud_name: config.cloud_name,
    api_key: config.api_key ? '***set***' : 'not set',
    api_secret: config.api_secret ? '***set***' : 'not set',
  });
}

// Use memory storage for multer (we'll upload to Cloudinary after)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Helper function to upload to Cloudinary
export const uploadToCloudinary = async (buffer, folder = 'sitestate') => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      reject(new Error('Empty buffer provided'));
      return;
    }

    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        {
          width: 1200,
          height: 1200,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
            error: error,
          });
          
          // Provide helpful error messages
          if (error.http_code === 401) {
            reject(new Error('Cloudinary authentication failed. Please check your API credentials.'));
          } else if (error.http_code === 400) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            reject(new Error(`Cloudinary error: ${error.message || 'Unknown error'}`));
          }
        } else {
          console.log('✅ Upload successful:', result.secure_url);
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export { cloudinary };
