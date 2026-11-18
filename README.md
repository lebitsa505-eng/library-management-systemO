# BookWise – Library Management System

## Project Overview
BookWise is a web-based Library Management System developed to simplify library operations. It allows authorised users to manage books, monitor stock availability, record borrowing and returning transactions, and manage library users.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- React Router

### Backend
- Node.js
- Express.js
- REST API
- JSON Web Tokens (JWT)
- bcrypt

### Database
- MySQL 8.0

## Main Features

- **Dashboard:** Displays library statistics, book availability and low-stock alerts.
- **Book Management:** Add, view, update and delete books.
- **Inventory Tracking:** Tracks available and borrowed book quantities.
- **Transactions:** Records borrowing and returning activities.
- **User Management:** Manage library members and staff accounts.
- **Authentication:** Secure login using password hashing and JWT.
- **Role-Based Access Control:** Different permissions for Admin, Librarian and Member accounts.

## Project Structure

```text
library-management-system/
│
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/lebitsa505-eng/library-management-systemO.git
cd library-management-systemO
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder and configure your own database credentials and JWT secret.

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Run the backend

From the backend folder:

```bash
npm run dev
```

The backend runs on port 5000, while the frontend runs on port 5173.

## Security

- Passwords are hashed using bcrypt.
- JWT authentication protects API routes.
- Role-based authorisation restricts sensitive operations.
- Environment variables are used for database credentials and JWT secrets.

## Project Purpose

This project was developed as part of the Web Application Development coursework to demonstrate practical skills in frontend development, backend API development, database integration, authentication and full-stack application design.