const http = require('http');
const readline = require('readline');
const { google } = require('googleapis');

const scopes = ['https://www.googleapis.com/auth/drive'];

const ask = (question) => new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  });
});

const main = async () => {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID ||
    await ask('Paste GOOGLE_DRIVE_CLIENT_ID: ');
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET ||
    await ask('Paste GOOGLE_DRIVE_CLIENT_SECRET: ');

  const server = http.createServer();

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  console.log('\nOpen this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nWaiting for Google login callback...\n');

  server.on('request', async (req, res) => {
    try {
      const url = new URL(req.url, redirectUri);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`Google returned error: ${error}`);
        throw new Error(error);
      }

      if (!code) {
        res.end('No code received from Google.');
        return;
      }

      const { tokens } = await oauth2Client.getToken(code);

      res.end('Refresh token generated. You can close this tab and return to the terminal.');
      server.close();

      console.log('Add these values to backend .env:\n');
      console.log(`GOOGLE_DRIVE_CLIENT_ID=${clientId}`);
      console.log(`GOOGLE_DRIVE_CLIENT_SECRET=${clientSecret}`);
      console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token || 'NO_REFRESH_TOKEN_RETURNED_TRY_AGAIN'}`);
      console.log('\nKeep GOOGLE_DRIVE_FOLDER_ID as your Drive folder id.');
      console.log('\nIf refresh token is missing, run this script again and make sure prompt=consent URL is used.');
    } catch (err) {
      server.close();
      console.error('Failed to generate refresh token:', err.message);
      process.exitCode = 1;
    }
  });
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
