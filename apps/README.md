# Applications

This directory contains the applications that make up Premily.

## Applications

| Directory | Responsibility | Technology |
|---|---|---|
| [`api/`](api/README.md) | Backend API, authentication, business logic, and database access | Express, TypeScript, Prisma |
| [`web/`](web/README.md) | User-facing web application | Next.js, React, TypeScript |

## Development

Both applications are managed through the repository's pnpm workspace.

Install dependencies from the repository root:

```bash
pnpm install
```

Start the backend:

```bash
pnpm --filter api dev
```

Start the frontend in a separate terminal:

```bash
pnpm --filter web dev
```

See each application's README for environment configuration, database setup, and additional commands.

## Architecture

The frontend communicates with the backend over HTTP. The backend owns database access and server-side business logic.

Application-specific dependencies and configuration should remain in their respective directories. Shared workspace configuration belongs at the repository root.
