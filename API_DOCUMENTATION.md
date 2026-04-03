# Finance Ledger API Documentation

A comprehensive API documentation for the Finance Data Processing and Access Control Backend built with Node.js, Express, and PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Dashboard](#dashboard-endpoints)
  - [Financial Records](#financial-records-endpoints)
  - [User Management](#user-management-endpoints)
- [Role Permissions](#role-permissions)
- [Error Handling](#error-handling)
- [Testing Guide](#testing-guide)

---

## Overview

This API powers a finance dashboard system with role-based access control. It supports three user roles (viewer, analyst, admin) with different permission levels for accessing financial data and performing operations.

### Key Features
- JWT-based authentication
- Role-based access control (RBAC)
- Financial records CRUD with soft deletes
- Dashboard analytics and summaries
- Input validation and error handling
- PostgreSQL data persistence

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication

All endpoints (except `/auth/register` and `/auth/login`) require authentication via a Bearer token in the Authorization header.

### Header Format
```
Authorization: Bearer <jwt_token>
```

### Getting a Token
1. Register a user via `POST /auth/register`
2. Login via `POST /auth/login`
3. Copy the `token` from the response
4. Include it in subsequent requests

---

## Endpoints

### Authentication Endpoints

#### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "viewer"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name (2-100 characters) |
| email | string | Yes | Valid email address |
| password | string | Yes | Minimum 8 characters |
| role | string | No | Options: `viewer`, `analyst`, `admin` (default: `viewer`) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "status": "active"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

#### Login
Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Account Deactivated (403 Forbidden):**
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

---

### Dashboard Endpoints

*Accessible by: `viewer`, `analyst`, `admin`*

All dashboard endpoints require authentication and are accessible by all authenticated users regardless of role.

---

#### Get Summary
Returns total income, total expenses, and net balance.

**Endpoint:** `GET /dashboard/summary`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Summary fetched",
  "data": {
    "total_income": "15000.00",
    "total_expenses": "8500.00",
    "net_balance": "6500.00"
  }
}
```

---

#### Get Category Breakdown
Returns category-wise totals and counts.

**Endpoint:** `GET /dashboard/categories`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Category totals fetched",
  "data": [
    {
      "category": "Salary",
      "type": "income",
      "total": "15000.00",
      "count": "3"
    },
    {
      "category": "Rent",
      "type": "expense",
      "total": "5000.00",
      "count": "2"
    }
  ]
}
```

---

#### Get Monthly Trends
Returns monthly aggregated data.

**Endpoint:** `GET /dashboard/trends`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Trends fetched",
  "data": [
    {
      "month": "2024-01",
      "income": "5000.00",
      "expenses": "2000.00",
      "net": "3000.00"
    },
    {
      "month": "2024-02",
      "income": "5000.00",
      "expenses": "3000.00",
      "net": "2000.00"
    }
  ]
}
```

---

#### Get Recent Activity
Returns recent financial records.

**Endpoint:** `GET /dashboard/recent-activity`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of records (default: 10, max: 50) |

**Example:** `GET /dashboard/recent-activity?limit=10`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Recent activity fetched",
  "data": [
    {
      "id": 1,
      "amount": "5000.00",
      "type": "income",
      "category": "Salary",
      "date": "2024-04-01",
      "notes": "Monthly salary"
    }
  ]
}
```

---

### Financial Records Endpoints

*Record access is role-restricted. See [Role Permissions](#role-permissions) for details.*

---

#### List Records
Get all financial records with optional filtering and pagination.

**Endpoint:** `GET /records`

**Access:** `analyst`, `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | No | Filter by `income` or `expense` |
| category | string | No | Filter by category name |
| startDate | date | No | Start date (YYYY-MM-DD) |
| endDate | date | No | End date (YYYY-MM-DD) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 50) |

**Example:** `GET /records?type=income&category=Salary&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Records fetched",
  "data": [
    {
      "id": 1,
      "amount": "5000.00",
      "type": "income",
      "category": "Salary",
      "date": "2024-04-01",
      "notes": "Monthly salary payment",
      "created_by": 1,
      "created_at": "2024-04-01T10:00:00.000Z",
      "updated_at": "2024-04-01T10:00:00.000Z",
      "deleted_at": null
    }
  ]
}
```

**Forbidden Response (403):**
```json
{
  "error": "Forbidden"
}
```
*Returned when a `viewer` tries to access this endpoint*

---

#### Create Record
Create a new financial record.

**Endpoint:** `POST /records`

**Access:** `admin` only

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "type": "income",
  "category": "Salary",
  "date": "2024-04-01",
  "notes": "Monthly salary payment"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| amount | number | Yes | Positive number greater than 0 |
| type | string | Yes | `income` or `expense` (must be lowercase) |
| category | string | Yes | 1-100 characters |
| date | string | Yes | Date in YYYY-MM-DD format |
| notes | string | No | Max 255 characters |

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Record created",
  "data": {
    "id": 1,
    "amount": "5000.00",
    "type": "income",
    "category": "Salary",
    "date": "2024-04-01",
    "notes": "Monthly salary payment",
    "created_by": 1,
    "created_at": "2024-04-01T10:00:00.000Z",
    "updated_at": "2024-04-01T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "type",
      "message": "Type must be lowercase: income or expense"
    }
  ]
}
```

---

#### Update Record
Update an existing financial record. All fields are optional.

**Endpoint:** `PUT /records/:id`

**Access:** `admin` only

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Record ID |

**Request Body:**
```json
{
  "amount": 5500.00,
  "notes": "Updated amount with bonus"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Record updated",
  "data": {
    "id": 1,
    "amount": "5500.00",
    "type": "income",
    "category": "Salary",
    "date": "2024-04-01",
    "notes": "Updated amount with bonus",
    "created_by": 1,
    "created_at": "2024-04-01T10:00:00.000Z",
    "updated_at": "2024-04-03T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Record Not Found"
}
```

---

#### Delete Record
Soft delete a financial record (sets `deleted_at` timestamp).

**Endpoint:** `DELETE /records/:id`

**Access:** `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | Record ID |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Record deleted",
  "data": {
    "id": 1
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Record not found"
}
```

---

### User Management Endpoints

*All user management endpoints are `admin` only*

---

#### List All Users
Get all users in the system.

**Endpoint:** `GET /users`

**Access:** `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active",
      "created_at": "2024-04-01T10:00:00.000Z"
    }
  ]
}
```

---

#### Get User by ID
Get details of a specific user.

**Endpoint:** `GET /users/:id`

**Access:** `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "status": "active"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "User Not Found"
}
```

---

#### Update User Role
Change a user's role.

**Endpoint:** `PUT /users/:id/role`

**Access:** `admin` only

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Request Body:**
```json
{
  "role": "analyst"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | string | Yes | `viewer`, `analyst`, or `admin` |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst"
  }
}
```

---

#### Toggle User Status
Toggle a user between `active` and `inactive` status.

**Endpoint:** `PATCH /users/:id/status`

**Access:** `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "status": "inactive"
  }
}
```

*Note: Inactive users cannot log in and will receive a 403 error.*

---

#### Delete User
Permanently delete a user.

**Endpoint:** `DELETE /users/:id`

**Access:** `admin` only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | integer | User ID |

**Success Response (200 OK):**
```json
{
  "message": "User Deleted"
}
```

**Self-Deletion Error (400):**
```json
{
  "error": "Can't Delete Your Own Account"
}
```

**Not Found (404):**
```json
{
  "error": "Not Found"
}
```

---

## Role Permissions

### Permission Matrix

| Feature | Viewer | Analyst | Admin |
|---------|--------|---------|-------|
| View dashboard summaries | ✅ | ✅ | ✅ |
| View records list | ❌ | ✅ | ✅ |
| Create records | ❌ | ❌ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

### Role Descriptions

**Viewer**
- Can view dashboard data only
- Cannot access financial records directly
- Cannot create, update, or delete any data

**Analyst**
- Can view dashboard data
- Can view financial records with filtering
- Cannot modify records or manage users

**Admin**
- Full access to all endpoints
- Can create, update, and delete records
- Can manage users (create roles, toggle status, delete)

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid input |
| 401 | Unauthorized | Missing, malformed, or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors include additional details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Common Error Messages

**Authentication Errors:**
- `Mising Or Malformed Authorization Header` - 401
- `Invalid or expired Token` - 401
- `User not found` - 401
- `Account is deactivated` - 403

**Authorization Errors:**
- `Forbidden` - 403 (insufficient role permissions)

**Resource Errors:**
- `User Not Found` - 404
- `Record Not Found` - 404
- `Email already in use` - 409

**Business Logic Errors:**
- `Can't Delete Your Own Account` - 400

---

## Testing Guide

### Quick Test with curl

#### 1. Register an Admin
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "password123",
    "role": "admin"
  }'
```

#### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```

Save the token from the response for the next steps.

#### 3. Create a Record
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "date": "2024-04-01",
    "notes": "Monthly salary"
  }'
```

#### 4. Check Dashboard Summary
```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. List Records with Filter
```bash
curl -X GET "http://localhost:3000/api/records?type=income&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. Update a Record
```bash
curl -X PUT http://localhost:3000/api/records/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 5500,
    "notes": "Updated with bonus"
  }'
```

#### 7. Soft Delete a Record
```bash
curl -X DELETE http://localhost:3000/api/records/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Testing Role-Based Access

#### Register a Viewer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Viewer",
    "email": "viewer@test.com",
    "password": "password123",
    "role": "viewer"
  }'
