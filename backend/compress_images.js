const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'frontend', 'src', 'assets');
const MAX_WIDTH = 1200;

async function processImages() {
  try {
    const files = fs.readdirSync(ASSETS_DIR);
    
    for (const file of files) {
      if (!file.match(/\.(png|jpe?g)$/i)) continue;
      
      const filePath = path.join(ASSETS_DIR, file);
      const stat = fs.statSync(filePath);
      
      // Only process files larger than 500KB
      if (stat.size > 500 * 1024) {
        console.log(`Processing ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);
        
        const tempPath = filePath + '.tmp';
        const newFileName = file.replace(/\.(png|jpe?g)$/i, '.webp');
        const newFilePath = path.join(ASSETS_DIR, newFileName);
        
        await sharp(filePath)
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .webp({ quality: 80 }) // Converting to WebP for massive savings
          .toFile(tempPath);
          
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, newFilePath);
        
        const newStat = fs.statSync(newFilePath);
        console.log(`Saved as WebP. New size: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
      }
    }
    console.log('Image optimization complete.');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

processImages();
