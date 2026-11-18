# SaySo Backend API

<p align="center">
  <strong>A campus issue-reporting and resolution platform.</strong><br/>
  Students raise issues, staff resolve them, and administrators monitor campus operations.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white" alt="Node.js 22+"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express"/></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL"/></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-TypeScript-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM"/></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker"/></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white" alt="Vitest"/></a>
</p>

---

## ✨ Overview

SaySo is a campus problem-reporting platform backed by a REST API built with Node.js, Express and TypeScript. It provides endpoints for authentication, complaint management, student and staff profiles, departments, reporting, and an AI-assisted chat experience.

The backend uses MySQL for persistent relational data, Drizzle ORM for type-safe database access, and Redis for caching and short-lived authentication handoff data. A separate Python FastAPI RAG service powers the chat assistant.

> Some legacy database names, package metadata and internal documentation still use the name **CampusFix**.

## 🚀 Features

- **Authentication:** Email/password login, Google sign-in, JWT-protected API routes, role checks, and a landing-page session handoff.
- **Complaint lifecycle:** Create, view, update, assign, comment on, tag, and track complaints.
- **Profiles and administration:** Student profile management, admin/staff listing and profile endpoints, and department/category management.
- **Reports and analytics:** System statistics, department workload, and operational analytics.
- **AI chat:** Authenticated chat requests proxied to a separate FastAPI RAG service, with chat history stored in MySQL.
- **Caching:** Redis-backed complaint-list caching and temporary handoff/session data.
- **API documentation:** Swagger UI and a generated OpenAPI JSON document.
- **Operations:** Health, liveness and readiness endpoints; Docker Compose for local services; automated build/test/deployment workflow.

## 🧰 Tech stack

| Area | Technology |
|---|---|
| Runtime | Node.js 22 |
| Language | TypeScript 5.9 |
| HTTP framework | Express 5 |
| Database | MySQL 8 |
| ORM and migrations | Drizzle ORM, Drizzle Kit |
| Cache and short-lived data | Redis 7, ioredis |
| Validation | Zod |
| Authentication | JSON Web Tokens, bcryptjs, Google ID-token verification |
| Landing-page session | HTTP-only cookie, Redis-backed session |
| Logging | Pino, pino-http |
| API documentation | Swagger UI, swagger-jsdoc, OpenAPI 3 |
| Testing | Vitest, Supertest |
| Infrastructure | Docker, Docker Compose |
| AI integration | Python FastAPI RAG service |

## 🏗️ Architecture

~~~text
Student / Staff / Admin clients
            |
            | HTTP + JSON
            v
      Express API (8000)
            |
   +--------+---------+----------------+
   |        |         |                |
 Routes  Middleware  Controllers    Swagger
   |     Auth / RBAC     |
   +---------------------+
             |
          Services
             |
      +------+-------+
      |              |
   MySQL 8         Redis 7
  (Drizzle)    (cache/session)
             |
       Chat service
             |
       FastAPI RAG API
~~~

### Request flow

A typical API request follows this path:

**Client → Express route → Middleware → Controller → Service → MySQL/Redis → Response**

Routes map HTTP methods and paths to handlers. Middleware performs cross-cutting checks such as authentication. Controllers handle HTTP input/output, while services contain application logic.

## 📁 Project structure

~~~text
src/
├── app.ts                  # Express app, middleware, health and docs routes
├── index.ts                # Server startup and graceful shutdown
├── config/                 # Environment, database, Redis, logger, Swagger
├── controllers/            # HTTP request handlers
├── db/                     # Drizzle client, schemas and migration helpers
├── dto/                    # Data transfer object definitions
├── middlewares/            # Authentication, authorization and error handling
├── routes/                 # Feature-based API route modules
├── services/               # Business logic and integrations
├── types/                  # Shared TypeScript types
├── utils/                  # Reusable helpers
└── validators/             # Zod request schemas

drizzle/                    # Generated SQL migrations
scripts/                    # Manual database scripts
test/                       # Automated tests
Dockerfile
docker-compose.yml
drizzle.config.ts
~~~

## ⚡ Getting started

### Prerequisites

- Node.js 22 or later and npm
- Docker Desktop with Docker Compose (recommended for local MySQL and Redis)
- Git

### 1. Clone the repository

~~~bash
git clone https://github.com/SayySoo/sayso-server.git
cd sayso-server
~~~

### 2. Configure environment variables

Create a local **.env** file in the repository root. Do not commit real secrets.

| Variable | Purpose | Default / requirement |
|---|---|---|
| NODE_ENV | Runtime environment | development |
| PORT | API port | 8000 |
| DB_HOST | MySQL hostname | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | Configure locally |
| DB_NAME | Database name | campusfix |
| REDIS_HOST | Redis hostname | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_SECRET | JWT signing secret | Required, at least 10 characters |
| JWT_EXPIRES_IN | JWT lifetime | 7d |
| GOOGLE_CLIENT_ID | Google sign-in audience/client ID | Optional unless Google login is used |
| LANDING_URL | Landing application URL | Required URL |
| LANDING_SESSION_SECRET | Landing-session signing secret | Required, at least 32 characters |
| LANDING_SESSION_TTL | Landing-session lifetime in seconds | 86400 |
| STUDENT_URL | Allowed student frontend origin for CORS | Optional URL |
| RAG_API_URL | Base URL of the FastAPI RAG service | Optional URL; required for chat |

