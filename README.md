# BoB – Blockchain-based Interbank Settlement System

BoB (Bank on Blockchain) is a consortium-based interbank settlement platform that leverages Ethereum blockchain technology to provide secure, transparent, and real-time settlement processing between participating banks.

The system combines blockchain immutability with modern web technologies to deliver transaction monitoring, role-based administration, and audit capabilities for financial institutions.

---

# Features

## Authentication & Security

* JWT-based authentication
* Password hashing using bcrypt
* First-login password reset workflow
* Protected API routes
* Session management

## Role-Based Access Control (RBAC)

Supported roles:

* **BANK_ADMIN**

  * Access dashboard
  * View audit logs
  * Manage users

* **BANK_AUDITOR**

  * Access dashboard
  * View audit logs

* **BANK_OPERATOR**

  * Access dashboard only

## Blockchain Integration

* Ethereum smart contract for transaction recording
* On-chain transaction storage
* Real-time blockchain event listening
* Transaction history retrieval

## Real-Time Dashboard

* Live transaction updates using Socket.IO
* Settlement metrics
* Transaction monitoring
* Consortium node status

## Audit Logging

* Security event tracking
* Login monitoring
* Password changes
* User creation events
* Unauthorized access attempts
* System activity records

## User Management

* Employee onboarding
* Temporary password generation
* Role assignment
* User administration

---

# Tech Stack

## Frontend

* React
* Axios
* Socket.IO Client
* CSS

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT
* Bcrypt
* Prisma ORM
* Ethers.js

## Database

* PostgreSQL

## Blockchain

* Ethereum
* Solidity
* Hardhat

---

# Implemented Modules

## Authentication Module

* Login
* JWT generation
* Protected routes
* Logout

## Password Reset Module

* Temporary passwords
* First login password update

## Dashboard Module

* Transaction history
* Real-time updates
* Settlement metrics

## Audit Module

* Audit log generation
* Audit log viewer
* Role-based access

## User Management Module

* Employee creation
* Role assignment
* User administration

---

# API Endpoints

## Authentication

### Login

```http
POST /api/v1/auth/login
```

### Change Password

```http
POST /api/v1/auth/change-password
```

---

## Transactions

### Transaction History

```http
GET /api/v1/history
```

---

## Audit Logs

### Fetch Audit Logs

```http
GET /api/v1/audit-logs
```

---

## User Management

### Create User

```http
POST /api/v1/admin/create-user
```

---

# Database Models

## Auditor

```text
id
email
password
role
bank
mustChangePassword
createdAt
```

## AuditLog

```text
id
email
role
action
status
ipAddress
createdAt
```

---

# Roles

| Role          | Dashboard | Audit Logs | User Management |
| ------------- | --------- | ---------- | --------------- |
| BANK_ADMIN    | ✅         | ✅          | ✅               |
| BANK_AUDITOR  | ✅         | ✅          | ❌               |
| BANK_OPERATOR | ✅         | ❌          | ❌               |

---

# Running the Project

## Clone Repository

```bash
git clone https://github.com/<your-username>/BoB.git
cd BoB
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5001
DATABASE_URL=
JWT_Secret=
URL=
CONTRACT_ADDRESS=
```

Run Prisma migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start server:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Smart Contract Setup

```bash
cd contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js
```

---

# Security Features

* JWT Authentication
* Password hashing
* Role-based authorization
* Protected routes
* Audit trails
* Blockchain immutability
* Real-time monitoring

---

# Learning Objectives

This project demonstrates:

* Blockchain integration with traditional applications
* Real-time systems using WebSockets
* Authentication and authorization
* Database management with Prisma
* Secure application development
* Financial system architecture
* Distributed ledger concepts

---

#
