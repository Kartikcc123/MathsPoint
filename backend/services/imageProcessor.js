const sharp = require('sharp');
const bannerSizes = require('../config/bannerSizes');
const { uploadToS3 } = require('./awsService');

const processAndUploadBanners = async (fileBuffer, originalName) => {
  const uploadPromises = [];
  
  // 1. Upload original
  uploadPromises.push(
    uploadToS3(fileBuffer, originalName, 'image/webp', 'advertisements/original').then(url => ({ type: 'original', url }))
  );

  // 2. Process and upload versions
  const processVersion = async (type, config) => {
    const processedBuffer = await sharp(fileBuffer)
      .resize({
        width: config.width,
        height: config.height,
        fit: sharp.fit.contain,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent padding
      })
      .webp({ quality: config.quality })
      .toBuffer();

    const url = await uploadToS3(
      processedBuffer, 
      `${type}.webp`, 
      'image/webp', 
      `advertisements/${type}`
    );
    return { type, url };
  };

  for (const [type, config] of Object.entries(bannerSizes)) {
    uploadPromises.push(processVersion(type, config));
  }

  const results = await Promise.all(uploadPromises);
  
  // Format results into an object
  const urls = {};
  results.forEach(result => {
    urls[result.type] = result.url;
  });

  return {
    originalImage: urls.original,
    desktopImage: urls.desktop,
    tabletImage: urls.tablet,
    mobileImage: urls.mobile,
    thumbnailImage: urls.thumbnail,
  };
};

module.exports = {
  processAndUploadBanners,
};
