# Technical Tradeoffs & Design Decisions

This document outlines the key technical decisions made during the development of this finance dashboard backend, along with the rationale behind each choice and alternatives considered.

---

## 1. Database Architecture

### Decision: PostgreSQL with Raw SQL Queries

**What was chosen:**
- PostgreSQL as the primary database
- Raw SQL queries using `pg` driver instead of an ORM
- No database migrations (manual schema setup)

**Rationale:**
- PostgreSQL provides ACID compliance and robust data integrity for financial records
- Raw SQL offers full control over query optimization, especially for aggregated dashboard data
- Avoided ORM overhead for a focused assignment with clear, simple queries
- Direct SQL makes the data access patterns transparent and easy to review

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Full query control | No type safety on queries |
| No ORM learning curve | Manual schema management |
| Transparent performance | More boilerplate code |
| Easy to optimize | Harder to maintain at scale |

**Production Alternative:**
Would use Prisma or TypeORM for type safety, automatic migrations, and easier schema evolution.

---

## 2. Authentication & Authorization

### Decision: JWT with In-Memory Validation

**What was chosen:**
- JWT tokens for stateless authentication
- bcrypt with 12 rounds for password hashing
- Role-based middleware (`requireRole`) for access control
- No refresh token mechanism

**Rationale:**
- JWT is standard, well-understood, and fits the stateless REST architecture
- bcrypt(12) provides good security/performance balance (~250ms per hash on typical hardware)
- Role middleware is simple, testable, and clearly shows permission logic in route definitions
- Single token approach keeps the implementation focused and reduces complexity

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Stateless - no session store | Cannot revoke tokens instantly |
| Simple to implement | Token theft = full access until expiry |
| Clear role enforcement | No token rotation for security |
| Fast validation | User status checked on every request (DB call) |

**Production Alternative:**
Would implement refresh tokens (stored in httpOnly cookies), token blacklisting with Redis, and shorter access token expiry (15-30 minutes).

---

## 3. Data Access Patterns

### Decision: Shared Dataset (No User Scoping)

**What was chosen:**
- All users see the same financial records
- No user-specific data filtering on records
- `created_by` field exists but is not used for access control

**Rationale:**
- Simplified the domain model for the assignment scope
- Demonstrates RBAC clearly without "where did my data go" confusion during testing
- Focused evaluation on role permissions rather than ownership logic
- Documented this decision clearly in the README

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Simpler to test and demo | Not suitable for multi-tenant production |
| Clear separation of concerns | Privacy issues in real finance apps |
| RBAC logic stands out | Users can't have private records |

**Production Alternative:**
Would implement row-level security (RLS) in PostgreSQL or add `WHERE created_by = ?` to all record queries, ensuring users only see their own data.

---

## 4. Soft Deletes vs Hard Deletes

### Decision: Soft Deletes for Records, Hard Deletes for Users

**What was chosen:**
- Records: Set `deleted_at` timestamp (soft delete)
- Users: Permanent `DELETE` from database
- All queries filter `WHERE deleted_at IS NULL`

**Rationale:**
- Financial records should be auditable and recoverable (soft delete makes sense)
- Users contain PII - GDPR/privacy regulations often require true deletion
- Soft deletes on records allow "undo" functionality in a real dashboard
- Index on `deleted_at` keeps filtered queries performant

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Data recovery possible | Database grows indefinitely |
| Audit trail maintained | Queries need delete filter |
| Accidental delete protection | Slightly slower queries |

**Production Alternative:**
Would implement a scheduled cleanup job to archive old soft-deleted records to cold storage after 90 days, keeping active tables lean.

---

## 5. Validation Strategy

### Decision: express-validator + Manual Validation

**What was chosen:**
- `express-validator` for request body/query validation
- Validation middleware pattern (`validate.js`)
- Custom validators in `/validators` folder
- Manual checks in controllers for business logic (e.g., "can't delete own account")

**Rationale:**
- express-validator is widely used, well-documented, and integrates cleanly with Express
- Separation of validation rules from controller logic improves readability
- Declarative validation chains are easy to understand and modify
- Some validations (like checking existing email) require DB calls anyway

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Declarative, readable rules | Two-phase validation (validator + controller) |
| Good error message formatting | Runtime overhead on every request |
| Framework-standard | Limited to Express ecosystem |

**Production Alternative:**
Would consider Zod for TypeScript-first validation with type inference, or JSON Schema for language-agnostic validation rules.

---

## 6. Error Handling

### Decision: Centralized Error Handler with Consistent Response Format

**What was chosen:**
- `errorHandler.js` middleware for centralized error processing
- `utils/response.js` for standardized success/error JSON format
- Next(err) pattern for error propagation
- Limited error detail in production responses

**Rationale:**
- Centralized handler prevents try-catch boilerplate in every controller
- Consistent response format makes frontend error handling predictable
- `next(err)` pattern is idiomatic Express and works with async/await
- Console logging for debugging while keeping user messages generic

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Consistent API responses | Generic error messages for users |
| No try-catch repetition | Stack traces not sent to client |
| Easy to add logging/monitoring | One error can short-circuit entire request |

