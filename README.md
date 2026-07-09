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
# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Kaleb721/UPDATED-TRADINGJOURNAL-APP.git
```

## 2. Navigate to the Backend

```bash
cd TradingJournal/backend
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Configure Environment Variables

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

## 5. Create the Database

Run the SQL script inside:

```
database/schema.sql
```

using PostgreSQL.

## 6. Start the Backend

Development

```bash
npm run dev
```

Production

```bash
npm start
```

## 7. Open the Frontend

Open

```
frontend/index.html
```

using Live Server or any local web server.

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected API Routes
- Input Validation
- Rate Limiting
- Helmet Security Headers
- CORS Protection
- Secure Password Storage
- Error Handling Middleware
- Request Logging using Winston

---

# 🗄️ Database

The project uses **PostgreSQL**.

Database schema:

```
database/schema.sql
```

Main tables:

- Users
- Trades

Relationships:

- One User → Many Trades

---

# 🌐 REST API

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |
| GET | /api/auth/profile | User Profile |

## Trades

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/trades | Get All Trades |
| GET | /api/trades/:id | Get Trade |
| POST | /api/trades | Add Trade |
| PUT | /api/trades/:id | Update Trade |
| DELETE | /api/trades/:id | Delete Trade |

---

# 📊 Extra Features Beyond the Course

This project includes several features beyond the course requirements:

- Dashboard Analytics
- CSV Export
- JSON Backup & Restore
- Performance Charts
- Screenshot Upload Support
- Risk Management Metrics
- Psychology Score Tracking
- Dark / Light Theme
- Mobile Responsive Design

---

# 📸 Screenshots

Add screenshots of:

- Login Page
- Register Page
- Dashboard
- Add Trade
- Trade History
- Analytics

---

# 👨‍💻 Author

**Kaleb Mitiku**

Web Programming II Final Project

American College of Technology (ACT)

2026

---

# 📄 License

This project was developed for educational purposes as the final project for the Web Programming II course.