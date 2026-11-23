# MamaPlus

The website and the Android app both call one HTTP API. The API is its own package, so it can be run and changed without starting Next.js.

```text
apps/web              Next.js site (port 3000)
apps/api              Hono API (port 4000)
packages/database     Prisma schema, client, and seed scripts
docs/openapi.json     OpenAPI description of the API
uploads/              Files served by the API at /api/files/...
```

## Run locally

From the repository root:

```bash
pnpm install
pnpm db:generate
pnpm dev
```

`pnpm dev` starts the website on http://localhost:3000 and the API on http://localhost:4000.

Run one side only with `pnpm dev:web` or `pnpm dev:api`.

Copy `apps/web/.env.example` to `apps/web/.env.local` and `apps/api/.env.example` to `apps/api/.env`. The API needs `DATABASE_URL` and `JWT_SECRET`. The website needs `NEXT_PUBLIC_API_URL` (http://localhost:4000 in development) plus the NextAuth and OAuth keys.

## API reference

With the API running:

- Interactive docs: http://localhost:4000/docs
- OpenAPI document: http://localhost:4000/openapi.json
- Health check: http://localhost:4000/health

Regenerate the checked-in spec with:

```bash
pnpm --filter @mamaplus/api openapi
```

Authenticated routes expect `Authorization: Bearer <jwt>`. `POST /api/users/login` and `POST /api/users/register` return that token. The same paths and JSON shapes are what the website and the Android app already use.

The website still uses NextAuth for Google, Microsoft, and page protection. After sign-in it stores the API token on the session and sends it as a bearer token.

## Database

Schema and migrations live in `packages/database`. From the repo root:

```bash
pnpm db:studio
pnpm db:seed
pnpm db:seed-courses
pnpm db:seed-blog
```

## Domains

Routers in `apps/api/src/routes`:

| Router | What it covers |
| --- | --- |
| auth | Login, register, logout, social exchange, admin login |
| users | Profile, avatar, onboarding, push tokens |
| courses | Courses, modules, lessons, publish |
| learning | Enrollments and lesson progress |
| payments | Payments and Paystack, including the raw-body webhook |
| agencies | Caregivers, search, sponsorships |
| admin | Users, schools, educators, certificates, reviews, notifications, blog |
| content | Public blog, contact, quick signup |
| files | Uploads and file download |
