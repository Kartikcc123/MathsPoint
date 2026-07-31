const express = require('express');
const router = express.Router();
const multer = require('multer');
const advertisementController = require('../controllers/advertisementController');

// Multer setup using memory storage because we process with sharp before S3 upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format'), false);
    }
  },
});

// Admin Routes (Add adminAuth middleware in real implementation)
router.post('/admin', upload.single('image'), advertisementController.createAdvertisement);
router.get('/admin', advertisementController.getAdvertisements);
router.get('/admin/:id', advertisementController.getAdvertisement);
router.put('/admin/:id', upload.single('image'), advertisementController.updateAdvertisement);
router.delete('/admin/:id', advertisementController.deleteAdvertisement);

// Public Routes
// In a real application, you might want a route to fetch active banners for the frontend
router.get('/public', async (req, res) => {
    const { Advertisement } = require('../models/Advertisement'); // Direct import for quick public route
    try {
        const ads = await require('../models/Advertisement').find({ status: 'active' })
            .sort({ priority: -1, createdAt: -1 });
        res.json(ads);
    } catch(err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Analytics Routes
router.post('/track/impression', advertisementController.trackImpression);
router.post('/track/click', advertisementController.trackClick);

module.exports = router;
