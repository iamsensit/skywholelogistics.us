# Driver Management App

A Next.js application for managing driver information with authentication.

## Features

- User authentication (Sign up / Sign in)
- Session management with NextAuth.js
- Add, edit, and delete drivers
- View driver details
- Search drivers
- MongoDB database integration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/driver-app
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory
  - `/api` - API routes (authentication, drivers)
  - `/login` - Login page
  - `/signup` - Signup page
  - `/drivers` - Drivers list page
  - `/driver-form` - Add/Edit driver form
  - `/drivers/[id]` - Driver detail page
- `/lib` - Utility functions (MongoDB connection)
- `/models` - Mongoose models (User, Driver)

## Usage

1. **Sign Up**: Create a new account
2. **Sign In**: Login to your account
3. **Add Driver**: Click "Add Driver" to create a new driver entry
4. **View Drivers**: See all your drivers on the drivers page
5. **Edit Driver**: Click the edit icon on any driver card
6. **Delete Driver**: Click the delete icon on any driver card
7. **View Details**: Click "View Details" to see full driver information

## Technologies Used

- Next.js 16
- React 19
- NextAuth.js (Authentication)
- MongoDB with Mongoose
- Tailwind CSS
- TypeScript
- Heroicons