The environment configuration is validated at startup. Use strong, unique secrets and keep production values in your deployment environment rather than in Git.

### 3. Start MySQL and Redis

The repository includes a Docker Compose setup:

~~~bash
docker compose up -d mysql redis
~~~

The Compose file configures MySQL 8 and Redis 7. Make sure the database credentials in **.env** match the credentials configured for your local database service.

### 4. Install dependencies and run migrations

~~~bash
npm install
npm run db:migrate
~~~

If you have intentionally changed a Drizzle schema, generate a migration before applying it:

~~~bash
npm run db:generate
npm run db:migrate
~~~

### 5. Start the API

~~~bash
npm run dev
~~~

The API listens on **http://localhost:8000** by default.

### Run the full local stack

If your **.env** is configured for the Compose service names (**mysql** and **redis**), you can start the API and dependencies together:

~~~bash
docker compose up --build
~~~

## 🌐 API reference

**Base URL:** http://localhost:8000  
**API prefix:** /api/v1

All request and response bodies use JSON unless otherwise noted. Protected API routes use:

~~~http
Authorization: Bearer <JWT>
~~~

### Health and operational endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Checks API, MySQL and Redis; returns 503 if a dependency is unavailable |
| GET | /live | Liveness check for the API process |
| GET | /ready | Readiness check including MySQL and Redis |
| GET | /api-docs | Swagger UI |
| GET | /api-docs.json | Raw OpenAPI JSON |

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | Public | Register an account |
| POST | /api/v1/auth/login | Public | Log in and receive an API token |
| POST | /api/v1/auth/google | Public | Sign in using a Google ID token |
| POST | /api/v1/auth/handoff | JWT required | Generate a one-time landing-page handoff code |
| POST | /api/v1/auth/handoff/exchange | Handoff code | Redeem the code and establish the landing session |
| GET | /api/v1/public/me | Landing session cookie | Get the current landing-session user's profile |
| POST | /api/v1/public/logout | Landing session cookie | End the landing-page session |

The main API uses JWT bearer authentication. The landing-page handoff exchanges a short-lived, one-time code for a separate HTTP-only session cookie.

### Complaints

| Method | Endpoint | Access in current router | Description |
|---|---|---|---|
| GET | /api/v1/complaints | No route-level auth middleware | List complaints with pagination and filters |
| POST | /api/v1/complaints | JWT required | Create a complaint |
| GET | /api/v1/complaints/me | Student JWT | List the authenticated student's complaints |
| GET | /api/v1/complaints/:id | No route-level auth middleware | Get complaint details, comments, history and tags |
| PATCH | /api/v1/complaints/:id | Student or admin JWT | Update a complaint |
| PATCH | /api/v1/complaints/:id/status | Staff or admin JWT | Update status, subject to transition rules |
| DELETE | /api/v1/complaints/:id | Student or admin JWT | Delete a complaint, subject to service-level rules |
| POST | /api/v1/complaints/:id/comments | JWT required | Add a complaint comment |
| POST | /api/v1/complaints/:id/tags | Staff or admin JWT | Attach a tag |
| DELETE | /api/v1/complaints/:id/tags/:tagSlug | Staff or admin JWT | Detach a tag |
| POST | /api/v1/complaints/:id/assign | Admin JWT | Assign a complaint to staff |

Complaint list query parameters include:

| Parameter | Type | Description |
|---|---|---|
| page | Integer | Page number (default: 1) |
| limit | Integer | Page size (default: 20; maximum: 100) |
| status | String | Filter by complaint status |
| priority | String | Filter by priority |
| categoryId | Integer | Filter by category |
| departmentId | Integer | Filter by department |
| studentId | Integer | Filter by student |
| search | String | Search complaint content |

**Statuses:** open, assigned, in_progress, resolved, rejected, closed  
**Priorities:** low, medium, high, urgent

Example:

~~~bash
curl "http://localhost:8000/api/v1/complaints?page=1&limit=20&status=open&priority=high"
~~~

Create a complaint (example body; adapt IDs and values to your database):

~~~bash
curl -X POST "http://localhost:8000/api/v1/complaints" -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"title":"Wi-Fi not working in Lab 204","description":"There is no internet connection in the lab.","studentId":1,"categorySlug":"wi-fi-issue","location":"Lab 204","building":"Academic Block A","priority":"medium"}'
~~~

