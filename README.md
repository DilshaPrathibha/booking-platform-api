# Booking Platform API

A RESTful API for managing services and customer bookings, built with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger / OpenAPI
- **Containerization:** Docker & Docker Compose

## Features

- **JWT Authentication** — register and login with bcrypt-hashed passwords
- **Service Management** — full CRUD with JWT protection on write operations
- **Booking Management** — create (public), view, update status, and cancel bookings
- **Business Rule Enforcement** — past dates, inactive services, duplicate slots, forbidden status transitions
- **Pagination** — `?page` and `?limit` query params on all list endpoints
- **Search & Filter** — search bookings by customer name/email; filter by status
- **Swagger / OpenAPI** — interactive API documentation with JWT auth support
- **Global Exception Handling** — consistent JSON error responses for all error types
- **Docker Support** — PostgreSQL via Docker Compose with health check
- **Input Validation** — strict DTO validation on all request bodies and query params

## Architecture

```
Client Request
     ↓
 Controller        (HTTP layer — routing, guards, DTOs)
     ↓
  Service          (Business logic — rules, validation)
     ↓
PrismaService      (Data access layer)
     ↓
 PostgreSQL        (Database)
```

## Project Structure

```
src/
├── auth/           # JWT authentication (register, login)
├── bookings/       # Booking management
├── common/         # Shared filters and DTOs (pagination, exception filter)
├── prisma/         # Prisma service (database connection)
├── services/       # Service management (CRUD)
└── main.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/DilshaPrathibha/booking-platform-api.git
cd booking-platform-api

# Install dependencies
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password — use a strong value | Yes |
| `POSTGRES_DB` | PostgreSQL database name | Yes |
| `DATABASE_URL` | Full Prisma connection string (built from the values above) | Yes |
| `JWT_SECRET` | Secret key for signing JWTs — minimum 64 characters | Yes |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`, `1h`) | Yes |
| `PORT` | Port the API listens on | No (default: `3000`) |

### Database Setup

```bash
# Start PostgreSQL via Docker
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev --config prisma.config.ts

# Generate the Prisma client
npx prisma generate --config prisma.config.ts

# (Optional) Seed the database
npx prisma db seed
```

### Running the Application

```bash
# Development (with hot reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --config prisma.config.ts --name <migration-name>

# Apply migrations in production
npm run migrate:deploy
```

## API Documentation

| | URL |
|---|---|
| **Base URL** | `http://localhost:3000/api` |
| **Swagger UI** | `http://localhost:3000/api/docs` |

> **Note:** All endpoints are prefixed with `/api`. For example, `POST /api/auth/login`.

Swagger UI provides interactive documentation for all endpoints. Use the **Authorize** button to enter a JWT token and test protected routes directly from the browser.

## API Overview

> All endpoints below are relative to the base URL `http://localhost:3000/api`.

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |

### Services

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/services` | Public | Get all services |
| GET | `/services/:id` | Public | Get service by ID |
| POST | `/services` | JWT Required | Create a service |
| PATCH | `/services/:id` | JWT Required | Update a service |
| DELETE | `/services/:id` | JWT Required | Delete a service |

### Bookings

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | Public | Create a booking |
| GET | `/bookings` | JWT Required | Get all bookings |
| GET | `/bookings/:id` | JWT Required | Get booking by ID |
| PATCH | `/bookings/:id/status` | JWT Required | Update booking status |
| DELETE | `/bookings/:id` | JWT Required | Cancel a booking |

## Business Rules

- A booking must reference an existing, active service
- Booking dates cannot be in the past
- Cancelled bookings cannot be marked as completed
- Only authenticated users can manage services
- Customers can create bookings without authentication

## Assumptions Made

- A "user" in this system is an admin/staff member who manages services
- Customers are identified by their name, email, and phone — no account required
- `bookingTime` is stored as a string (e.g. `"14:30"`) for simplicity
- Services marked as `isActive: false` cannot be booked

## Future Improvements

- Refresh token support
- Email notifications on booking confirmation
- Role-based access control (admin vs. staff)
- Rate limiting on public endpoints
- Soft-delete for services (preserve audit trail)
- Unit and integration test coverage

## License

MIT
