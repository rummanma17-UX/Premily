# Premily Web

The Premily web application is the frontend of the Premily e-commerce platform. It uses Next.js App Router, React, and TypeScript.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React icons

## Directory Structure

```text
apps/web/
├── app/
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ProductCard.tsx
├── lib/
│   └── api.ts
├── public/
├── types/
│   └── index.ts
├── .env.local.example
├── next.config.ts
└── package.json
```

## Prerequisites

Install Node.js and pnpm, then install dependencies from the repository root:

```bash
pnpm install
```

## Environment Configuration

Copy `.env.local.example` to `.env.local` inside `apps/web/`.

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

This variable defines the base URL used by the frontend's API utility. Values prefixed with `NEXT_PUBLIC_` are exposed to browser-side code, so never put secrets in them.

## Development

Start the frontend from the repository root:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Other Commands

Run the production build:

```bash
pnpm --filter web build
```

Start the production server after a successful build:

```bash
pnpm --filter web start
```

Run ESLint:

```bash
pnpm --filter web lint
```

## API Integration

The shared API utility is located at `lib/api.ts`.

It provides `apiFetch<T>()`, which:

- Builds a request URL from `NEXT_PUBLIC_API_URL` and the supplied path.
- Uses the Fetch API.
- Sets JSON request headers.
- Disables fetch caching for these requests.
- Throws an error for unsuccessful HTTP responses.
- Returns the parsed JSON response.

Ensure the backend is running and the API URL is configured correctly when developing features that depend on the API.

## Development Status

The frontend is under active development. Check the actual pages and components before assuming a feature is complete. The static HTML files in `Frontend-design-demo/` are design references and are separate from the Next.js application.