```

#### Login as Viewer
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "viewer@test.com",
    "password": "password123"
  }'
```

#### Try Accessing Records (Should Fail with 403)
```bash
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer VIEWER_TOKEN_HERE"
```

Expected response:
```json
{
  "error": "Forbidden"
}
```

---

## Postman Collection

A complete Postman collection is available in the file `Finance_Ledger_API_Postman_Collection.json`.

### How to Import
1. Open Postman
2. Click **Import** (top left)
3. Select `Finance_Ledger_API_Postman_Collection.json`
4. The collection will be imported with all endpoints and pre-configured tests

### Collection Features
- Automatic token saving after login
- Pre-configured test flows
- Environment variables for `base_url`, `auth_token`, `admin_token`, `viewer_token`
- Test scripts that validate responses

---

## Notes

1. **Soft Deletes**: Records are never permanently deleted. The `deleted_at` timestamp is set, and records with this field are excluded from queries.

2. **Case Sensitivity**: The `type` field must be lowercase (`income` or `expense`). Capitalized versions will be rejected.

3. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DD).

4. **Shared Dataset**: All users see the same financial records. User-scoped filtering was intentionally omitted for simplicity.

5. **Database Indexes**: The database has indexes on `deleted_at`, `type`, and `date` for performance.

---

*Documentation Version: 1.0*
*Last Updated: April 2026*
