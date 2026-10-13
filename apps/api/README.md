# Premily API

The Premily API is the backend application for the Premily e-commerce platform. It provides HTTP endpoints, authentication middleware, feature modules, validation, and database access.

## Technology Stack

- Node.js and TypeScript
- Express 5
- PostgreSQL 17
- Prisma 7
- PostgreSQL driver adapter: `@prisma/adapter-pg`
- Zod for environment configuration and request validation
- JWT and Argon2 for authentication-related functionality

## Directory Structure

```text
apps/api/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   └── copy-prisma-client.mjs
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── lib/
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── error-handler.ts
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── categories/
│   │   ├── orders/
│   │   └── products/
│   ├── app.ts
│   └── index.ts
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js
- pnpm
- Docker-compatible environment
- PostgreSQL configured through the project's environment variables

## Environment Configuration

Copy `.env.example` to `.env` inside `apps/api/`.

The example file defines:

| Variable | Purpose |
|---|---|
| `PORT` | Port on which the API listens |
| `NODE_ENV` | Runtime environment |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used for JWT-related operations |

Use strong, private values for secrets. Do not commit `.env` files or production credentials.

## Database Setup

Start the local PostgreSQL service from the repository root:

```bash
docker compose up -d
```

From the repository root, apply pending development migrations:

```bash
pnpm --filter api exec prisma migrate dev
```

The Prisma schema is located at `prisma/schema.prisma`, and migration history is stored in `prisma/migrations/`.

## Development Commands

Run these commands from the repository root.

Start the API in development mode:

```bash
pnpm --filter api dev
```

Build the backend:

```bash
pnpm --filter api build
```

Start the compiled backend:

```bash
pnpm --filter api start
```

The default API port is `4000`.

## Build Process

The current build script performs three operations:

1. `prisma generate` generates Prisma Client from the schema.
2. `tsc` compiles the TypeScript source.
3. `node scripts/copy-prisma-client.mjs` copies the generated Prisma Client into the compiled output directory.

The copy step is required by the current custom Prisma output configuration. If the Prisma generator output or deployment layout changes, review this step and test the production build again.

## Application Entry Points

- `src/app.ts`: configures Express, middleware, route mounting, and error handling.
- `src/index.ts`: starts the HTTP server.
- `src/config/env.ts`: centralizes environment configuration.
- `src/lib/prisma.ts`: creates the shared Prisma Client instance.
- `src/middleware/`: contains shared HTTP middleware.
- `src/modules/`: contains feature-specific backend functionality.

## HTTP Endpoints

The Express application currently mounts these route groups:

| Prefix | Responsibility |
|---|---|
| `/api/auth` | Authentication |
| `/api/categories` | Category operations |
| `/api/products` | Product operations |
| `/api/cart` | Shopping cart |
| `/api/orders` | Orders |
| `/api/admin` | Administrative operations |
| `/api/me` | Current authenticated user |

The health endpoint is:

```http
GET /health
```

Expected successful response:

```json
{
  "status": "ok"
}
```

A route being mounted does not mean every operation, permission rule, or error case has been fully tested.

## Feature Module Convention

A feature module may contain:

- `*.routes.ts`: registers endpoints and middleware.
- `*.controller.ts`: translates HTTP requests into application operations.
- `*.service.ts`: implements business logic and data access workflows.
- `*.schema.ts`: defines request validation schemas.
- `*.utils.ts`: contains supporting feature-specific utilities where needed.

Read [`src/modules/README.md`](src/modules/README.md) for the reasoning behind this organization.

## Current Limitations

Premily is under active development. Review the implementation and tests before relying on any endpoint in production. Authentication, authorization, validation, database behavior, and operational security require verification as the application evolves.
