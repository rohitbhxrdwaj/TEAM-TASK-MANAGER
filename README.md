# Team Task Manager

A full-stack MERN web application for managing team projects and tasks, featuring Role-Based Access Control (Admin/Member).

## Installation

1. Install root dependencies:
   `npm install`

2. Install backend dependencies:
   `cd backend && npm install`

3. Install frontend dependencies:
   `cd frontend && npm install`

## Configuration

1. In the `backend` folder, copy `.env.example` to `.env` and fill in your MongoDB URI and JWT Secret.
   `cd backend && cp .env.example .env`

## Running Locally

From the root directory, run:
`npm run dev`

This will start both the backend server and the frontend Vite development server concurrently.

## Deployment (Railway)

This project is configured to deploy seamlessly on Railway using the root `package.json`. The `build` script automatically installs both backend and frontend dependencies and builds the Vite frontend.
