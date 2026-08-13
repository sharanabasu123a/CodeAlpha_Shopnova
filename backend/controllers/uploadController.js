const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(png|jpe?g|webp|gif|svg\+xml|svg)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// POST /api/upload  (admin) — stores locally; forwards to Cloudinary when configured.
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded', code: 'VALIDATION' } });

    const fileUrl = `/uploads/${req.file.filename}`;

    // Optional: push to Cloudinary if credentials are configured.
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'shopnova' });
        fs.unlink(req.file.path, () => {});
        return res.status(201).json({ url: result.secure_url });
      } catch (e) {
        // fall through to local path
      }
    }

    res.status(201).json({ url: fileUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadMiddleware: upload.single('image'), uploadImage };