# Google Drive Video Upload Guide - Hinglish

Ye guide MathsPoint ke new Google Drive video system ke liye hai.

Important:

- `frontend/` ko touch nahi karna hai.
- Existing website ka YouTube system same rahega.
- Google Drive wala system mainly Flutter app ke liye hai.
- Google Drive credentials sirf backend me rahenge.
- Mobile app ko kabhi bhi Google credentials nahi milenge.

## 1. Google Drive Setup

Sabse pehle Google Cloud me service account banana hoga.

Steps:

1. Google Cloud Console open karo.
2. Ek project select/create karo.
3. Google Drive API enable karo.
4. Service Account create karo.
5. Service Account ka JSON key download karo.
6. Google Drive me ek folder banao, jaise:

```text
MathsPoint Videos
```

7. Is folder ko service account email ke saath share karo.

Service account email kuch aisa dikhega:

```text
mathspoint-video@project-id.iam.gserviceaccount.com
```

Is email ko Drive folder me `Editor` access do.

## 2. Backend Env Variables

Recommended setup agar aap apne personal/Workspace Google account ke 10 TB storage me upload karna chahte ho:

```env
GOOGLE_DRIVE_CLIENT_ID=your-oauth-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-oauth-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-oauth-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

Is mode me upload aapke Google account ke Drive storage me hoga.

Service account setup sirf tab use karo jab aap Shared Drive use kar rahe ho, ya service account ko storage-supported Workspace setup mila ho:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account-email
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id
```

Important:

Normal service account ke paas apni Drive storage quota nahi hoti. Agar error aaye:

```text
Service Accounts do not have storage quota
```

to OAuth refresh token wala setup use karo, ya Google Workspace Shared Drive use karo.

Folder ID kaise milega:

Google Drive folder open karo. URL kuch aisa hoga:

```text
https://drive.google.com/drive/folders/1ABCxyzFolderIdHere
```

Isme `1ABCxyzFolderIdHere` folder id hai.

## 3. Backend Restart

Env add karne ke baad backend restart karna zaroori hai:

```bash
cd backend
npm install
npm start
```

Development me:

```bash
npm run dev
```

## 4. Video Upload API

Google Drive video lesson upload ke liye backend endpoint:

```http
POST /api/admin/lesson/google-drive
```

Ye admin protected endpoint hai. Iske liye admin token chahiye.

Headers:

```http
Authorization: Bearer ADMIN_TOKEN
Content-Type: multipart/form-data
```

Form-data fields:

```text
video       = actual video file
courseId   = course id
title      = video title
subject    = optional subject name
description = optional description
moduleTitle = chapter name
duration   = optional duration in seconds
thumbnail  = optional thumbnail url
isPublished = true / false
isFree     = true / false
```

Example:

```text
video: intro.mp4
courseId: 66abc123...
title: Introduction to Trigonometry
subject: Mathematics
moduleTitle: Trigonometry
duration: 1063
isPublished: true
isFree: false
```

## 5. Postman Se Upload Kaise Test Kare

1. Postman open karo.
2. Method `POST` select karo.
3. URL daalo:

```text
https://mathspoint.co.in/api/admin/lesson/google-drive
```

Local server pe:

```text
http://localhost:5000/api/admin/lesson/google-drive
```

4. Authorization header add karo:

```text
Authorization: Bearer ADMIN_TOKEN
```

5. Body me `form-data` select karo.
6. `video` key ko type `File` set karo.
7. Video file select karo.
8. Baaki fields text ke form me daalo.
9. Send karo.

Success response me ye milega:

```json
{
  "_id": "lesson_id",
  "videoType": "google_drive",
  "driveFileId": "google_drive_file_id",
  "thumbnailUrl": "thumbnail_url",
  "mimeType": "video/mp4",
  "size": 123456789
}
```

## 6. Database Me Kya Save Hoga

MongoDB `Lesson` collection me actual video save nahi hoti.

Sirf metadata save hota hai:

```text
videoType: google_drive
driveFileId: Google Drive file id
thumbnailUrl: Drive thumbnail url
mimeType: video/mp4
size: file size
```

Actual video Google Drive me rahegi.

## 7. Student Playback Flow

Flutter app me student jab video lecture open karega:

```text
Course -> Subject -> Chapter -> Video Lecture
```

App pehle ye API call karega:

```http
GET /api/lesson/:lessonId
```

Backend check karega:

- Student logged in hai ya nahi
- Lesson published/free hai ya nahi
- Paid course hai to student enrolled hai ya nahi
- Video type `google_drive` hai ya nahi

Phir backend app ko stream URL dega:

```text
/api/videos/:lessonId/stream
```

Flutter app final URL banata hai:

```text
https://mathspoint.co.in/api/videos/:lessonId/stream?token=STUDENT_TOKEN
```

## 8. Video Stream Endpoint

Playback ke liye endpoint:

```http
GET /api/videos/:lessonId/stream
```

