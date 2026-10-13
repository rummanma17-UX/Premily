# Premily

Premily is an e-commerce platform in development, focused on the Bangladesh market. The project is built as both a practical software engineering project and a learning journey, with an emphasis on understanding the architecture, implementation, and reasoning behind each feature.

## Project Status

**Active development — not production-ready yet.**

- Backend: Express, TypeScript, PostgreSQL, and Prisma.
- Frontend: Next.js and TypeScript.
- Infrastructure: pnpm workspace and Docker Compose for local PostgreSQL.
- Authentication, shopping cart, orders, products, categories, and administration have dedicated backend modules.

See the application-specific READMEs for current setup instructions and implementation details.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Express 5, TypeScript, Node.js |
| Database | PostgreSQL 17 |
| ORM | Prisma 7 with PostgreSQL driver adapter |
| Validation | Zod |
| Authentication | JWT, Argon2, HTTP cookies |
| Package management | pnpm workspaces |
| Local database | Docker Compose |

## Repository Structure

```text
Premily/
├── apps/
│   ├── api/                  # Express backend
│   │   ├── prisma/           # Database schema and migrations
│   │   ├── scripts/           # Build helper scripts
│   │   └── src/
│   │       ├── config/        # Environment configuration
│   │       ├── lib/           # Shared infrastructure
│   │       ├── middleware/    # Express middleware
│   │       └── modules/       # Feature-based backend modules
│   └── web/                  # Next.js frontend
│       ├── app/               # App Router pages and layouts
│       ├── components/        # Reusable UI components
│       ├── lib/               # Client-side utilities
│       ├── public/            # Static assets
│       └── types/             # Shared frontend types
├── docker-compose.yml        # Local PostgreSQL service
├── package.json              # Root project configuration
├── pnpm-lock.yaml             # Dependency lockfile
└── pnpm-workspace.yaml        # Workspace configuration
```

## Prerequisites

- Node.js
- pnpm
- Docker Desktop or another Docker-compatible environment
- Git

## Getting Started

### 1. Install dependencies

Run from the repository root:

```bash
pnpm install
```

### 2. Configure the backend

Copy `apps/api/.env.example` to `apps/api/.env`.

Configure the database URL, port, environment, and JWT secret. Never commit real secrets.

### 3. Start PostgreSQL

From the repository root:

```bash
docker compose up -d
```

The development database is exposed on port `15432` on your host machine.

### 4. Apply database migrations

```bash
pnpm --filter api exec prisma migrate dev
```

Ensure PostgreSQL is running and the backend environment is configured first.

### 5. Start the backend

```bash
pnpm --filter api dev
```

The API uses port `4000` by default. Its health endpoint is available at `/health`.

### 6. Start the frontend

In another terminal, copy `apps/web/.env.local.example` to `apps/web/.env.local`.

Then run:

```bash
pnpm --filter web dev
```

The frontend uses port `3000` by default.

## Backend Architecture

The backend is organized by feature rather than by technical role.

Each feature module can contain:

- Routes: define HTTP endpoints.
- Controllers: handle HTTP requests and responses.
- Services: contain application and business logic.
- Schemas: validate incoming data.

Shared configuration, middleware, and Prisma infrastructure live outside the feature modules.

The Express application is defined in `apps/api/src/app.ts`, while `apps/api/src/index.ts` starts the server.

## Architecture Principles

- **Feature-based organization:** Related feature logic stays together.
- **Separation of concerns:** HTTP handling, business logic, and validation have distinct responsibilities.
- **Database integrity:** Prisma schema constraints and migrations define database structure and evolution.
- **Accurate order history:** Order items should preserve the relevant purchase-time information.
- **Money representation:** Use decimal database types for monetary values rather than floating-point types.
- **Incremental development:** Features should be implemented, tested, and understood before expanding the system.

## Documentation

- [Backend documentation](apps/api/README.md)
- [Frontend documentation](apps/web/README.md)
- [Backend module architecture](apps/api/src/modules/README.md)
- [Frontend design prototypes](apps/web/Frontend-design-demo/README.md)

## Development Philosophy

Premily is being developed with two goals: building a maintainable application and understanding the engineering decisions behind it.

The implementation, tests, security controls, and deployment process must be verified as development progresses. A successful local build does not by itself establish production readiness.
