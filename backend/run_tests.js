const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find a student and a drive lesson
  const student = await User.findOne({ role: 'student' });
  const lesson = await Lesson.findOne({ videoType: 'google_drive' });
  
  if (!student || !lesson) {
    console.log('Need a student and a google drive lesson for testing.');
    process.exit(0);
  }

  // Generate valid normal auth token (what frontend actually passes)
  const validToken = jwt.sign(
    { id: student._id },
    process.env.JWT_SECRET,
    { expiresIn: 300 }
  );

  // Generate expired normal auth token
  const expiredToken = jwt.sign(
    { id: student._id },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );

  const makeRequest = (method, token, headers = {}) => {
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/videos/' + lesson._id + '/stream?token=' + token,
        method,
        headers,
      };

      const start = Date.now();
      const req = http.request(options, (res) => {
        let size = 0;
        res.on('data', chunk => size += chunk.length);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            bodySize: size,
            timeMs: Date.now() - start
          });
        });
      });
      req.end();
    });
  };

  console.log('--- TEST RESULTS ---');
  
  // Test 1: HEAD Request (Verification)
  const headRes = await makeRequest('HEAD', validToken);
  console.log('\\n1. HEAD Request (Valid Token):');
  console.log('Status:', headRes.status);
  console.log('Content-Length Header:', headRes.headers['content-length']);
  console.log('Content-Type Header:', headRes.headers['content-type']);
  console.log('Body Size Downloaded (bytes):', headRes.bodySize);
  console.log('Time (ms):', headRes.timeMs);
  
  // Test 2: Expired Token
  const expRes = await makeRequest('GET', expiredToken);
  console.log('\\n2. GET Request (Expired Token):');
  console.log('Status:', expRes.status);
  console.log('Content-Type Header:', expRes.headers['content-type']);
  
  // Test 3: GET Request with Range (Seeking/Streaming)
  const getRes = await makeRequest('GET', validToken, { 'Range': 'bytes=0-10' });
  console.log('\\n3. GET Request (Valid Token, Range: bytes=0-10):');
  console.log('Status:', getRes.status);
  console.log('Content-Range Header:', getRes.headers['content-range']);
  console.log('Body Size Downloaded (bytes):', getRes.bodySize);
  console.log('Time (ms):', getRes.timeMs);

  process.exit(0);
}

runTests().catch(console.error);
