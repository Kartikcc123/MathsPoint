const Advertisement = require('../models/Advertisement');
const { processAndUploadBanners } = require('../services/imageProcessor');
const { deleteFromS3 } = require('../services/awsService');

// Create a new advertisement
const createAdvertisement = async (req, res) => {
  try {
    const { title, description, buttonText, redirectLink, priority, status, startDate, endDate, type, backgroundColor } = req.body;

    let imageUrls = {};
    if (type !== 'text-card') {
      if (!req.file) {
        return res.status(400).json({ message: 'Banner image is required.' });
      }
      // Process and upload images
      imageUrls = await processAndUploadBanners(req.file.buffer, req.file.originalname);
    }

    const newAd = new Advertisement({
      title,
      description,
      buttonText,
      redirectLink,
      priority: parseInt(priority) || 0,
      status: status || 'active',
      type: type || 'image',
      backgroundColor: backgroundColor || 'bg-gradient-to-r from-blue-500 to-purple-600',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      ...imageUrls,
      createdBy: req.user ? req.user.id : null, // Assuming you have authentication middleware
    });

    await newAd.save();

    res.status(201).json({ message: 'Advertisement created successfully', advertisement: newAd });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// List advertisements
const getAdvertisements = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const ads = await Advertisement.find(query)
      .sort({ priority: -1, createdAt: -1 }) // Priority DESC, then Newest
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Advertisement.countDocuments(query);

    res.status(200).json({
      advertisements: ads,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get single advertisement
const getAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });
    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update advertisement
const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const ad = await Advertisement.findById(id);
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });

    if (req.file && updateData.type !== 'text-card') {
      // Process and upload new images
      const imageUrls = await processAndUploadBanners(req.file.buffer, req.file.originalname);
      Object.assign(updateData, imageUrls);
      
      // Optionally delete old images from S3 here if it had images
      if (ad.originalImage) await deleteFromS3(ad.originalImage);
      if (ad.desktopImage) await deleteFromS3(ad.desktopImage);
      if (ad.tabletImage) await deleteFromS3(ad.tabletImage);
      if (ad.mobileImage) await deleteFromS3(ad.mobileImage);
      if (ad.thumbnailImage) await deleteFromS3(ad.thumbnailImage);
    }

    const updatedAd = await Advertisement.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({ message: 'Advertisement updated', advertisement: updatedAd });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete advertisement
const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Advertisement not found' });

    // Delete images from S3 if they exist
    if (ad.originalImage) await deleteFromS3(ad.originalImage);
    if (ad.desktopImage) await deleteFromS3(ad.desktopImage);
    if (ad.tabletImage) await deleteFromS3(ad.tabletImage);
    if (ad.mobileImage) await deleteFromS3(ad.mobileImage);
    if (ad.thumbnailImage) await deleteFromS3(ad.thumbnailImage);

    await Advertisement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Analytics - Impression
const trackImpression = async (req, res) => {
  try {
    const { id } = req.body;
    await Advertisement.findByIdAndUpdate(id, { $inc: { impressions: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Analytics - Click
const trackClick = async (req, res) => {
  try {
    const { id } = req.body;
    await Advertisement.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createAdvertisement,
  getAdvertisements,
  getAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  trackImpression,
  trackClick
};
