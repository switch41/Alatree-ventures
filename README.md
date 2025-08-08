# Admin Task Management System

A comprehensive MERN stack (MongoDB, Express.js, React, Node.js) application designed for efficient administration and management of tasks, itineraries, and user roles. It provides a robust backend API and a responsive React frontend for a seamless administrative experience.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Important Notes](#important-notes)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

*   **User Authentication**: Secure login for administrators.
*   **User Management**: CRUD operations for users, including role assignment (admin, staff, user) and activation/deactivation.
*   **Task Management**: Create, read, update, and delete tasks with various types (survey, quiz, challenge, event, submission), points, duration, and difficulty. Includes search and filtering capabilities.
*   **Itinerary Management**: Define and manage itineraries, which are sequences of tasks. Schedule itineraries with recurrence options.
*   **Analytics & Reporting**: Dashboard providing an overview of total users, tasks, itineraries, active cycles, and recent activity. Includes charts for engagement, task distribution, and revenue (with sample data).
*   **Job Scheduler**: Manage background jobs like prize draws, notifications, and data cleanup, with the ability to enable/disable them.
*   **Internationalization (i18n)**: Support for multiple languages (English, Spanish, French).
*   **Responsive UI**: Built with Tailwind CSS for a modern and adaptive user interface.

## Technologies Used

### Frontend (Client)

*   **React.js**: A JavaScript library for building user interfaces.
*   **React Router DOM**: For declarative routing in React applications.
*   **Axios**: Promise-based HTTP client for making API requests.
*   **React Hot Toast**: For beautiful and responsive toast notifications.
*   **React Hook Form**: For efficient form validation and management.
*   **Recharts**: A composable charting library built on React components.
*   **Lucide React**: A collection of beautiful and customizable SVG icons.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
*   **i18next & React-i18next**: For internationalization (multi-language support).

### Backend (Server)

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB**: NoSQL database for storing application data.
*   **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
*   **JSON Web Token (JWT)**: For secure user authentication.
*   **Bcrypt.js**: For hashing passwords.
*   **Express Validator**: Middleware for validating request data.
*   **Helmet**: Helps secure Express apps by setting various HTTP headers.
*   **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
*   **Express Rate Limit**: Basic rate-limiting middleware to protect against brute-force attacks.
*   **Node-Cron**: A simple cron-like job scheduler for Node.js.
*   **Dotenv**: Loads environment variables from a `.env` file.
*   **Stripe**: (Integrated but not fully implemented in current features) For payment processing.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

*   **Node.js**: [v14.x or higher](https://nodejs.org/en/download/)
*   **npm**: (Comes with Node.js) [v6.x or higher](https://www.npmjs.com/get-npm)
*   **MongoDB**: [Community Server](https://www.mongodb.com/try/download/community) (local installation) or access to a MongoDB Atlas cluster.

## Installation

Follow these steps to get the project up and running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd admin-task-management-system
    ```

2.  **Install root dependencies:**
    This will install `concurrently` which is used to run both client and server simultaneously.
    ```bash
    npm install
    ```

3.  **Install server dependencies:**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Install client dependencies:**
    ```bash
    cd client
    npm install
    cd ..
    ```

## Configuration

### Server `.env` File

Create a `.env` file in the `server/` directory with the following content. **Replace placeholder values** with your actual secrets and configurations.

```dotenv
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/admin-task-management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d

# Stripe (Test Mode) - Optional, if not using payments, these can be left as is
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Admin User (First Run) - Default admin credentials for initial setup
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

*   **`MONGODB_URI`**: If you're using a local MongoDB, `mongodb://localhost:27017/admin-task-management` is typical. If using MongoDB Atlas, use your connection string.
*   **`JWT_SECRET`**: Generate a strong, random string for production.
*   **`ADMIN_EMAIL` / `ADMIN_PASSWORD`**: These are used to create a default admin user if no admin user exists in the database on server startup. **Change these for production!**

## Running the Application

From the project root directory (`admin-task-management-system/`), run:

```bash
npm run dev
```

This command uses `concurrently` to start both the backend server (on `http://localhost:5000`) and the React development server (on `http://localhost:3000`).

## Usage

1.  Open your web browser and navigate to `http://localhost:3000`.
2.  You will be redirected to the login page.
3.  **Default Admin Credentials:**
    *   **Email**: `admin@example.com`
    *   **Password**: `admin123`
4.  After successful login, you will be redirected to the dashboard.
5.  Explore the navigation menu on the left to manage tasks, itineraries, users, view analytics, and control the scheduler.

### Creating a New User

1.  Navigate to the "Users" section from the sidebar.
2.  Click the "Create User" button.
3.  Fill in the user details (Name, Email, Password, Role, Active Status).
4.  Click "Create User" to save.

## Project Structure

```
admin-task-management-system/
├── client/                     # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable React components (e.g., Layout, Sidebar, Header)
│   │   ├── contexts/           # React Contexts (e.g., AuthContext)
│   │   ├── locales/            # Internationalization (i18n) translation files
│   │   ├── pages/              # Main application pages (e.g., Login, Dashboard, Users, Tasks)
│   │   ├── App.js              # Main React application component and routing
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Tailwind CSS imports and custom styles
│   └── package.json
├── server/                     # Node.js/Express backend API
│   ├── config/                 # Database connection setup
│   ├── middleware/             # Authentication and authorization middleware
│   ├── models/                 # Mongoose schemas for MongoDB collections
│   ├── routes/                 # API endpoints (e.g., auth, admin)
│   ├── services/               # Background services (e.g., scheduler)
│   ├── .env                    # Environment variables (local)
│   ├── index.js                # Server entry point
│   └── package.json
├── package.json                # Root package.json for concurrently
└── README.md                   # This file
```

## Important Notes

*   **Environment Variables**: The `.env` file in the `server/` directory is crucial for configuration. It is listed in `.gitignore` and should **not** be committed to version control for security reasons.
*   **Node Modules**: The `node_modules` directories (in root, `client/`, and `server/`) are also in `.gitignore` and should not be committed.
*   **Temporary Admin Password Reset**: During initial setup, a temporary change was made to `server/config/database.js` to force the admin user's password to be reset on every server start. **For production or continued development, it is CRITICAL to revert this change** to its original state to maintain security. The original `createDefaultAdmin` function should only create the admin user if it doesn't already exist.

    **Original `createDefaultAdmin` function (to revert to):**
    ```javascript
    const createDefaultAdmin = async () => {
      try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');
        
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) { // This is the original check
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
          const hashedPassword = await bcrypt.hash(adminPassword, 12);
          
          await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            isActive: true
          });
          
          console.log(`Default admin user created with email: ${process.env.ADMIN_EMAIL || 'admin@example.com'} and password (hashed): ${adminPassword.substring(0, 3)}...`);
        } else {
          console.log('Default admin user already exists.');
        }
      } catch (error) {
        console.error('Error creating default admin:', error);
      }
    };
    ```

## Future Enhancements

*   User profile editing (currently only creation and role change are implemented).
*   More detailed analytics and customizable reports.
*   Full integration of Stripe for payment-related features.
*   Advanced task features (e.g., task dependencies, progress tracking, file uploads).
*   Notifications system for admin and users.
*   Audit logging for administrative actions.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
