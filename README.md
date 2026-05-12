# Meeting Scheduler - Full-Stack Application

A modern, full-stack meeting management application built with **React**, **Node.js**, and **PostgreSQL**. This project was developed as part of a full-stack exercise, featuring comprehensive CRUD operations, Google Maps integration, and an advanced participant invitation system.

## 🚀 Features

### Core Functionality
- **Full CRUD operations**: Create, read, update, and delete meetings.
- **Meeting Dashboard**: View upcoming meetings in a calendar-integrated dashboard.
- **Location Mapping**: Real-time Google Maps integration based on meeting addresses.
- **Modern UI**: A premium, glassmorphic design built with vanilla CSS.

### Advanced Features
- **User Authentication**: Secure register/login flow with JWT (Access & Refresh tokens).
- **Participant System**: Invite other users to meetings via a tag-based search UI.
- **Attendance Management**: Participants can Accept or Decline invitations directly from their dashboard.
- **Real-time Sync**: Meeting lists update automatically based on invitation responses.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Lucide React (Icons), React Calendar.
- **Backend**: Node.js, Express, TypeScript, PostgreSQL (pg).
- **Database**: PostgreSQL with custom migrations.
- **Security**: JWT Authentication, bcryptjs password hashing, Zod validation.

## 📋 Prerequisites

- Node.js (v20.x or higher)
- PostgreSQL
- npm or yarn

## ⚙️ Setup & Installation

### 1. Clone & Install
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Initialize Database
Run the migration script to set up the tables:
```bash
cd backend
npm run db:init
```

### 4. Run the Application
Go to the root directory and run both services:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 📐 Architecture

- **Backend**: Follows a layered architecture (Controllers -> Service/Business Logic -> Data Access Layer/Models).
- **Frontend**: Component-based architecture with centralized API services and Context API for authentication state.
- **API**: Standard RESTful endpoints for Auth, Meetings, and Participants.

## 📝 Assignment Requirements Handled
- [x] Node.js REST API with SQL storage.
- [x] Full CRUD for meetings (id, title, date, time, address, notes).
- [x] React UI for meeting management.
- [x] Google Maps integration using meeting address.
- [x] Clean separation, validation, and error handling.
