# Backend Feature Modules

This directory contains the Premily API's feature-based modules.

Each module groups code for a particular business capability. This keeps related behavior together as the application grows.

## Current Modules

| Module | Responsibility |
|---|---|
| `admin/` | Administrative operations |
| `auth/` | Authentication-related endpoints and logic |
| `cart/` | Shopping cart operations |
| `categories/` | Product category operations |
| `orders/` | Order-related operations |
| `products/` | Product-related operations |

The table describes each module's intended responsibility, not a guarantee that every feature is complete.

## Module File Responsibilities

A typical module follows this structure:

```text
feature/
├── feature.routes.ts
├── feature.controller.ts
├── feature.service.ts
└── feature.schema.ts
```

### Routes

Define HTTP endpoints and connect them to controllers. Routes are also an appropriate place to attach route-level middleware.

### Controllers

Handle HTTP-specific concerns: read request data, call the appropriate service, and send the response.

Controllers should avoid accumulating business logic.

### Services

Contain the application's business operations and coordinate data access through Prisma when necessary.

### Schemas

Define the expected shape of incoming data and validate it before the relevant operation proceeds.

### Utilities

Some modules may include additional files for reusable feature-specific logic, such as authentication helpers.

## Typical Request Flow

```text
HTTP Request
    ↓
Route and middleware
    ↓
Controller
    ↓
Service
    ↓
Prisma / Database
    ↓
Service → Controller → HTTP Response
```

Not every operation must use every layer, but responsibilities should remain clear.

## Design Principles

- Keep feature-specific code inside its feature directory.
- Keep shared infrastructure in `config/`, `lib/`, and `middleware/`.
- Validate untrusted input at the API boundary.
- Enforce authentication and authorization on protected operations.
- Keep database constraints and business rules consistent.
- Test successful requests, invalid input, missing resources, and unauthorized access.

When adding a new feature, follow the existing module conventions and document meaningful deviations.
