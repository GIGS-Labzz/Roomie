# Backend Migration Plan
## Supabase → NestJS + Express + Containerised PostgreSQL

> **Status:** Planning  
> **Last updated:** 2026-06-27  
> **Author:** Engineering

---

## Table of Contents

1. [Why We're Migrating](#1-why-were-migrating)
2. [Technology Mapping](#2-technology-mapping)
3. [What Does NOT Change](#3-what-does-not-change)
4. [Migration Strategy](#4-migration-strategy)
5. [Phase 0 — Preparation & Audit](#phase-0--preparation--audit)
6. [Phase 1 — Containerised PostgreSQL](#phase-1--containerised-postgresql)
7. [Phase 2 — NestJS Scaffold](#phase-2--nestjs-scaffold)
8. [Phase 3 — Schema & ORM Migration](#phase-3--schema--orm-migration)
9. [Phase 4 — Authentication Migration](#phase-4--authentication-migration)
10. [Phase 5 — REST API Migration](#phase-5--rest-api-migration)
11. [Phase 6 — Realtime (WebSockets)](#phase-6--realtime-websockets)
12. [Phase 7 — File Storage Migration](#phase-7--file-storage-migration)
13. [Phase 8 — Frontend Cutover](#phase-8--frontend-cutover)
14. [Phase 9 — Supabase Teardown](#phase-9--supabase-teardown)
15. [Risk Matrix](#risk-matrix)
16. [Rollback Strategy](#rollback-strategy)

---

## 1. Why We're Migrating

| Problem | Impact |
|---|---|
| Supabase free tier pauses projects after inactivity | Production outages with zero warning |
| Vendor lock-in on auth, storage, realtime, and DB | Hard to customise, hard to self-host |
| RLS policies written in SQL are opaque and hard to test | Security logic is scattered, not in application code |
| No control over DB connection pooling or query plans | Scaling blocked by Supabase limits |
| Supabase Realtime uses proprietary protocol | Harder to debug than plain WebSockets |

**Goal:** Replace every Supabase primitive with a self-owned, containerised equivalent while keeping all three frontends (app, admin, web) fully functional throughout the migration.

---

## 2. Technology Mapping

| Supabase Primitive | Replacement | Notes |
|---|---|---|
| Supabase PostgreSQL | PostgreSQL 16 (Docker) | Same database engine, schema is portable |
| `@supabase/supabase-js` client | Axios + custom API client | Frontends talk to NestJS REST API |
| `@supabase/ssr` auth cookies | HTTP-only cookie with JWT | Same security model |
| Supabase Auth (OAuth + email) | Passport.js (Google + Local strategies) | JWT issued by NestJS |
| Row Level Security (RLS) | NestJS Guards + Service-layer checks | Logic moves to TypeScript |
| Supabase Realtime (postgres_changes) | Socket.io WebSocket gateway | NestJS `@WebSocketGateway()` |
| Supabase Storage (receipts bucket) | MinIO (S3-compatible, Docker) | Same API surface as S3 |
| Supabase DB triggers | Application events + Prisma middleware + NestJS EventEmitter | e.g., notify on new message |
| Supabase Edge Functions | NestJS controllers | Standard HTTP endpoints |
| `supabase db push` migrations | Prisma migrations | `prisma migrate deploy` (or `prisma migrate dev` for local) |

**New backend lives at:** `apps/api` within the existing monorepo.  
**Base URL (dev):** `http://localhost:4000`  
**Base URL (prod):** `https://api.roomie.ng`

---

## 3. What Does NOT Change

The following are **out of scope** and remain untouched during this migration:

- `apps/web` — landing page (no Supabase usage after waitlist migration)
- `packages/ui`, `packages/animations`, `packages/config` — shared packages
- Paystack payment flow — webhook endpoint moves to NestJS, logic stays identical
- Anthropic Claude integration — receipt parsing moves to NestJS, same API
- Web Push (VAPID) — notification sending moves to NestJS, same `web-push` library
- PWA service worker — Serwist config unchanged
- Tailwind design system — unchanged

---

## 4. Migration Strategy

We use a **Strangler Fig** pattern:

```
[Week 1-2]  New NestJS API runs in parallel alongside Supabase
[Week 3-6]  Frontend apps switch routes one module at a time
[Week 7-8]  Supabase Auth replaced last (highest risk)
[Week 9]    Supabase Storage replaced
[Week 10]   Supabase fully removed, container stack is live
```

**Key principle:** At no point do we do a big-bang cutover. Each phase is deployed independently and can be rolled back by flipping an environment variable.

The frontend selects its API via:
```
NEXT_PUBLIC_USE_NEST_API=true   → calls http://localhost:4000
NEXT_PUBLIC_USE_NEST_API=false  → calls Supabase directly (current behaviour)
```

This flag is toggled per-module (auth, messages, housing, etc.) as each is validated.

---

## Phase 0 — Preparation & Audit

**Goal:** No code changes. Set up tooling, document the current state, agree on conventions.

### 0.1 — Lock current Supabase state

```bash
# Export the current live schema as a reference snapshot
supabase db dump --schema public > supabase/schema_snapshot_pre_migration.sql

# Export live data for local seeding during development
supabase db dump --data-only > supabase/data_snapshot.sql
```

### 0.2 — Agree on NestJS conventions

| Convention | Decision |
|---|---|
| ORM | Prisma |
| Validation | `class-validator` + `class-transformer` (NestJS standard) |
| Auth tokens | JWT (access token 15m, refresh token 7d, stored in httpOnly cookies) |
| API versioning | URL prefix `/v1/` on all routes |
| Error format | `{ error: string, code: string, statusCode: number }` |
| WebSocket lib | Socket.io (handles reconnection, namespaces, rooms) |
| File storage | MinIO SDK (S3-compatible) |
| Config | `@nestjs/config` with `.env` files (same variable names) |

### 0.3 — Set up the monorepo workspace

```bash
# Create the new NestJS app directory
mkdir apps/api

# Add to turbo.json pipeline
# Add to package.json workspaces
```

### 0.4 — Define the shared API client package

Create `packages/api-client` — a typed HTTP client that both `apps/app` and `apps/admin` will import instead of `@repo/db`. This is the *only* new shared package created during the migration. The existing `@repo/db` package is deleted in Phase 9.

---

## Phase 1 — Containerised PostgreSQL

**Goal:** Spin up a local PostgreSQL container. Get data in. Prove the schema works without Supabase.

**Risk:** Low — Supabase is still the live system. This is purely local dev work.

### 1.1 — Docker Compose setup

Create `docker-compose.yml` at the repo root:

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    container_name: roomie_postgres
    environment:
      POSTGRES_DB: roomie
      POSTGRES_USER: roomie
      POSTGRES_PASSWORD: localdevpassword
    ports:
      - "5433:5432"        # 5433 to avoid clash with any local postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/init:/docker-entrypoint-initdb.d   # run migrations on first boot
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U roomie"]
      interval: 5s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: roomie_minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: roomie_dev
      MINIO_ROOT_PASSWORD: localdevpassword
    ports:
      - "9000:9000"        # S3 API
      - "9001:9001"        # MinIO Console UI
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

### 1.2 — Port the Supabase schema

The 12 existing SQL migration files translate to the new Postgres with one change: **remove all Supabase-specific extensions** (uuid-ossp is standard, keep it) and **remove RLS policies** (moving to application layer).

What to keep:
- All `CREATE TABLE` statements — identical
- All `CREATE TYPE` (enums) — identical
- All `CREATE INDEX` — identical
- Triggers for `set_updated_at`, `notify_on_new_message`, `inc/dec_post_*_count` — move to application events and Prisma middleware (see Phase 3)

What to remove:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- All `CREATE POLICY` statements
- `CREATE EXTENSION IF NOT EXISTS "supabase_vault"` (Supabase-specific)
- References to `auth.uid()` and `auth.jwt()` (Supabase Auth internals)

Create `supabase/init/01_schema.sql` — a clean, Supabase-free version of the full schema.

### 1.3 — Seed local data

```bash
docker compose up -d postgres
psql postgresql://roomie:localdevpassword@localhost:5433/roomie -f supabase/init/01_schema.sql
psql postgresql://roomie:localdevpassword@localhost:5433/roomie -f supabase/data_snapshot.sql
```

### 1.4 — Verify schema completeness

Check every table exists and sample queries return data:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
SELECT count(*) FROM profiles;
SELECT count(*) FROM connections;
```

**Exit criteria for Phase 1:** Full schema running in Docker, seeded with dev data, all 14 tables verified present.

---

## Phase 2 — NestJS Scaffold

**Goal:** Create the NestJS application skeleton with all modules stubbed out but no business logic yet. The app starts, connects to PostgreSQL, and returns 200 on a health check.

**Risk:** Zero — nothing connects to this app yet.

### 2.1 — Bootstrap the app

```bash
cd apps/api
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express

# Prisma ORM
npm install prisma @prisma/client
npm install -D prisma --save-dev

npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-google-oauth20
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/config class-validator class-transformer
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner   # MinIO is S3-compatible
npm install web-push @anthropic-ai/sdk                          # stays the same
npm install -D @types/passport-jwt @types/passport-google-oauth20 @types/web-push

# Initialize Prisma (run after installing)
npx prisma init --datasource-provider postgresql
```

### 2.2 — Module structure

```
apps/api/src/
├── main.ts                     # Bootstrap, CORS, cookie-parser, global pipes
├── app.module.ts               # Root module
├── config/
│   └── database.config.ts      # Prisma client / datasource config from env vars
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /v1/auth/login, /v1/auth/google, /v1/auth/refresh, /v1/auth/logout
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── google.strategy.ts
│   └── guards/
│       ├── jwt-auth.guard.ts   # Replaces: Supabase session check
│       └── roles.guard.ts      # Replaces: admin_users RLS policy
├── profiles/
│   ├── profiles.module.ts
│   ├── profiles.controller.ts  # GET /v1/profiles/:id, PATCH /v1/profiles/me
│   ├── profiles.service.ts
│   └── profiles.service.ts     # Uses Prisma client to access `profiles` model
├── connections/
│   ├── connections.module.ts
│   ├── connections.controller.ts
│   ├── connections.service.ts
│   └── connections.service.ts  # Uses Prisma client to access `connections` model
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts
│   ├── messages.service.ts     # Uses Prisma client to access `messages` model
│   ├── messages.gateway.ts     # Socket.io WebSocket gateway
├── payments/
│   ├── payments.module.ts
│   ├── payments.controller.ts  # POST /v1/payments/webhook (Paystack)
│   ├── payments.service.ts
│   └── payment.entity.ts
├── agreements/
│   ├── agreements.module.ts
│   ├── agreements.controller.ts
│   └── agreements.service.ts
├── posts/
│   ├── posts.module.ts
│   ├── posts.controller.ts
│   └── posts.service.ts
├── housing/
│   ├── housing.module.ts
│   ├── housing.controller.ts
│   └── housing.service.ts
├── splits/
│   ├── splits.module.ts
│   ├── splits.controller.ts
│   └── splits.service.ts
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   └── notifications.service.ts
├── storage/
│   ├── storage.module.ts
│   └── storage.service.ts      # Wraps MinIO S3 client
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts     # Super admin routes
│   └── admin.service.ts
└── waitlist/
    ├── waitlist.module.ts
    ├── waitlist.controller.ts
    └── waitlist.service.ts
```

### 2.3 — Health check

```typescript
// apps/api/src/app.controller.ts
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

**Exit criteria for Phase 2:** `GET http://localhost:4000/health` returns 200. Prisma client connects to the Docker PostgreSQL container. All modules load without errors.

---

## Phase 3 — Schema & ORM Migration

**Goal:** Create Prisma models for every table and a migration system that replaces `supabase db push`.

**Risk:** Low — this is additive work. Nothing in production changes.

### 3.1 — Prisma Models

Each Supabase table becomes a Prisma model in `prisma/schema.prisma`. Example for `profiles`:

```prisma
// prisma/schema.prisma
model profiles {
  id                  String   @id @default(uuid()) @db.Uuid
  display_name        String?  @db.Text
  onboarding_step     Int      @default(0)
  student_verified    Boolean  @default(false)
  verification_status String?  @db.Text
  created_at          DateTime @default(now())
  updated_at          DateTime @updatedAt
  // ... other columns (use exact column names to keep imports simple)
}
```

All 14 tables should have corresponding Prisma models. For a first pass you can run `prisma db pull` against the running Postgres container to introspect the schema and generate a starting `schema.prisma`, then refine types, enums and relations as needed.

Use Prisma Migrate for migrations (`prisma migrate dev` locally, `prisma migrate deploy` in CI/production). To load existing SQL snapshot for seeds, apply the SQL directly to the Docker Postgres when bootstrapping, then `prisma db pull` to sync the Prisma schema.

### 3.2 — Replace Supabase triggers with application events and Prisma middleware

**Trigger: `set_updated_at`**  
Prisma handles this via `DateTime @updatedAt` fields in `schema.prisma`. No DB trigger required.

**Trigger: `handle_new_user` (auto-create profile)**  
Handle in `auth.service.ts` after OAuth/sign-up: check `prisma.profiles.findUnique()` and `prisma.profiles.create()` if missing. Application code is easier to test than SQL triggers.

**Trigger: `notify_on_new_message`**  
Emit application events from the message-creation service using NestJS `EventEmitter2`:

```typescript
// After creating a message with Prisma:
this.eventEmitter.emit('message.created', { message, recipientId });

// In notifications.service.ts:
@OnEvent('message.created')
async handleNewMessage(payload) {
  await this.upsertNotification(payload.recipientId, 'NEW_MESSAGE', ...);
  await this.pushService.sendToUser(payload.recipientId, ...);
}
```

**Trigger: `inc/dec_post_likes_count`**  
Moved to `posts.service.ts` — wrapped in a Prisma transaction:

```typescript
async likePost(postId: string, userId: string) {
  await this.prisma.$transaction(async (tx) => {
    await tx.postLike.create({ data: { postId, userId } });
    await tx.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
  });
}
```

### 3.3 — Replace RLS with NestJS Guards

Every Supabase RLS policy becomes a Guard or a service-level check.

| Supabase RLS Policy | NestJS Replacement |
|---|---|
| `profiles: public read` | No guard on `GET /v1/profiles/:id` |
| `profiles: owner write` | `JwtAuthGuard` + service checks `user.id === profile.id` |
| `connections: involved parties only` | Service checks `connection.requesterId === userId OR connection.receiverId === userId` |
| `messages: ACTIVE connection members` | Service checks connection status before returning messages |
| `admin_users: super_admin role` | `RolesGuard` checks JWT payload `role === 'super_admin'` |
| `housing_platforms: owner by email` | Service checks `platform.contactEmail === user.email` |
| `waitlist: public insert` | No guard on `POST /v1/waitlist` |

**Where auth info comes from:** The JWT payload (issued by NestJS at login) contains `{ sub: userId, email, role }`. Guards read this from the request object — no database query required on every request.

### 3.4 — Prisma Migration workflow

```bash
# Introspect existing DB (optional)
npx prisma db pull

# Generate a new migration during development (creates SQL and updates _prisma_migrations)
npx prisma migrate dev --name init

# Apply migrations in CI / production
npx prisma migrate deploy

# Reset local DB (dev only, clears data)
npx prisma migrate reset

# Generate the Prisma client (usually run automatically by migrate/pull)
npx prisma generate
```

Replaces: `supabase db push`

**Exit criteria for Phase 3:** All 14 Prisma models defined, relationships mapped, Prisma migrations run cleanly against the Docker PostgreSQL container, data snapshot imports successfully.

---

## Phase 4 — Authentication Migration

> **This is the highest-risk phase.** Auth touches every protected route and both apps. Do this phase last among the API modules, not first.

**Goal:** Replace Supabase Auth (Google OAuth + sessions) with Passport.js + JWT in NestJS. Users log in via the NestJS backend; frontends receive a JWT in an httpOnly cookie.

**Risk:** High — bugs here log out all users. Mitigation: run old and new auth in parallel, migrate one app at a time.

### 4.1 — JWT Strategy

```typescript
// auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.['access_token'],   // httpOnly cookie
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

### 4.2 — Google OAuth flow

```
Browser → GET /v1/auth/google
       ← 302 redirect to Google
       
Google → GET /v1/auth/google/callback?code=X
NestJS  → exchanges code → gets user info
        → finds or creates profile in DB
        → issues JWT (access + refresh tokens)
        → sets httpOnly cookies
        ← 302 redirect to app (same as Supabase callback today)
```

The redirect destination is `NEXT_PUBLIC_APP_URL/discover` — identical to the current Supabase callback redirect.

### 4.3 — JWT Refresh strategy

- `access_token`: 15 minutes, stored in `httpOnly; Secure; SameSite=Lax` cookie
- `refresh_token`: 7 days, stored in `httpOnly; Secure; SameSite=Strict` cookie
- `POST /v1/auth/refresh` — verifies refresh token, issues new access token

This replaces `@supabase/ssr`'s automatic cookie-based session refresh.

### 4.4 — Multi-role auth (Admin app)

Supabase resolves admin roles by querying `admin_users` and `housing_platforms` tables. We embed the role in the JWT at login:

```typescript
async login(user: User): Promise<TokenPair> {
  const role = await this.resolveRole(user.id, user.email);
  const payload = { sub: user.id, email: user.email, role };
  // role is one of: 'student' | 'super_admin' | 'provider' | 'pending'
  return {
    accessToken: this.jwt.sign(payload, { expiresIn: '15m' }),
    refreshToken: this.jwt.sign(payload, { expiresIn: '7d', secret: this.refreshSecret }),
  };
}
```

The `RolesGuard` reads `request.user.role` — no DB query on every admin request.

### 4.5 — Frontend changes for auth

Replace in `apps/app`:
- Remove `@supabase/ssr` and `@supabase/supabase-js`  
- Remove `AuthContext` (Supabase `onAuthStateChange`)  
- Create `AuthContext` that reads `GET /v1/auth/me` on mount and listens for cookie expiry  
- Replace all `supabase.auth.signOut()` calls with `POST /v1/auth/logout`  
- Replace OAuth redirect with `window.location.href = 'http://localhost:4000/v1/auth/google'`  

Replace in `apps/admin`:
- Same pattern, with role-aware redirects preserved

### 4.6 — Migration toggle

```
# apps/app/.env.local
NEXT_PUBLIC_AUTH_PROVIDER=supabase    # switch to: nestjs
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The `AuthContext` checks this variable and calls either Supabase auth or the NestJS auth endpoint. Allows testing without breaking prod.

**Exit criteria for Phase 4:** Google OAuth login through NestJS works end-to-end. JWT is set in cookies. `GET /v1/auth/me` returns the logged-in user's profile. Student app and admin app both authenticate successfully. Supabase auth still works in parallel.

---

## Phase 5 — REST API Migration

**Goal:** Port every API route from Next.js API routes (backed by Supabase queries) to NestJS controllers (backed by Prisma). Migrate one domain at a time.

**Recommended order (lowest risk → highest risk):**

```
1. Waitlist          (no auth, simple INSERT)
2. Housing           (read-only, no auth required for public)
3. Posts/Feed        (read-heavy, auth for writes)
4. Profiles          (read-heavy, auth for writes)
5. Bill Splits       (connection-scoped, moderate complexity)
6. Notifications     (owner-only, simple)
7. Payments webhook  (no auth, HMAC verification)
8. Agreements        (complex state machine)
9. Connections       (triggers payment flow)
10. Messages         (replaced by WebSocket in Phase 6)
```

### 5.1 — API endpoint mapping

Every existing Next.js API route maps 1:1 to a NestJS controller:

| Current (Next.js) | New (NestJS) |
|---|---|
| `POST apps/app/api/connections` | `POST /v1/connections` |
| `GET apps/app/api/connections/[id]` | `GET /v1/connections/:id` |
| `POST apps/app/api/agreements` | `POST /v1/agreements` |
| `PATCH apps/app/api/agreements/[id]/accept` | `PATCH /v1/agreements/:id/accept` |
| `PATCH apps/app/api/agreements/[id]/confirm` | `PATCH /v1/agreements/:id/confirm` |
| `POST apps/app/api/payments/webhook` | `POST /v1/payments/webhook` |
| `POST apps/app/api/platforms/[id]/click` | `POST /v1/platforms/:id/click` |
| `POST apps/app/api/push/subscribe` | `POST /v1/push/subscribe` |
| `POST apps/app/api/push/send` | `POST /v1/push/send` |
| `POST apps/app/api/splits` | `POST /v1/splits` |
| `GET apps/app/api/splits/[id]` | `GET /v1/splits/:id` |
| `PATCH apps/app/api/splits/[id]/items/[itemId]` | `PATCH /v1/splits/:id/items/:itemId` |
| `POST apps/app/api/splits/[id]/items/[itemId]/receipt` | `POST /v1/splits/:id/items/:itemId/receipt` |
| `POST apps/admin/api/providers/register` | `POST /v1/admin/providers/register` |
| `POST apps/web/api/waitlist` | `POST /v1/waitlist` |

### 5.2 — Porting a route (example: Paystack webhook)

The webhook logic is identical — just moves from a Next.js `route.ts` to a NestJS controller. The HMAC verification, database update, and connection status change logic are copy-pasted and wrapped in a service.

```typescript
// payments/payments.controller.ts
@Post('webhook')
@HttpCode(200)
async handleWebhook(@Headers('x-paystack-signature') sig: string, @Body() body: any) {
  this.paymentsService.verifySignature(sig, body);  // throws 403 if invalid
  await this.paymentsService.processWebhook(body);
  return { received: true };
}
```

### 5.3 — The `packages/api-client` shared package

During this phase, create `packages/api-client/src/index.ts` — a typed Axios client that wraps every NestJS endpoint:

```typescript
export const api = {
  connections: {
    create: (data) => axios.post('/v1/connections', data),
    getById: (id) => axios.get(`/v1/connections/${id}`),
  },
  messages: {
    list: (connectionId, cursor) => axios.get(`/v1/messages`, { params: { connectionId, cursor } }),
    send: (data) => axios.post('/v1/messages', data),
  },
  // ... all endpoints
};
```

Frontends gradually replace direct Supabase calls (`supabase.from('connections').select(...)`) with `api.connections.getById(id)`.

### 5.4 — Claude integration (receipt parsing)

The receipt upload + Claude vision endpoint moves to NestJS with no logic changes:

```typescript
// splits/splits.controller.ts
@Post(':id/items/:itemId/receipt')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('receipt'))
async uploadReceipt(@Param() params, @UploadedFile() file: Express.Multer.File, @Req() req) {
  return this.splitsService.processReceiptWithClaude(params.id, params.itemId, file, req.user);
}
```

The `@anthropic-ai/sdk` usage is identical. File goes to MinIO instead of Supabase Storage.

**Exit criteria for Phase 5:** All 15 API routes operational in NestJS. Frontend apps are toggled to use NestJS API for all modules except messages (still Supabase Realtime) and auth (still Supabase). All Postman/manual tests pass.

---

## Phase 6 — Realtime (WebSockets)

**Goal:** Replace Supabase Realtime (postgres_changes + Presence) with Socket.io via NestJS `@WebSocketGateway`.

**Current Supabase channels:**
1. `chat:{connectionId}` — new messages (INSERT on `messages`)
2. `presence:{connectionId}` — typing indicators (ephemeral)
3. `notifications:{userId}` — new notifications (INSERT on `notifications`)

**New Socket.io rooms:**
1. `chat:{connectionId}` — identical name, same payload
2. `presence:{connectionId}` — identical name
3. `user:{userId}` — notifications channel

### 6.1 — WebSocket Gateway

```typescript
// messages/messages.gateway.ts
@WebSocketGateway({ cors: true, namespace: '/chat' })
export class MessagesGateway {

  @SubscribeMessage('join_room')
  async handleJoinRoom(client: Socket, { connectionId }: { connectionId: string }) {
    // Guard: verify the user is a member of this connection
    await this.validateConnectionMembership(client.data.userId, connectionId);
    client.join(`chat:${connectionId}`);
    client.join(`presence:${connectionId}`);
  }

  @SubscribeMessage('send_message')
  async handleMessage(client: Socket, payload: CreateMessageDto) {
    const message = await this.messagesService.create(payload, client.data.userId);
    // Emit to the room — both sender and receiver get it
    this.server.to(`chat:${payload.connectionId}`).emit('new_message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, { connectionId }: { connectionId: string }) {
    client.to(`chat:${connectionId}`).emit('user_typing', { userId: client.data.userId });
  }
}
```

### 6.2 — Auth on WebSocket connections

WebSocket connections carry the JWT cookie. On connect:

```typescript
async handleConnection(client: Socket) {
  const token = client.handshake.headers.cookie; // parse access_token
  const user = this.jwtService.verify(token);
  client.data.userId = user.sub;
}
```

This replaces Supabase's `createServerClient()` call that was needed to validate each realtime subscription.

### 6.3 — Notification delivery

When `NotificationsService.create()` is called (from the `message.created` event), it also emits to the user's Socket.io room:

```typescript
async create(userId: string, notification: CreateNotificationDto) {
  const saved = await this.repo.save({ userId, ...notification });
  this.server.to(`user:${userId}`).emit('new_notification', saved);
  return saved;
}
```

### 6.4 — Frontend WebSocket client

Replace in `apps/app`:

```typescript
// Before (Supabase Realtime)
const channel = supabase.channel(`chat:${connectionId}`)
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, handleMessage)
  .subscribe();

// After (Socket.io)
const socket = io('http://localhost:4000/chat', { withCredentials: true });
socket.emit('join_room', { connectionId });
socket.on('new_message', handleMessage);
```

The message payload structure is identical — same fields — so `handleMessage` requires no changes.

**Exit criteria for Phase 6:** Live chat works end-to-end via Socket.io. Typing indicators work. Notifications arrive in real-time. No Supabase Realtime subscriptions remain in the codebase.

---

## Phase 7 — File Storage Migration

**Goal:** Replace Supabase Storage (receipts bucket) with MinIO running in the Docker Compose stack.

**Current usage:** One bucket, one use case — receipt images for bill split proof of payment. Max 5 MB, JPEG/PNG/WebP/HEIC/GIF.

### 7.1 — MinIO setup (already in docker-compose from Phase 1)

Create the `receipts` bucket on first boot:

```typescript
// storage/storage.service.ts (runs on app startup)
async onModuleInit() {
  const exists = await this.s3.send(new HeadBucketCommand({ Bucket: 'receipts' }));
  if (!exists) {
    await this.s3.send(new CreateBucketCommand({ Bucket: 'receipts' }));
  }
}
```

### 7.2 — StorageService (wraps AWS SDK — same API as S3)

```typescript
@Injectable()
export class StorageService {
  private readonly s3: S3Client;

  constructor(config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: config.get('MINIO_ENDPOINT'),   // http://localhost:9000
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.get('MINIO_ACCESS_KEY'),
        secretAccessKey: config.get('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,  // required for MinIO
    });
  }

  async upload(bucket: string, key: string, file: Buffer, mimeType: string): Promise<string> {
    await this.s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: file, ContentType: mimeType }));
    return `${this.endpoint}/${bucket}/${key}`;
  }

  async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
  }
}
```

### 7.3 — Replace Supabase Storage calls

```typescript
// Before (Supabase Storage)
const { data, error } = await supabase.storage.from('receipts').upload(path, file);

// After (MinIO via StorageService)
const url = await this.storageService.upload('receipts', path, file.buffer, file.mimetype);
```

The `proof_url` column in `bill_split_items` now stores the MinIO URL instead of a Supabase Storage URL. For existing records, the Supabase Storage URL remains valid until we migrate historical files (or simply leave them — they're proof images, not served dynamically).

**Exit criteria for Phase 7:** Receipt upload works via NestJS + MinIO. Images viewable in MinIO Console at `http://localhost:9001`. Claude vision still extracts amounts correctly.

---

## Phase 8 — Frontend Cutover

**Goal:** Remove all Supabase SDK imports from `apps/app` and `apps/admin`. Switch both apps to use `packages/api-client` exclusively.

**This phase is executed module by module, not all at once.**

### 8.1 — Removal checklist per app

**`apps/app`:**
- [ ] Remove `@supabase/supabase-js` from `package.json`
- [ ] Remove `@supabase/ssr` from `package.json`
- [ ] Remove `@repo/db` from `package.json`
- [ ] Delete `apps/app/src/context/AuthContext.tsx` → replace with JWT-based version
- [ ] Delete `apps/app/app/auth/callback/route.ts` → handled by NestJS
- [ ] Delete all `supabase.from(...).select/insert/update/delete` calls → replace with `api.*` calls
- [ ] Delete `apps/app/src/hooks/useMessages.ts` → replace with Socket.io hook
- [ ] Delete `apps/app/src/context/NotificationContext.tsx` → replace with Socket.io version
- [ ] Remove all middleware that called `createServerClient()`

**`apps/admin`:**
- [ ] Same Supabase removal steps
- [ ] Remove `AdminAuthContext.tsx` Supabase queries → JWT role from cookie
- [ ] All admin data queries now hit `GET /v1/admin/*` NestJS endpoints

### 8.2 — New environment variables

```bash
# apps/app/.env.local (after migration)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# Remove entirely:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY
```

### 8.3 — `packages/api-client` becomes the new `@repo/db`

Add to `package.json` of `apps/app` and `apps/admin`:

```json
"@repo/api-client": "*"
```

Import pattern changes:

```typescript
// Before
import { getMessages } from '@repo/db/queries/messages';

// After
import { api } from '@repo/api-client';
const messages = await api.messages.list(connectionId);
```

**Exit criteria for Phase 8:** Both `apps/app` and `apps/admin` have zero imports of `@supabase/*` or `@repo/db`. All features work against NestJS + PostgreSQL + MinIO + Socket.io.

---

## Phase 9 — Supabase Teardown

**Goal:** Delete everything Supabase-specific. The Supabase cloud project is paused/deleted. The monorepo is fully self-contained.

### 9.1 — Files to delete

```
packages/db/                     → entire package deleted
supabase/migrations/             → replaced by apps/api/src/migrations/
supabase/config.toml             → deleted
supabase/seed.sql                → replaced by apps/api/src/seeds/
supabase/.env                    → deleted
```

### 9.2 — Packages to remove from all package.json files

```
@supabase/supabase-js
@supabase/ssr
```

### 9.3 — Monorepo cleanup

```json
// package.json — remove from workspaces
"workspaces": [
  "apps/*",
  "packages/*"   // packages/db no longer exists
]
```

```json
// turbo.json — remove any @repo/db pipeline references
```

### 9.4 — Final docker-compose (production)

```yaml
# docker-compose.prod.yml
services:
  api:
    build: ./apps/api
    environment:
      DATABASE_URL: postgresql://roomie:${DB_PASSWORD}@postgres:5432/roomie
      JWT_SECRET: ${JWT_SECRET}
      MINIO_ENDPOINT: http://minio:9000
      # ... all other env vars
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  nginx:
    image: nginx:alpine
    # Proxies /api → api:4000, /socket.io → api:4000
    ports:
      - "80:80"
      - "443:443"
```

**Exit criteria for Phase 9:** `supabase/` directory deleted. `packages/db` deleted. Zero `@supabase/*` imports anywhere. Application runs entirely from the Docker Compose stack.

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auth migration logs out all users | Medium | High | Run old and new auth in parallel; feature-flag per app |
| Realtime message delivery breaks | Medium | High | Fall back to polling if Socket.io fails; test extensively before cutover |
| JWT token expiry UX regression | Low | Medium | Match Supabase's session refresh UX; test on slow networks |
| Missing RLS enforcement | Medium | Critical | Audit every endpoint against the original RLS policy; write integration tests |
| Paystack webhook signature failure | Low | High | Keep old Next.js webhook handler alive until NestJS webhook is validated in prod |
| PostgreSQL data loss during migration | Very Low | Critical | Run Supabase and local Postgres in parallel; never delete Supabase until fully validated |
| MinIO storage unavailable in prod | Low | Medium | Keep Supabase Storage as read-only fallback for historical receipt URLs |
| TypeORM migration rollback | Low | Medium | Every TypeORM migration has a `down()` method; test rollback before applying to prod |

---

## Rollback Strategy

Each phase is independently rollbackable via environment variables:

```bash
# Roll back to Supabase auth
NEXT_PUBLIC_AUTH_PROVIDER=supabase

# Roll back to Supabase API
NEXT_PUBLIC_USE_NEST_API=false

# Roll back to Supabase Realtime
NEXT_PUBLIC_USE_SOCKET_IO=false
```

The Supabase cloud project is kept on the free tier (do not delete) until Phase 9 is fully validated in production for at least two weeks. If anything breaks in Phase 9, the Supabase project can be unpaused and traffic redirected back within minutes.

**The nuclear rollback:** Revert `NEXT_PUBLIC_*` env vars → redeploy frontends → all three apps are back on Supabase. Estimated time: 10 minutes.

---

## Implementation Timeline (Suggested)

| Phase | Estimated Effort | Dependency |
|---|---|---|
| Phase 0 — Preparation | 1 day | None |
| Phase 1 — Docker + PostgreSQL | 2 days | Phase 0 |
| Phase 2 — NestJS Scaffold | 2 days | Phase 1 |
| Phase 3 — Schema & ORM | 3 days | Phase 2 |
| Phase 4 — Authentication | 4 days | Phase 3 |
| Phase 5 — REST API (all modules) | 7 days | Phase 3 |
| Phase 6 — Realtime/WebSockets | 3 days | Phase 5 |
| Phase 7 — File Storage | 2 days | Phase 2 |
| Phase 8 — Frontend Cutover | 4 days | Phases 4, 5, 6, 7 |
| Phase 9 — Supabase Teardown | 1 day | Phase 8 validated in prod |
| **Total** | **~4–5 weeks** | |

> Phases 5, 6, and 7 can run in parallel once Phase 3 is complete.

---

*This document reflects the codebase state as of 2026-06-27. Update it before each phase begins.*
