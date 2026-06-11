# silly-backend

> Production-ready REST API — Node.js · TypeScript · Express · Prisma · PostgreSQL · JWT

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Language | TypeScript 5 |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (httpOnly cookie + Bearer) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit, bcryptjs |
| Logging | Morgan |
| Code quality | ESLint, Prettier, Husky, lint-staged |

---

## Folder Structure

```
silly-backend/
├── prisma/
│   ├── schema.prisma          # Data models & enums
│   └── seed.ts                # Database seeder
│
├── src/
│   ├── config/
│   │   └── env.ts             # Zod-validated env vars (fails fast on bad config)
│   │
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts   # HTTP layer — thin, delegates to service
│   │       ├── auth.service.ts      # Business logic, DB queries
│   │       ├── auth.routes.ts       # Route definitions + middleware binding
│   │       ├── auth.validation.ts   # Zod schemas for every endpoint
│   │       └── auth.types.ts        # Interfaces, JWT payload, Express augmentation
│   │
│   ├── middleware/
│   │   ├── authenticate.ts    # JWT auth + authorize() RBAC factory
│   │   ├── validate.ts        # Zod request validation (body/params/query)
│   │   └── errorHandler.ts    # Global error handler + 404 handler
│   │
│   ├── utils/
│   │   ├── AppError.ts        # Typed operational error class
│   │   ├── catchAsync.ts      # Async controller wrapper
│   │   └── response.ts        # Consistent success/error response shapes
│   │
│   ├── lib/
│   │   └── prisma.ts          # Singleton Prisma client (hot-reload safe)
│   │
│   ├── routes/
│   │   └── index.ts           # Central API v1 router
│   │
│   ├── app.ts                 # Express app (middleware stack, routes, error handling)
│   └── server.ts              # Entry point (DB connect → listen → graceful shutdown)
│
├── .env                       # Local secrets (git-ignored)
├── .env.example               # Template — commit this
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── tsconfig.json
└── package.json
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally (or a hosted instance)

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in real values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/silly_db?schema=public"
JWT_SECRET=at_least_32_random_chars_here_change_me
COOKIE_SECRET=at_least_32_random_chars_here_change_me
```

> **Generate secrets fast:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### 3. Install dependencies

```bash
npm install
```

### 4. Run migrations

```bash
# Create database tables
npm run prisma:migrate
# name the migration e.g. "init"
```

### 5. (Optional) Seed the database

```bash
npm run prisma:seed
# Creates admin@silly.dev / Admin@1234  and  demo@silly.dev / Demo@1234
```

### 6. Start development server

```bash
npm run dev
# → http://localhost:5000
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Health Check

```
GET /health
```

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|---|
| `POST` | `/api/v1/auth/register` | ❌ | Create account |
| `POST` | `/api/v1/auth/login` | ❌ | Email/password login |
| `POST` | `/api/v1/auth/logout` | ❌ | Clear auth cookie |
| `GET`  | `/api/v1/auth/me` | ✅ | Get current user |
| `PATCH`| `/api/v1/auth/change-password` | ✅ | Change password |

---

### POST `/api/v1/auth/register`

**Request Body**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure@123"
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "cuid...",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "verified": false,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJ..."
  }
}
```

---

### POST `/api/v1/auth/login`

**Request Body**
```json
{
  "email": "jane@example.com",
  "password": "Secure@123"
}
```

**Response `200`** — same shape as register.

---

### GET `/api/v1/auth/me`

**Headers**
```
Authorization: Bearer <token>
```
or send the `token` cookie automatically (set on login/register).

**Response `200`**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { "user": { ... } }
}
```

---

### POST `/api/v1/auth/logout`

**Response `200`**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### PATCH `/api/v1/auth/change-password`

**Headers** — `Authorization: Bearer <token>`

**Request Body**
```json
{
  "currentPassword": "Secure@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Response `200`** — clears cookie, requires re-login.

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / invalid input |
| `401` | Unauthenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email) |
| `422` | Validation error (Zod) |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## npm Scripts

```bash
npm run dev              # Start dev server with hot-reload
npm run build            # Compile TypeScript → dist/
npm run start            # Run compiled build
npm run type-check       # TypeScript check (no emit)
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier write
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Create & apply new migration
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed demo data
npm run prisma:reset     # Reset DB + re-run all migrations
```

---

## Security Highlights

- **Passwords** — bcrypt with 12 salt rounds. Never stored in plain text.
- **JWT** — signed with `HS256`, configurable expiry (default 7d). Delivered via httpOnly `SameSite=Strict` cookie + Bearer header support.
- **Rate Limiting** — 100 req/15min globally, 10 req/15min on auth endpoints.
- **Helmet** — sets 11 security-related HTTP headers.
- **CORS** — allowlist-based, credentials enabled.
- **Payload size limit** — 10 KB to prevent DoS via large body.
- **User enumeration prevention** — same error message for wrong email and wrong password.
- **Stack traces** — only exposed in `NODE_ENV=development`.
- **Env validation** — app refuses to start with missing/invalid config.
- **Graceful shutdown** — closes DB connections on `SIGTERM`/`SIGINT`.

---

## Adding a New Module

1. Create `src/modules/<name>/`
2. Add `<name>.types.ts`, `<name>.validation.ts`, `<name>.service.ts`, `<name>.controller.ts`, `<name>.routes.ts`
3. Register the router in `src/routes/index.ts`:
   ```ts
   import nameRoutes from '../modules/name/name.routes';
   router.use('/name', nameRoutes);
   ```
4. Add any new Prisma models to `prisma/schema.prisma` and run `npm run prisma:migrate`

---

## License

ISC