Ye endpoint protected hai.

Backend:

1. Student token verify karta hai.
2. Student access verify karta hai.
3. MongoDB se `driveFileId` leta hai.
4. Google Drive se video stream karta hai.
5. Flutter player ko video chunks bhejta hai.

Important:

- Drive file public nahi hoti.
- Backend video ko RAM me pura load nahi karta.
- Backend progressive streaming karta hai.
- Seeking ke liye Range requests support hoti hain.

## 9. Range Request Support

Flutter video player seek/play ke time Range request bhej sakta hai:

```http
Range: bytes=0-1048575
```

Backend response:

```http
206 Partial Content
Accept-Ranges: bytes
Content-Range: bytes 0-1048575/123456789
Content-Length: 1048576
Content-Type: video/mp4
```

Agar invalid range aaye:

```http
416 Range Not Satisfiable
```

## 10. Free Classes Me Kaise Dikhega

Home tab me:

```text
Free Classes -> Free Google Drive Lessons
```

Free classes ke liye backend endpoint:

```http
GET /api/lessons/free/google-drive
```

Ye sirf un lessons ko return karega:

```text
videoType = google_drive
isFree = true
isPublished = true
```

Iska matlab:

- Old public YouTube free videos ko app me YouTube player se play nahi kiya jayega.
- Google Drive free lessons hi custom app player me khulenge.

## 11. Flutter Video Player

Flutter app me separate screen bani hai:

```text
mobile_app/lib/screens/video/drive_lesson_player_screen.dart
```

Features:

- Thumbnail first
- Big play button
- Video initialize sirf play click ke baad
- Play / pause
- 10 second forward
- 10 second backward
- Seek bar
- Current time
- Total duration
- Buffering loader
- Mute / unmute
- Volume slider
- Fullscreen / exit fullscreen
- Error state
- Existing progress API se progress save

## 12. Progress Kaise Save Hota Hai

Existing progress API reuse hoti hai:

```http
POST /api/lesson/:lessonId/progress
```

Body:

```json
{
  "progress": 45.5,
  "watchDuration": 30
}
```

Completion rule same hai:

```text
90% ya usse zyada progress = lesson completed
```

Naya progress system create nahi kiya gaya.

## 13. YouTube System Ka Kya Hoga

Existing YouTube system remove nahi hua.

YouTube lessons abhi bhi:

```text
videoType = youtube
encryptedVideoId
videoIV
```

React website ka YouTube player same rahega.

Flutter app ka new player YouTube player nahi hai. Ye sirf backend stream URL se video play karta hai.

## 14. First Test Checklist

Pehle sirf ek video se test karo.

Checklist:

- Backend `.env` me Google Drive credentials add hain
- Drive folder service account ke saath share hai
- Backend restart ho chuka hai
- Admin token valid hai
- Video upload API success response de rahi hai
- MongoDB me lesson save hua hai
- `videoType` value `google_drive` hai
- `driveFileId` save hua hai
- `isPublished` true hai
- Student enrolled hai, ya lesson `isFree` true hai
- Flutter app me lesson show ho raha hai
- Thumbnail show ho raha hai
- Play click karne ke baad video start ho raha hai
- Seek bar work kar raha hai
- Fullscreen work kar raha hai
- Progress save ho raha hai

## 15. Common Problems

### Problem: Upload fail ho raha hai

Check karo:

- Google Drive API enabled hai
- Service account email correct hai
- Private key `.env` me correct format me hai
- Drive folder service account ke saath shared hai
- `GOOGLE_DRIVE_FOLDER_ID` correct hai

### Problem: Video app me nahi chal rahi

Check karo:

- Lesson `videoType` `google_drive` hai
- `driveFileId` empty nahi hai
- Student token valid hai
- Student enrolled hai
- Lesson published hai
- Backend stream endpoint 200/206 return kar raha hai

### Problem: 403 aa raha hai

Matlab student ko access nahi hai.

Fix:

- Student ko course me enroll karo
- Ya lesson ko free set karo

### Problem: 416 aa raha hai

Invalid Range request hai.

Usually player retry karega. Agar baar-baar aaye to `size` metadata check karo.

### Problem: Hot reload error aa raha hai

Flutter me dependency/new screen changes ke baad hot reload enough nahi hota.

Run:

```bash
flutter clean
flutter pub get
flutter run
```

Ya at least hot restart karo.

## 16. Important Security Notes

- Google Drive video public mat karo.
- Credentials mobile app me mat daalo.
- Credentials frontend me mat daalo.
- Stream endpoint ko public mat karo.
- Student access backend me verify hona chahiye.
- Token ke bina stream play nahi honi chahiye.

## 17. Next Step

Abhi implementation ka target one-video playback test hai.

Next future task:

- Flutter admin upload UI
- Upload progress bar
- Large file upload UX
- Lesson switching UI improve karna
- 10-20 users ke saath concurrent playback test
- Google Drive quota/limit observe karna
