require('dotenv').config();
const { google } = require('googleapis');

async function testDriveRange() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // Assuming there's a file ID we can use, let's just search for one
    const list = await drive.files.list({ pageSize: 1, q: "mimeType contains 'video'" });
    if (!list.data.files.length) {
      console.log('No video files found');
      return;
    }
    const fileId = list.data.files[0].id;
    console.log('Testing with fileId:', fileId);

    const res = await drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream', headers: { Range: 'bytes=0-1' } }
    );
    
    console.log('Google Drive Response Status:', res.status);
    console.log('Google Drive Response Headers:', res.headers);
    
    let size = 0;
    res.data.on('data', chunk => { size += chunk.length; });
    res.data.on('end', () => { console.log('Total bytes received:', size); });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDriveRange();