### Students, staff and departments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/student/me | Student JWT | Get the authenticated student's profile |
| PATCH | /api/v1/student/update-me | Student JWT | Update the authenticated student's profile |
| GET | /api/v1/staff/me | Admin JWT | Get the authenticated admin's profile |
| PATCH | /api/v1/staff/me | Admin JWT | Update the authenticated admin's profile |
| GET | /api/v1/staff | Admin JWT | List staff |
| GET | /api/v1/staff/admins | Admin JWT | List active admin accounts |
| GET | /api/v1/departments | No route-level auth middleware | List departments |
| POST | /api/v1/departments | Admin JWT | Create a department |

### Categories and tags

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/v1/categories | No route-level auth middleware | List active complaint categories |
| POST | /api/v1/categories | Admin JWT | Create a category |
| GET | /api/v1/tags | No route-level auth middleware | List available tags |

### Reports and analytics

| Method | Endpoint | Access in current router | Description |
|---|---|---|---|
| GET | /api/v1/reports/system | No route-level auth middleware | System-wide complaint statistics |
| GET | /api/v1/reports/departments | No route-level auth middleware | Complaint workload by department |
| GET | /api/v1/reports/analytics/unassigned-staff | No route-level auth middleware | Staff who have never been assigned a complaint |
| GET | /api/v1/reports/analytics/silent-students | No route-level auth middleware | Students who filed complaints but never commented |
| GET | /api/v1/reports/analytics/high-volume-categories | No route-level auth middleware | Categories with more than two complaints |

### AI chat (RAG integration)

These endpoints require a valid JWT. The Node.js API proxies chat questions to the separately hosted Python FastAPI RAG service using **RAG_API_URL**.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/chat | Submit a question and receive the assistant's answer |
| GET | /api/v1/chat/history | Get the authenticated user's recent chat history (up to 50 messages) |

Example request:

~~~bash
curl -X POST "http://localhost:8000/api/v1/chat" -H "Authorization: Bearer <JWT>" -H "Content-Type: application/json" -d '{"query":"How do I report a classroom projector issue?"}'
~~~

The chat service expects the RAG API at **<RAG_API_URL>/chat**. The RAG service is a separate Python application and must be running and reachable for chat requests to succeed.

> **Access-control note:** The table above reflects middleware currently attached in the route definitions. In particular, complaint list/detail reads, reports, category/tag reads, and department listing currently have no route-level authentication middleware. Review whether these endpoints should be protected before using real student or operational data in production. Service-level checks may still apply to individual operations.

## 🔐 Authentication overview

- **JWT API authentication:** The client sends an access token in the Authorization Bearer header. **requireAuth** verifies it and **requireRole** enforces role-based access.
- **Roles:** The API middleware recognizes student, staff and admin.
- **Google sign-in:** The backend verifies a Google ID token using the configured Google client ID.
- **Landing-page SSO handoff:** An authenticated API user requests a one-time handoff code. The landing app exchanges that code, and the backend issues the **sayso_landing_session** HTTP-only cookie.
- **Cookie settings:** The landing session cookie is HTTP-only, uses SameSite=Lax, and is marked Secure in production.

## 🗄️ Database and migrations

Database schemas are defined in TypeScript under **src/db/schema/**. Drizzle Kit uses **drizzle.config.ts** and writes generated SQL migrations to **drizzle/**.

Useful commands:

| Command | Purpose |
|---|---|
| npm run db:generate | Generate migration files from schema changes |
| npm run db:migrate | Apply generated migrations |
| npm run db:push | Push schema changes directly (use deliberately; review production changes first) |
| npm run db:studio | Open Drizzle Studio |
| npm run db:seed-admin | Run the admin seed script |

The project also contains manual SQL migration scripts under **scripts/manual-migrations/**. Check the migration history and deployment process before applying manual scripts; do not assume generated migrations include every database object.

## 🧪 Testing and quality

Run the automated test suite:

~~~bash
npm test
~~~

Run the TypeScript build:

~~~bash
npm run build
~~~

## 🐳 Docker

The Dockerfile includes development and production build stages. Docker Compose provides the API, MySQL and Redis services for local development.

Common commands:

~~~bash
docker compose up --build
docker compose up -d --build
docker compose logs -f api
docker compose down
~~~

Persistent Compose volumes are configured for MySQL and Redis data.

## 📊 Logging, health checks and deployment

- Pino and pino-http provide structured application and HTTP request logging.
- **GET /live** checks whether the API process is running.
- **GET /ready** checks whether MySQL and Redis are reachable.
- **GET /health** reports the API and dependency status.
- The repository's GitHub Actions workflow builds and tests the backend, builds the deployment artifact/image, runs database migrations during deployment, and restarts the API on the configured EC2 host.

Production deployment requires the corresponding GitHub Actions secrets, server configuration, and environment variables. Never put production credentials in this README or commit them to the repository.

## 🤝 Contributing

1. Create a feature branch from main.
2. Make focused changes and add or update tests where appropriate.
3. Run npm test and npm run build.
4. Update this README and the Swagger/OpenAPI annotations when API routes or request/response contracts change.
5. Open a pull request describing the change.

## 📄 License

The package metadata currently declares the ISC license. Check the repository's license file and project ownership terms before redistributing this code.

---

<p align="center">
  Built for a better campus experience with ☕ and TypeScript.
</p>