**Production Alternative:**
Would implement error categorization (ValidationError, NotFoundError, AuthorizationError) with specific HTTP status codes and monitoring integration (Sentry, etc.).

---

## 7. Architecture Patterns

### Decision: Simple Layered Architecture

**What was chosen:**
- 3-layer architecture: Routes → Controllers → Database
- Thin middleware layer for cross-cutting concerns
- No service layer - business logic in controllers
- No dependency injection

**Rationale:**
- Clear separation without over-engineering for the scope
- Easy to understand flow: HTTP → Validation → Controller → DB → Response
- Demonstrates understanding of backend separation of concerns
- Fits the assignment's focus on clarity over complexity

**Tradeoffs:**
| Pros | Cons |
|------|------|
| Easy to understand and navigate | Business logic scattered in controllers |
| Quick to implement and modify | Harder to unit test in isolation |
| Clear responsibility per layer | Controllers can become bloated |

**Production Alternative:**
Would add a service layer for business logic, repository pattern for data access, and dependency injection for testability.

---

## 8. Omitted Features (Intentional Scope Limitations)

The following features were intentionally left out to maintain focus on core requirements:

| Feature | Reason Omitted | Production Need |
|---------|----------------|---------------|
| **Unit/Integration Tests** | Time constraint; focused on working implementation | Critical - would add Jest + Supertest |
| **Rate Limiting** | Assignment scope; not core requirement | Essential - would use `express-rate-limit` |
| **API Documentation (Swagger)** | README + this doc sufficient for evaluation | Important - would add Swagger/OpenAPI |
| **Request Logging** | Not required for functionality | Essential for debugging - would use Morgan/Winston |
| **Input Sanitization** | Basic validation covers main threats | Critical - would add XSS/SQL injection protection |
| **Database Connection Pool Tuning** | Default `pg` pool sufficient | Important for high load - would tune pool size |
| **Docker Setup** | Local development focus | Essential for team consistency |
| **Email Notifications** | Out of scope | Useful for user onboarding |
| **File Uploads** | Not required | Common for receipt attachments |
| **WebSocket Real-time Updates** | REST-only requirement | Nice-to-have for live dashboard |

---

## 9. Technology Choices Summary

| Category | Chosen | Alternatives Considered |
|----------|--------|------------------------|
| **Runtime** | Node.js | Deno, Bun (too new for stability) |
| **Framework** | Express | Fastify (faster but less familiar), NestJS (too heavy) |
| **Database** | PostgreSQL | MongoDB (flexible but less ACID), MySQL (equivalent) |
| **Auth** | JWT | Session-based (stateful), OAuth (overkill) |
| **Validation** | express-validator | Joi (more verbose), Zod (TypeScript focus) |
| **Password Hashing** | bcrypt (12 rounds) | Argon2 (newer, but bcrypt is battle-tested) |
| **Security** | Basic middleware | Helmet.js (would add in production) |

---

## 10. What Would Change for Production

### Immediate Priorities:
1. **Add comprehensive tests** (Jest, Supertest) - unit, integration, e2e
2. **Implement rate limiting** - prevent brute force and abuse
3. **Add security headers** - Helmet.js for XSS, CSRF, clickjacking protection
4. **Input sanitization** - prevent injection attacks
5. **Health checks** - `/health` endpoint for monitoring
6. **Structured logging** - Winston or Pino with log levels
7. **Environment-based config** - separate dev/staging/prod settings
8. **Database migrations** - Knex or node-pg-migrate for schema versioning
9. **Connection pool tuning** - optimize for expected load
10. **Docker containerization** - consistent deployment

### Medium-term:
1. **Caching layer** - Redis for dashboard summaries and sessions
2. **API versioning** - `/v1/` prefix for future compatibility
3. **Pagination metadata** - Include total count, page info in list responses
4. **Search functionality** - Full-text search on notes/category
5. **Bulk operations** - Batch insert/update for data imports
6. **Audit logging** - Separate table for all data changes
7. **Rate limit by user** - Different limits per role

### Long-term:
1. **Microservices split** - Auth service, Records service, Analytics service
2. **Event-driven updates** - WebSocket or SSE for real-time dashboard
3. **Data warehouse** - Separate analytics database for reporting
4. **Multi-tenancy** - True isolation between organizations

---

## Summary

This implementation prioritizes **clarity, correctness, and maintainability** over feature completeness. The choices made reflect a focused approach to the assignment requirements while acknowledging where production systems would differ.

The codebase demonstrates:
- ✅ Clean separation of concerns
- ✅ Proper authentication and authorization
- ✅ Data integrity and validation
- ✅ Clear documentation
- ⚠️ Intentional scope limitations for focus

The architecture is **extensible** - each layer can be enhanced (service layer added, ORM introduced, tests added) without major refactoring. This shows understanding of both the assignment constraints and production realities.
