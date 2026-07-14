# Society Maintenance Tracker

A comprehensive, full-stack web application designed to streamline the management of residential societies. It enables residents to easily lodge maintenance complaints and empowers administrators to track, manage, and resolve issues efficiently.

**Live demo:** https://society-frontend-14ht.onrender.com

**Backend API:** https://society-backend-kzvj.onrender.com

**Admin login:** admin@example.com / AdminPass123

## Tech Stack

- **Frontend**: React, Vite, React Router DOM, Tailwind-inspired Vanilla CSS (Glassmorphism UI)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Cloud Services**: Cloudinary (Image Hosting), Nodemailer (Email Notifications)

---

## Setup Guide

Follow these steps to run the project locally.

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas cluster)

### 2. Installation
Clone the repository and install dependencies for both the backend and frontend:

```bash
# Clone the repository
git clone https://github.com/Aavi-7582/society-maintenance-tracker.git
cd society-maintenance-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
In the `backend` directory, create a `.env` file using the provided `.env.example` as a template:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Society
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
OVERDUE_DAYS=5
```

### 4. Running the Application

**Start the Backend Server:**
```bash
cd backend
npm start
```
*(Runs on `http://localhost:5000`)*

**Start the Frontend Development Server:**
```bash
cd frontend
npm run dev
```
*(Runs on `http://localhost:5174` or configured Vite port)*

---

## 🗄️ Database Schema Overview

### 1. User Model (`User`)
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed)
- `role` (Enum: `resident`, `admin`)
- `flatNo` (String, required if resident)

### 2. Complaint Model (`Complaint`)
- `title` (String, required)
- `description` (String, required)
- `category` (Enum: Plumbing, Electrical, Security, etc.)
- `priority` (Enum: Low, Medium, High)
- `status` (Enum: OPEN, IN_PROGRESS, RESOLVED)
- `photo` (String, URL to Cloudinary)
- `resident` (ObjectId, ref: 'User')
- `statusHistory` (Array of nested objects):
  - `status` (String)
  - `note` (String)
  - `actor` (ObjectId, ref: 'User')
  - `timestamp` (Date)

### 3. Notice Model (`Notice`)
- `title` (String, required)
- `description` (String, required)
- `isImportant` (Boolean, default: false)
- `postedBy` (ObjectId, ref: 'User')

---

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /register` - Register a new resident/admin
- `POST /login` - Authenticate user and return JWT

### Complaints (`/api/complaints`)
- `POST /` - Create a new complaint (Resident) - *Supports `multipart/form-data` for image uploads.*
- `GET /my-complaints` - Fetch complaints for logged-in resident
- `GET /:id` - Get details of a specific complaint (Shared)

### Admin Operations (`/api/admin`)
- `GET /complaints` - Get all complaints (Supports `search`, `status`, `category` queries)
- `GET /dashboard/stats` - Get aggregate statistics (Total, Overdue, Category Dist.)
- `PATCH /complaints/:id/status` - Update status and append to history
- `PATCH /complaints/:id/priority` - Update complaint priority

### Notices (`/api/notices`)
- `POST /` - Post a new notice (Admin)
- `GET /` - Fetch all notices (Shared)
