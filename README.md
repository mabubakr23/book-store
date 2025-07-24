# 📚 Book Store Management API

This is a backend API built with **Node.js**, **Express**, and **Prisma ORM**, designed to manage a digital book store. It supports operations like borrowing, buying, and returning books, handling stock and wallet transactions, and providing administrative summaries.

**Backend is deployed at:** [https://book-store-production-61e1.up.railway.app/](https://book-store-production-61e1.up.railway.app/)

---

## 🚀 Features

### ✅ User Operations

- Borrow and return books
- Buy books

### 🛒 Inventory Management

- Track stock levels
- Auto-restock notifications for low stock

### 💰 Wallet System

- Wallet balance tracking
- Automated transactions for stock events
- Milestone-based notifications

### 🛠 Admin Utilities

- Book action history (BORROW, BUY, STOCK)
- User-book summary reports
- Wallet transaction logs

---

## 📦 Technologies Used

- **Node.js + Express** – API server
- **Prisma ORM** – Database interaction
- **PostgreSQL** – Relational database
- **TypeScript** – Type safety
- **Nodemailer** – Email notifications
- **Jest + Supertest** – Testing

---

## 📁 Folder Structure

```
prisma/
src/
├── controllers/  Route logic
├── services/  Business logic
├── routes/  Express routes
├── common/  Helpers (e.g., mailer)
└── app.ts  Express app setup
```

---

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mabubakr1113/book-store  
cd book-store
```

### 2. Install dependencies
```bash
npm install
```
### 3. Configure environment variables

Create a .env file in the root and add:

DATABASE_URL="postgresql://postgres:postgree@localhost:5432/book-store"  
PORT=3000  
EMAIL_SERVICE_SMTP=smtp.sendgrid.net  
EMAIL_SERVICE_PORT=465  
EMAIL_SERVICE_USER=user  
EMAIL_SERVICE_PASSWORD=password  
EMAIL_SERVICE_SENDER_EMAIL=emailid  

### 4. Setup the database
```bash
npx prisma migrate dev --name init
npm run seed
```

### 5. Run the server
```bash
npm run dev
```
### 6. Running Tests  
Run unit/integration tests with:  
```bash
npm run test
``` 
Test suites cover:

Book borrowing/returning

Stock management

Wallet tracking

Admin transaction summaries

📬 Email Notifications
Users receive reminders if they don't return books within 3 days.

Admin is notified when:

A book’s stock is low

Wallet balance exceeds $2000

### 🐳 Running with Docker

You can run this project using Docker for an easier setup and deployment process.

1. Build the Docker image
```bash
docker build -t book-store . 
docker-compose up
```
This will run the app and database inside Docker containers.

## 📌 API Endpoints Overview

### 🔍 Book Management

- **GET /admin/book**
  ▸ Fetch all books. Use ?search=query to filter by title, author, or genre.

- **GET /admin/book/:id**
  ▸ Fetch details of a specific book by its ID.

- **GET /admin/book/logs**
  ▸ Retrieve book action logs filtered by type and/or bookId.

- **GET /admin/book/users**
  ▸ View a summary of books borrowed or purchased by each user.

### 👥 User Transactions

- **POST /transactions/borrow/:bookId**
  ▸ Borrow a book by its ID.

- **POST /transactions/return/:bookId**
  ▸ Return a previously borrowed book.

- **POST /transactions/purchase/:bookId**
  ▸ Purchase a book by its ID.

💰 Wallet & Transactions

- **GET /admin/wallet**
  ▸ View the current balance of the system wallet.

- **GET /admin/wallet/transactios**
  ▸ Get the wallet transaction history.

🧑‍💻 Author
Mohammad Abubakr
GitHub: @mabubakr1113
