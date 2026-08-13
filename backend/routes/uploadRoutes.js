const router = require('express').Router();
const { uploadMiddleware, uploadImage } = require('../controllers/uploadController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.post('/upload', authMiddleware, adminOnly, uploadMiddleware, uploadImage);

module.exports = router;