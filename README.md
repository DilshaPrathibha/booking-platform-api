# Booking Platform API

A RESTful API for managing services and customer bookings, built with NestJS, TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger / OpenAPI
- **Containerization:** Docker & Docker Compose

## Project Structure

```
src/
├── auth/           # JWT authentication (register, login)
├── services/       # Service management (CRUD)
├── bookings/       # Booking management
├── prisma/         # Prisma service (database connection)
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
git clone <your-repo-url>
cd booking-platform-api

# Install dependencies
npm install
```

### Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/booking_db` |
| `JWT_SECRET` | Secret key for signing JWTs | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `PORT` | Port the API runs on | `3000` |

### Database Setup

```bash
# Start PostgreSQL via Docker
docker-compose up -d

# Run Prisma migrations
npx prisma migrate dev

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
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy
```

## API Documentation

Once the app is running, visit:

```
http://localhost:3000/api/docs
```

Swagger UI provides interactive documentation for all endpoints.

## API Overview

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
- Pagination and filtering on list endpoints
- Role-based access control (admin vs. staff)
- Rate limiting
- Unit and integration test coverage

## License

MIT
