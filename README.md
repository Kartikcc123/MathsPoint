# Academic Plus

Academic Plus is a full-stack student management and learning platform built for a coaching or institute workflow. It combines a public-facing website with separate admin and student panels so the institute can manage courses, materials, attendance, fees, notifications, and results from one system.

## Overview

This project is split into two parts:

- `frontend` - React + Vite application for the website, student panel, and admin panel
- `backend` - Express + MongoDB API for authentication, student management, course management, results, fees, attendance, and notifications

## Main Features

### Public Website

- Home page with dedicated sections such as hero, about, courses, faculties, results, gallery, testimonials, and contact
- Public course listing
- Faculty and contact pages
- Student registration and login

### Admin Panel

- Admin dashboard
- Student registration and student list management
- Course creation and course assignment to students
- Student panel access control
- Study material upload with file support using `multer`
- Attendance management by course and date
- Payment and fee record tracking
- Notification creation and editing
- Result upload from CSV, draft creation, and publishing

### Student Panel

- Student dashboard with course, fee, result, and attendance summary
- View enrolled course materials
- Track payments and submit fee payment details
- View notifications
- Check attendance and results

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React / React Icons

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing
- multer for file uploads

## Project Structure

```text
Academic-Plus/
|-- backend/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- uploads/
|   |-- index.js
|   |-- package.json
|   `-- seed.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   `-- services/
|   |-- index.html
|   `-- package.json
|-- .gitignore
`-- README.md
```

## Available Routes

### Backend API Base

- `http://localhost:5000/api`

### Auth Routes

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/register-admin`
- `GET /api/auth/profile`

### Admin Routes

- `GET /api/admin/students`
- `POST /api/admin/student`
- `PATCH /api/admin/student/:id/course`
- `PATCH /api/admin/student/:id/panel`
- `GET /api/admin/courses`
- `POST /api/admin/course`
- `GET /api/admin/materials`
- `POST /api/admin/material`
- `GET /api/admin/payments`
- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `PATCH /api/admin/notifications/:id`
- `GET /api/admin/attendance/:courseId`
- `POST /api/admin/attendance/:courseId`
- `POST /api/admin/results/upload`
- `POST /api/admin/results/create`
- `PATCH /api/admin/results/publish`

### Student Routes

- `GET /api/student/dashboard`
- `GET /api/student/materials`
- `GET /api/student/payments`
- `POST /api/student/payments/:feeId/pay`
- `GET /api/student/notifications`

### Public Routes

- `GET /api/public/courses`

## Getting Started

### 1. Clone the project

```bash
git clone <your-repository-url>
cd Maths
```

### 2. Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file inside `backend/` and add:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/academic-plus
JWT_SECRET=your_jwt_secret
```

## Running the Project

### Start the backend

From the `backend` folder:

```bash
node index.js
```

### Start the frontend

From the `frontend` folder:

```bash
npm run dev
```

The frontend is configured to call the backend at:

```text
http://localhost:5000/api
```

## Database Seeding

To seed demo users, run this command from the `backend` folder:

```bash
node seed.js
```

This creates:

- Admin: `admin@academicplus.com` / `admin123`
- Student: `student@academicplus.com` / `password`

## Authentication and Access

- JWT-based authentication is used for protected API routes
- Admin routes are protected with `protect` and `admin` middleware
- Student routes are protected with `protect` middleware
- Students can log in using email, and the backend also supports login using `studentId`

## Notes

- Uploaded files are served from `backend/uploads`
- The frontend currently uses a hardcoded API base URL in `frontend/src/services/api.js`
- The `register-admin` route is public in the current implementation and should be secured before production use
- There are no automated tests configured yet in this repository

## Future Improvements

- Add role-based route guards in the frontend
- Move frontend API base URL to environment variables
- Add validation and error handling improvements
- Add automated tests for API and UI
- Secure admin bootstrap and production deployment settings

## Author

Built for the Academic Plus management and student learning workflow.
