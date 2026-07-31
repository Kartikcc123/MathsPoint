const mongoose = require('mongoose');

const heroAdSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    linkLabel: { type: String, trim: true, default: '' },
    linkUrl: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const studentSpotlightSchema = new mongoose.Schema(
  {
    primaryImageUrl: { type: String, trim: true, default: '' },
    primaryAlt: { type: String, trim: true, default: 'Lead student' },
    primaryQuote: { type: String, trim: true, default: '' },
    secondaryImageUrl: { type: String, trim: true, default: '' },
    secondaryAlt: { type: String, trim: true, default: 'Student' },
    secondaryQuote: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const facultySchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: '' },
    exp: { type: String, trim: true, default: '' },
    tag: { type: String, trim: true, default: '' },
    desc: { type: String, trim: true, default: '' },
    img: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const galleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const homeContentSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'home-page',
      unique: true,
      trim: true,
    },
    heroAds: {
      type: [heroAdSchema],
      default: [],
    },
    studentSpotlight: {
      type: studentSpotlightSchema,
      default: () => ({}),
    },
    faculties: {
      type: [facultySchema],
      default: [],
    },
    galleryImages: {
      type: [galleryImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeContent', homeContentSchema);
