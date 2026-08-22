const HomeContent = require('../models/HomeContent');
const { sendErrorResponse } = require('../utils/api');
const { uploadToS3 } = require('../services/awsService');

const SINGLETON_KEY = 'home-page';

const getOrCreateHomeContent = async () => {
  let doc = await HomeContent.findOne({ singletonKey: SINGLETON_KEY });

  if (!doc) {
    doc = await HomeContent.create({ singletonKey: SINGLETON_KEY });
  }

  return doc;
};

const sortByOrder = (items = []) =>
  [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

const sanitizeText = (value, fallback = '') =>
  typeof value === 'string' ? value.trim() : fallback;

const normalizeHeroAds = (heroAds = [], uploadedFiles = {}) =>
  heroAds
    .map((ad, index) => ({
      title: sanitizeText(ad.title),
      subtitle: sanitizeText(ad.subtitle),
      imageUrl: uploadedFiles[ad.imageFileKey] || sanitizeText(ad.imageUrl),
      linkLabel: sanitizeText(ad.linkLabel),
      linkUrl: sanitizeText(ad.linkUrl),
      order: index,
    }))
    .filter((ad) => ad.imageUrl);

const normalizeStudentSpotlight = (spotlight = {}, uploadedFiles = {}) => ({
  primaryImageUrl: uploadedFiles[spotlight.primaryImageFileKey] || sanitizeText(spotlight.primaryImageUrl),
  primaryAlt: sanitizeText(spotlight.primaryAlt, 'Lead student'),
  primaryQuote: sanitizeText(spotlight.primaryQuote),
  secondaryImageUrl: uploadedFiles[spotlight.secondaryImageFileKey] || sanitizeText(spotlight.secondaryImageUrl),
  secondaryAlt: sanitizeText(spotlight.secondaryAlt, 'Student'),
  secondaryQuote: sanitizeText(spotlight.secondaryQuote),
});

const normalizeFaculties = (faculties = [], uploadedFiles = {}) =>
  faculties
    .map((faculty, index) => ({
      name: sanitizeText(faculty.name),
      subject: sanitizeText(faculty.subject),
      exp: sanitizeText(faculty.exp),
      tag: sanitizeText(faculty.tag),
      desc: sanitizeText(faculty.desc),
      img: uploadedFiles[faculty.imageFileKey] || sanitizeText(faculty.img),
      order: index,
    }))
    .filter((faculty) => faculty.name || faculty.subject || faculty.img);

const normalizeGalleryImages = (galleryImages = [], uploadedFiles = {}) =>
  galleryImages
    .map((item, index) => ({
      title: sanitizeText(item.title),
      imageUrl: uploadedFiles[item.imageFileKey] || sanitizeText(item.imageUrl),
      order: index,
    }))
    .filter((item) => item.imageUrl);

const serializeHomeContent = (doc) => ({
  heroAds: sortByOrder(doc.heroAds || []),
  studentSpotlight: doc.studentSpotlight || {},
  faculties: sortByOrder(doc.faculties || []),
  galleryImages: sortByOrder(doc.galleryImages || []),
  updatedAt: doc.updatedAt,
});

const getPublicHomeContent = async (_req, res) => {
  try {
    const doc = await HomeContent.findOne({ singletonKey: SINGLETON_KEY });

    if (!doc) {
      return res.json({
        heroAds: [],
        studentSpotlight: {},
        faculties: [],
        galleryImages: [],
      });
    }

    return res.json(serializeHomeContent(doc));
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to load home page content.');
  }
};

const getAdminHomeContent = async (_req, res) => {
  try {
    const doc = await getOrCreateHomeContent();
    return res.json(serializeHomeContent(doc));
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to load home content settings.');
  }
};

const updateHomeContent = async (req, res) => {
  try {
    const payload = req.body?.payload ? JSON.parse(req.body.payload) : {};
    const uploadedFilesEntries = await Promise.all(
      (req.files || []).map(async (file) => {
        const fileUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype, 'home-content');
        return [file.fieldname, fileUrl];
      })
    );
    const uploadedFiles = Object.fromEntries(uploadedFilesEntries);

    const doc = await getOrCreateHomeContent();

    doc.heroAds = normalizeHeroAds(payload.heroAds, uploadedFiles);
    doc.studentSpotlight = normalizeStudentSpotlight(payload.studentSpotlight, uploadedFiles);
    doc.faculties = normalizeFaculties(payload.faculties, uploadedFiles);
    doc.galleryImages = normalizeGalleryImages(payload.galleryImages, uploadedFiles);

    await doc.save();

    return res.json({
      message: 'Home page content updated successfully.',
      homeContent: serializeHomeContent(doc),
    });
  } catch (error) {
    return sendErrorResponse(res, error, 'Failed to update home page content.');
  }
};

module.exports = {
  getPublicHomeContent,
  getAdminHomeContent,
  updateHomeContent,
};
