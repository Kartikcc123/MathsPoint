const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const { uploadToS3 } = require('../services/awsService');
const mime = require('mime-types');

const ASSETS_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets');
const OUTPUT_FILE = path.join(__dirname, 'migration_result.json');

async function run() {
  const files = fs.readdirSync(ASSETS_DIR);
  const results = {};
  
  for (const file of files) {
    if (file.match(/\.(png|jpe?g|webp)$/i)) {
      const filePath = path.join(ASSETS_DIR, file);
      const buffer = fs.readFileSync(filePath);
      const mimeType = mime.lookup(filePath) || 'image/jpeg';
      
      console.log(`Uploading ${file}...`);
      try {
        const s3Url = await uploadToS3(buffer, file, mimeType, 'static-assets');
        results[file] = s3Url;
        console.log(`Uploaded ${file} -> ${s3Url}`);
      } catch (e) {
        console.error(`Failed to upload ${file}`, e);
      }
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log('Migration complete. Wrote URLs to', OUTPUT_FILE);
}

run();
