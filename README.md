# 📊 Trading Journal Application

A full-stack trading journal application built with Node.js, Express, PostgreSQL, and vanilla JavaScript.

---

## 🚀 Features

### Authentication
- ✅ User Registration
- ✅ User Login
- ✅ JWT Token Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Logout

### Trade Management
- ✅ Add Trades (Long/Short)
- ✅ View Trade History
- ✅ Edit Trades
- ✅ Delete Trades
- ✅ Screenshot Uploads

### Dashboard & Analytics
- ✅ Total P&L
- ✅ Win Rate
- ✅ Average Risk/Reward
- ✅ Best Trade
- ✅ Current Streak
- ✅ Risk Management Score
- ✅ Psychology Score
- ✅ Performance Chart (Chart.js)
- ✅ Recent Trades List

### Data Management
- ✅ Export to CSV
- ✅ Backup Data (JSON)
- ✅ Restore Data from Backup

### User Experience
- ✅ Dark / Light Mode
- ✅ Show/Hide Password
- ✅ Responsive Design
- ✅ Mobile-Friendly Navigation

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Web Framework |
| PostgreSQL | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Winston | Logging |
| Helmet | Security Headers |
| CORS | Cross-Origin Resource Sharing |
| express-validator | Input Validation |
| express-rate-limit | Rate Limiting |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 | Structure |
| CSS3 | Styling |
| Vanilla JavaScript | Logic |
| Chart.js | Charts |
| CSS Variables | Dark/Light Mode |

---

## 📁 Project Structure
```
TradingJournal/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── .env
│   ├── test.js
│   ├── test-db.js
│   │
│   ├── logs/
│   │   ├── combined.log
│   │   └── error.log
│   │
│   └── src/
│       ├── app.js
│       │
│       ├── config/
│       │   ├── auth.js
│       │   ├── database.js
│       │   └── logger.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   └── tradeController.js
│       │
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   └── validation.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   └── Trade.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── tradeRoutes.js
│       │
│       └── utils/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── trades.html
│   ├── add-trade.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── database/
│   ├── schema.sql
│   └── er-diagram.png
│
└── docs/
    └── api-documentation.md
```

---

# ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Kaleb721/UPDATED-TRADINGJOURNAL-APP.git
```

### 2. Navigate to the backend

```bash
cd backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=trading_journal
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

### 5. Create the database

Run the SQL script located in:

```
database/schema.sql
```

using PostgreSQL.

### 6. Start the backend

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

### 7. Run the frontend

Open the `frontend` folder using **Live Server** in Visual Studio Code or any local web server.

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing with bcrypt
- Protected API Routes
- Express Validator
- Rate Limiting
- Helmet Security
- CORS Configuration
- Winston Logging
- Error Handling Middleware

---

## 🗄️ Database

This application uses **PostgreSQL** as its relational database.

### Database Files

```
database/
├── schema.sql
└── er-diagram.png
```

### Database Tables

- Users
- Trades

### Relationship

- One User can have many Trades.

The complete SQL DDL script is located in:

```
database/schema.sql
```

The Entity Relationship Diagram (ERD) is located in:

```
database/er-diagram.png
```

# 🌐 REST API

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| GET | /api/auth/profile | Get User Profile |

## Trades

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/trades | Get All Trades |
| GET | /api/trades/:id | Get Single Trade |
| POST | /api/trades | Create Trade |
| PUT | /api/trades/:id | Update Trade |
| DELETE | /api/trades/:id | Delete Trade |

---

# ⭐ Extra Features

- Dashboard Analytics
- Win Rate Calculation
- Risk / Reward Analysis
- Performance Charts (Chart.js)
- CSV Export
- JSON Backup & Restore
- Screenshot Uploads
- Dark / Light Mode
- Responsive Design

---

# 👨‍💻 Author

**Kaleb Mitiku**

Web Programming II Final Project

American College of Technology (ACT)

2026