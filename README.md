# D.Pharm 1st Year MCQ Practice Platform

A production-ready full-stack web application for Pharmacy students to practice subject-wise MCQs, take timed mock exams, and view performance analytics.

## Technologies Used
- **Frontend**: Next.js (App Router), React, TailwindCSS, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MongoDB with Mongoose

## Prerequisites
- Node.js installed on your machine
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/dpharm-mcq`)

---

## 🚀 Setup Instructions

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with the initial Admin user and Example Subject/MCQ Data:
   ```bash
   node seed.js
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   # OR
   node server.js
   ```
   *The backend will run on `http://localhost:5000`*

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`*

---

## 🔑 Default Accounts

After running the `node seed.js` command, the following admin account will be available:

- **Admin Email**: `admin@dpharm.com`
- **Admin Password**: `admin123`

You can use this account to login, access the Admin Dashboard, add new Subjects, and Bulk Upload new MCQs.

---

## 📋 Features Overview

- **Subject Selection**: Responsive grid of D.Pharm subjects using Lucide Icons.
- **Interactive MCQ Practice**: Immediate feedback (Green = Correct, Red = Wrong). Disables option selection after answering.
- **Timed Exam Mode**: Simulates a real test environment with a countdown timer and auto-submission at the end. Generates a beautiful result view with accuracy charts.
- **User Dashboard**: Tracks attempted questions, correct ratio, and subject-wise accuracy securely.
- **Admin Dashboard**: Secure routes for Admins to manage subjects and execute a **Bulk Upload Parser** to instantly ingest 30-40 plain text MCQs at once into the database.

---

## ☁️ Vercel Deployment Guide

Deploying this full-stack application to Vercel requires deploying the Backend and Frontend as two separate projects.

### Step 1: Deploy Backend to Vercel
1. Push your code to a GitHub repository.
2. Go to Vercel and **Add New Project**. Select your repository.
3. In "Framework Preset", select **Other**.
4. Set the **Root Directory** to `backend`.
5. Under **Environment Variables**, add:
   - `MONGO_URI` (Your MongoDB Atlas connection string)
   - `JWT_SECRET` (A secure random string)
6. Click **Deploy**. Vercel will use `vercel.json` to deploy the Express API as Serverless Functions.
7. Once deployed, copy the assigned Vercel domain (e.g., `https://my-backend.vercel.app`).

### Step 2: Deploy Frontend to Vercel
1. Go back to Vercel and **Add New Project** again. Select the exact same repository.
2. In "Framework Preset", select **Next.js**.
3. Set the **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://my-backend.vercel.app/api` (The URL you copied in Step 1 + `/api`)
5. Click **Deploy**.

Your D.Pharm MCQ platform is now fully deployed and live on Vercel!
