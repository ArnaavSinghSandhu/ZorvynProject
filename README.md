# Finance Ledger Backend

A straightforward finance dashboard backend built with Node.js, Express, and PostgreSQL. I built this to practice role-based access control and aggregated data queries — the kind of stuff you actually need in real-world dashboards.

## What's This?

This API powers a finance tracking system where different users (viewer, analyst, admin) get different levels of access. It handles financial records, user management, and serves up aggregated dashboard data like monthly trends and category breakdowns.

**Key thing to know:** I removed user-scoped data filtering so all roles see the same dataset. This was a deliberate choice for this implementation — makes it simpler to demo without dealing with "where did my record go" confusion.

## Features

- JWT-based authentication with role middleware
- Three-tier access control (viewer/analyst/admin)
- CRUD operations for financial records
- Dashboard analytics (totals, trends, recent activity)
- Soft deletes (records get `deleted_at` timestamp, not actually removed)
- Input validation with sensible error messages
- User management (admin only)

## Tech Stack

- **Runtime:** Node.js (Express)
- **Database:** PostgreSQL
- **Auth:** JWT tokens
- **Validation:** express-validator
- **Password hashing:** bcrypt

## Before You Start

You'll need:
- Node.js 18+ installed
- PostgreSQL running locally (or connection to a remote instance)
- A `.env` file with your secrets (see below)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ZorvynAttempt
npm install
```

### 2. Create the database

Connect to PostgreSQL and create a database:

```sql
CREATE DATABASE finance_dashboard;
```

Then run this schema setup. I didn't use migrations for this project — just keeping it simple:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial records table
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- soft delete marker
);

-- Optional: index for faster queries on common filters
CREATE INDEX idx_records_deleted ON records(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_records_type ON records(type);
CREATE INDEX idx_records_date ON records(date);
```

### 3. Environment variables

Create a `.env` file in the project root:

```env
JWT_SECRET=your-super-secret-key-at-least-32-chars-long
JWT_EXPIRES_IN=7d
```

> **Note:** The app will throw an error on startup if `JWT_SECRET` isn't set. Don't use something short or guessable — JWT tokens are only as secure as this secret.

### 4. Database connection

Update `db.js` with your PostgreSQL credentials:

```javascript
const pool = new Pool({
    user: "postgres",      // your postgres username
    host: "localhost",
    database: 'finance_dashboard',
    password: 'your_password',  // add this if you have a password set
    port: 5432,
})
```

If you're using the default `postgres` user with no password on localhost, what's there should work.

### 5. Start the server

```bash
npm start
```

You should see: `Server running on PORT 3000`

## API Overview

Base URL: `http://localhost:3000/api`

### Authentication

All endpoints except login/register require an `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

#### POST /auth/register
Create a new user account.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "viewer"
}
```

Roles: `viewer`, `analyst`, `admin` (defaults to viewer if not specified)

#### POST /auth/login
Get a JWT token.

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    }
  }
}
```

### Dashboard (All authenticated users)

#### GET /dashboard/summary
Returns income/expense totals and net balance.

```json
{
  "success": true,
  "data": {
    "total_income": "15000.00",
    "total_expenses": "8500.00",
    "net_balance": "6500.00"
  }
}
```

#### GET /dashboard/categories
Category breakdown with totals and counts.

#### GET /dashboard/trends
Monthly aggregated data.

#### GET /dashboard/recent-activity?limit=10
Recent records (default limit: 10, max: 50).

### Records (Analyst and Admin only)

#### GET /records
List records with optional filters.

Query params:
- `type` — `income` or `expense`
- `category` — filter by category name
- `startDate` / `endDate` — ISO 8601 dates (YYYY-MM-DD)
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 50)

Example: `GET /records?type=income&category=Salary&page=1`

#### POST /records (Admin only)
Create a new financial record.

```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-04-01",
  "notes": "Monthly salary payment"
}
```

> Note: `type` must be lowercase `income` or `expense`. The validator rejects capitalized versions.

#### PUT /records/:id (Admin only)
Update a record. All fields optional — only provided fields get updated.

```json
{
  "amount": 5500.00,
  "notes": "Updated amount"
}
```

#### DELETE /records/:id (Admin only)
Soft delete — sets `deleted_at` timestamp. Record stays in DB but won't show up in queries.

### Users (Admin only)

#### GET /users
List all users.

#### GET /users/:id
Get specific user details.

#### PUT /users/:id/role
Change user role.

```json
{
  "role": "analyst"
}
```

#### PATCH /users/:id/status
Toggle user active/inactive status. Inactive users can't log in.

#### DELETE /users/:id
Permanently delete a user.

## Role Permissions

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View dashboard summaries | ✅ | ✅ | ✅ |
| View records list | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

**Important:** Viewers get a 403 Forbidden if they try to access `/records` endpoints. The frontend should hide the Records navigation for viewers (which is already implemented in the included frontend).

## Project Structure

```
.
├── controllers/        # Business logic
│   ├── auth.js        # Login/register
│   ├── dashboard.js   # Analytics queries
│   ├── records.js     # CRUD operations
│   └── users.js       # User management
├── middleware/        # Express middleware
│   ├── errorHandler.js
│   ├── jwtverifyication.js  # JWT auth
│   ├── requirerole.js       # Role checking
│   └── validate.js          # Validation runner
├── routes/           # Route definitions
│   ├── dashboard.js
│   ├── record.js
│   └── user.js
├── validators/       # Input validation rules
│   ├── recordvalidations.js
│   └── usersvalidation.js
├── utils/            # Helpers
│   └── response.js   # Standard response format
├── db.js             # PostgreSQL connection
├── config.js         # JWT config
├── server.js         # App entry point
└── frontend/         # Static HTML/JS frontend
    └── index.html
```

## Common Issues

**"JWT_SECRET is not set" error**
You forgot to create the `.env` file or didn't add `JWT_SECRET`. The app checks for this on startup and refuses to run without it.

**"User not found" after successful login**
Check that your JWT secret hasn't changed between issuing the token and verifying it. Also verify the user wasn't deleted or deactivated.

**CORS errors from frontend**
The backend has `app.use(cors())` which allows all origins. If you're getting CORS errors, check that your frontend is actually hitting `http://localhost:3000/api` and not a different port.

**Passwords not working**
Make sure you're sending the plaintext password in the request — bcrypt handles the hashing. If login fails with "Invalid credentials", double-check the email and that the account is active.

## What's Not Here (But Could Be)

- Tests (Jest, Mocha, whatever you prefer)
- Database migrations (Knex, Sequelize, or raw SQL files)
- Rate limiting (express-rate-limit is an easy add)
- Request logging (morgan)
- API documentation (Swagger/OpenAPI)
- Docker setup
- Email notifications

This was built as a focused assignment demo, so I kept the scope tight. The foundation is solid for extending though.

## License

MIT — do whatever you want with it.

---

Built with too much coffee and just enough error handling. If something breaks, the error messages should actually tell you what went wrong now.
