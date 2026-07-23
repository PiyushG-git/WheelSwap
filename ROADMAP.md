# WheelSwap — Feature-by-Feature Development Roadmap

> **Project:** WheelSwap — Peer-to-Peer Vehicle Swap & Rental Platform
> **Client:** Confidential
> **Start Date:** July 2026
> **Stack:** Node.js · Express · TypeScript · PostgreSQL · Prisma · React 19 · Vite · Tailwind CSS

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Completed |
| 🔄 | In Progress |
| ⏳ | Pending |
| 🔒 | Blocked (needs dependency) |

---

## PHASE 1 — Project Foundation & Authentication

> **Goal:** Get the server running with a secure, production-grade auth system.

### 1.1 Backend Project Setup
- ✅ `package.json` — all dependencies defined
- ✅ `tsconfig.json` — TypeScript configuration
- ✅ `.env.example` — all environment variable placeholders
- ✅ `prisma/schema.prisma` — full database schema
- ✅ `src/config/env.config.ts` — Zod-validated env config
- ✅ `src/config/database.config.ts` — Prisma singleton client
- ✅ `src/config/redis.config.ts` — Redis + cache helpers
- ✅ `src/config/logger.config.ts` — Winston logger
- ✅ `src/config/cloudinary.config.ts` — Cloudinary setup
- ✅ `src/app.ts` — Express app (CORS, Helmet, rate limit, routes)
- ✅ `src/server.ts` — HTTP server bootstrap with graceful shutdown
- ✅ `docker-compose.yml` — PostgreSQL + Redis local dev

### 1.2 Utilities & Shared Helpers
- ✅ `src/utils/response.util.ts` — Standardized API response builder
- ✅ `src/utils/jwt.util.ts` — JWT sign/verify helpers
- ✅ `src/utils/asyncHandler.util.ts` — Async error wrapper
- ✅ `src/utils/appError.util.ts` — Custom AppError class
- ✅ `src/utils/email.util.ts` — Nodemailer email sender + HTML templates
- ✅ `src/utils/hash.util.ts` — Bcrypt helpers
- ✅ `src/utils/upload.util.ts` — Cloudinary upload helper
- ✅ `src/types/express.d.ts` — Express Request type extensions

### 1.3 Middleware
- ✅ `src/middlewares/auth.middleware.ts` — JWT authentication + RBAC + KYC guard
- ✅ `src/middlewares/error.middleware.ts` — Global error handler
- ✅ `src/middlewares/validate.middleware.ts` — Zod request validator
- ✅ `src/middlewares/rateLimit.middleware.ts` — Express rate limiter
- ✅ `src/middlewares/upload.middleware.ts` — Multer file upload

### 1.4 User Registration & Login
- ✅ `src/validators/auth.validator.ts` — Zod schemas for auth
- ✅ `src/repositories/user.repository.ts` — User DB queries
- ✅ `src/repositories/token.repository.ts` — Refresh token management
- ✅ `src/services/auth.service.ts` — Auth business logic
- ✅ `src/controllers/auth.controller.ts` — Auth route handlers
- ✅ `src/routes/v1/auth.routes.ts` — Auth route definitions
- ✅ **POST** `/api/v1/auth/register`
- ✅ **POST** `/api/v1/auth/login`
- ✅ **POST** `/api/v1/auth/logout`
- ✅ **POST** `/api/v1/auth/refresh-token`
- ✅ **POST** `/api/v1/auth/verify-email`
- ✅ **POST** `/api/v1/auth/forgot-password`
- ✅ **POST** `/api/v1/auth/reset-password`
- ⏳ **POST** `/api/v1/auth/google` — Google OAuth (future)

### 1.5 User Profile
- ✅ `src/validators/user.validator.ts`
- ✅ `src/services/user.service.ts`
- ✅ `src/controllers/user.controller.ts`
- ✅ `src/routes/v1/user.routes.ts`
- ✅ **GET** `/api/v1/users/me`
- ✅ **PATCH** `/api/v1/users/me`
- ✅ **POST** `/api/v1/users/me/avatar`
- ✅ **GET** `/api/v1/users/:id`
- ✅ **PATCH** `/api/v1/auth/change-password`

### 1.6 API Docs & Health
- ✅ Swagger/OpenAPI — embedded in `app.ts`
- ✅ **GET** `/api/v1/health`
- ✅ **GET** `/api/docs`

---

## PHASE 2 — KYC Verification

> **Goal:** Allow users to submit identity documents; admin approves before they can list or swap.

### 2.1 KYC Submission
- ✅ `src/validators/kyc.validator.ts`
- ✅ `src/repositories/kyc.repository.ts`
- ✅ `src/services/kyc.service.ts`
- ✅ `src/controllers/kyc.controller.ts`
- ✅ `src/routes/v1/kyc.routes.ts`
- ✅ **POST** `/api/v1/kyc/submit` — Aadhaar + License upload to Cloudinary
- ✅ **GET** `/api/v1/kyc/status`
- ✅ **PATCH** `/api/v1/kyc/resubmit` — Re-submit rejected docs

### 2.2 Admin KYC Management
- ✅ **GET** `/api/v1/kyc/admin/list`
- ✅ **GET** `/api/v1/kyc/admin/:userId`
- ✅ **PATCH** `/api/v1/kyc/admin/:userId/approve`
- ✅ **PATCH** `/api/v1/kyc/admin/:userId/reject`
- ✅ Email notification on KYC approval/rejection

---

## PHASE 3 — Vehicle Management

> **Goal:** Owners can register vehicles; admin approves before listing goes live.

### 3.1 Vehicle Registration
- ✅ `src/validators/vehicle.validator.ts`
- ✅ `src/repositories/vehicle.repository.ts`
- ✅ `src/services/vehicle.service.ts`
- ✅ `src/controllers/vehicle.controller.ts`
- ✅ `src/routes/v1/vehicle.routes.ts`
- ✅ **POST** `/api/v1/vehicles` — KYC required
- ✅ **GET** `/api/v1/vehicles/my/vehicles`
- ✅ **GET** `/api/v1/vehicles/:id`
- ✅ **PATCH** `/api/v1/vehicles/:id`
- ✅ **DELETE** `/api/v1/vehicles/:id` — Soft delete

### 3.2 Vehicle Images
- ✅ **POST** `/api/v1/vehicles/:id/images` — Cloudinary upload
- ✅ **DELETE** `/api/v1/vehicles/:id/images/:imageId`
- ✅ **PATCH** `/api/v1/vehicles/:id/images/:imageId/primary`

### 3.3 Vehicle Search
- ✅ **GET** `/api/v1/vehicles` — Filter by city, type, seats, fuel, price, dates
- ✅ Redis caching (5 min TTL)
- ✅ Sorting: price_asc, price_desc, newest

### 3.4 Vehicle Availability Calendar
- ✅ **GET** `/api/v1/vehicles/:id/availability`
- ✅ **POST** `/api/v1/vehicles/:id/availability` — Block/unblock dates

### 3.5 Admin Vehicle Management
- ✅ **GET** `/api/v1/vehicles/admin/list`
- ✅ **PATCH** `/api/v1/vehicles/admin/:id/approve`
- ✅ **PATCH** `/api/v1/vehicles/admin/:id/reject`
- ✅ Email notification on vehicle approval/rejection

---

## PHASE 4 — Vehicle Search & Discovery

> **Goal:** Users can search and discover vehicles with powerful filters.

- ⏳ `src/services/search.service.ts` — Search business logic
- ⏳ `src/controllers/search.controller.ts` — Search handlers
- ⏳ `src/routes/v1/search.routes.ts` — Search routes
- ⏳ **GET** `/api/v1/vehicles` — Search with filters:
  - City / Location
  - Vehicle Type (Sedan, SUV, etc.)
  - Number of Seats
  - Fuel Type
  - Transmission
  - Brand / Model
  - Price range (min/max daily rate)
  - Availability (start date, end date)
  - Available for Rent / Swap
  - Pagination (page, limit)
  - Sorting (price, rating, newest)
- ⏳ Redis caching of search results (5-min TTL)
- ⏳ **GET** `/api/v1/vehicles/featured` — Featured/top-rated vehicles
- ⏳ **GET** `/api/v1/vehicles/similar/:id` — Similar vehicles

---

## PHASE 5 — Swap Request Flow

> **Goal:** Core P2P vehicle swap feature — the heart of WheelSwap.

- ⏳ `src/validators/swap.validator.ts`
- ⏳ `src/repositories/swap.repository.ts`
- ⏳ `src/services/swap.service.ts`
- ⏳ `src/controllers/swap.controller.ts`
- ⏳ `src/routes/v1/swap.routes.ts`
- ⏳ **POST** `/api/v1/swaps` — Create swap request (requester's vehicle + target vehicle + dates)
- ⏳ **GET** `/api/v1/swaps` — List my swap requests (sent + received)
- ⏳ **GET** `/api/v1/swaps/:id` — Get swap details
- ⏳ **PATCH** `/api/v1/swaps/:id/accept` — Accept swap request
- ⏳ **PATCH** `/api/v1/swaps/:id/reject` — Reject swap request
- ⏳ **PATCH** `/api/v1/swaps/:id/counter` — Counter offer with different fee
- ⏳ **PATCH** `/api/v1/swaps/:id/cancel` — Cancel swap
- ⏳ Availability check before creating swap
- ⏳ Notification sent to target owner on new request
- ⏳ Notification sent to requester on accept/reject/counter

---

## PHASE 6 — Rental / Booking Flow

> **Goal:** Direct vehicle rental for users who don't own a vehicle.

- ⏳ `src/validators/booking.validator.ts`
- ⏳ `src/repositories/booking.repository.ts`
- ⏳ `src/services/booking.service.ts`
- ⏳ `src/controllers/booking.controller.ts`
- ⏳ `src/routes/v1/booking.routes.ts`
- ⏳ **POST** `/api/v1/bookings` — Create booking request
- ⏳ **GET** `/api/v1/bookings` — List my bookings (as renter)
- ⏳ **GET** `/api/v1/bookings/owner` — List bookings for my vehicles
- ⏳ **GET** `/api/v1/bookings/:id` — Get booking details
- ⏳ **PATCH** `/api/v1/bookings/:id/confirm` — Owner confirms booking
- ⏳ **PATCH** `/api/v1/bookings/:id/cancel` — Cancel booking
- ⏳ Auto-calculate total amount (days × daily rate + security deposit + platform fee)
- ⏳ Availability check before booking

---

## PHASE 7 — Payment Integration (Razorpay)

> **Goal:** Secure payment, security deposits, refunds, and commission management.

- ⏳ `src/validators/payment.validator.ts`
- ⏳ `src/repositories/payment.repository.ts`
- ⏳ `src/services/payment.service.ts`
- ⏳ `src/controllers/payment.controller.ts`
- ⏳ `src/routes/v1/payment.routes.ts`
- ⏳ **POST** `/api/v1/payments/create-order` — Create Razorpay order
- ⏳ **POST** `/api/v1/payments/verify` — Verify Razorpay signature
- ⏳ **POST** `/api/v1/payments/webhook` — Razorpay webhook handler
- ⏳ **GET** `/api/v1/payments/history` — Payment history
- ⏳ **GET** `/api/v1/payments/:id` — Payment details + invoice
- ⏳ **POST** `/api/v1/payments/refund` — Initiate refund
- ⏳ Security deposit hold on booking confirm
- ⏳ Auto-refund deposit on successful return
- ⏳ Platform commission deduction (10% default)

---

## PHASE 8 — Vehicle Inspection

> **Goal:** Digital inspection before and after each trip.

- ⏳ `src/validators/inspection.validator.ts`
- ⏳ `src/repositories/inspection.repository.ts`
- ⏳ `src/services/inspection.service.ts`
- ⏳ `src/controllers/inspection.controller.ts`
- ⏳ `src/routes/v1/inspection.routes.ts`
- ⏳ **POST** `/api/v1/inspections` — Submit pre/post inspection
- ⏳ **GET** `/api/v1/inspections/:bookingId` — Get inspection for booking
- ⏳ Pre-trip: upload images, fuel level, odometer, condition notes
- ⏳ Post-trip: compare with pre-trip, auto-detect discrepancies
- ⏳ Auto-trigger refund if no damage, else open dispute

---

## PHASE 9 — Real-time Features (Socket.io)

> **Goal:** Live chat, real-time notifications, and GPS tracking.

- ⏳ `src/socket/index.ts` — Socket.io server setup
- ⏳ `src/socket/handlers/chat.handler.ts` — Chat events
- ⏳ `src/socket/handlers/notification.handler.ts` — Notification events
- ⏳ `src/socket/handlers/tracking.handler.ts` — Location tracking
- ⏳ Real-time chat between swap/booking parties
- ⏳ Live notification delivery
- ⏳ **GET** `/api/v1/chat/conversations` — List conversations
- ⏳ **GET** `/api/v1/chat/conversations/:id/messages` — Message history
- ⏳ **GET** `/api/v1/notifications` — All notifications
- ⏳ **PATCH** `/api/v1/notifications/:id/read` — Mark as read
- ⏳ **PATCH** `/api/v1/notifications/read-all` — Mark all read

---

## PHASE 10 — Reviews & Ratings

> **Goal:** Build trust through verified post-trip reviews.

- ⏳ `src/validators/review.validator.ts`
- ⏳ `src/repositories/review.repository.ts`
- ⏳ `src/services/review.service.ts`
- ⏳ `src/controllers/review.controller.ts`
- ⏳ `src/routes/v1/review.routes.ts`
- ⏳ **POST** `/api/v1/reviews` — Submit review (only after completed trip)
- ⏳ **GET** `/api/v1/reviews/vehicle/:vehicleId` — Vehicle reviews + avg rating
- ⏳ **GET** `/api/v1/reviews/user/:userId` — User reviews + avg rating
- ⏳ One review per booking/swap per user (enforced in DB + service)

---

## PHASE 11 — Disputes

> **Goal:** Fair dispute resolution for damaged vehicle claims.

- ⏳ `src/validators/dispute.validator.ts`
- ⏳ `src/repositories/dispute.repository.ts`
- ⏳ `src/services/dispute.service.ts`
- ⏳ `src/controllers/dispute.controller.ts`
- ⏳ `src/routes/v1/dispute.routes.ts`
- ⏳ **POST** `/api/v1/disputes` — Open dispute with evidence
- ⏳ **GET** `/api/v1/disputes/:id` — Get dispute details
- ⏳ **POST** `/api/v1/disputes/:id/evidence` — Add evidence
- ⏳ **GET** `/api/v1/admin/disputes` — Admin: list all disputes
- ⏳ **PATCH** `/api/v1/admin/disputes/:id/resolve` — Admin: resolve dispute
- ⏳ Hold deposit while dispute is open
- ⏳ Partial/full refund on resolution

---

## PHASE 12 — Admin Dashboard (Backend APIs)

> **Goal:** Full admin control over the platform.

- ⏳ `src/controllers/admin.controller.ts`
- ⏳ `src/routes/v1/admin.routes.ts`
- ⏳ **GET** `/api/v1/admin/users` — List + filter all users
- ⏳ **PATCH** `/api/v1/admin/users/:id/suspend` — Suspend user
- ⏳ **PATCH** `/api/v1/admin/users/:id/activate` — Reactivate user
- ⏳ **GET** `/api/v1/admin/swaps` — All swap requests
- ⏳ **GET** `/api/v1/admin/bookings` — All bookings
- ⏳ **GET** `/api/v1/admin/payments` — All payments
- ⏳ **GET** `/api/v1/admin/analytics` — Platform analytics:
  - Total users (verified/unverified)
  - Total vehicles (active/pending)
  - Total swaps (completed/cancelled)
  - Total bookings
  - Total revenue (platform commission)
  - Monthly growth charts

---

## PHASE 13 — Background Jobs (BullMQ)

> **Goal:** Async tasks that run in the background.

- ⏳ `src/jobs/queues/email.queue.ts` — Email queue
- ⏳ `src/jobs/queues/notification.queue.ts` — Push notification queue
- ⏳ `src/jobs/workers/email.worker.ts` — Email job processor
- ⏳ `src/jobs/workers/notification.worker.ts` — Notification processor
- ⏳ Welcome email on registration
- ⏳ Email verification email
- ⏳ Booking confirmation email
- ⏳ Swap request notification email
- ⏳ Payment receipt email
- ⏳ Trip reminder email (24h before start)
- ⏳ Deposit refund notification
- ⏳ Auto-expire pending swap requests (48h)

---

## PHASE 14 — Frontend (React 19 + Vite)

> **Goal:** Beautiful, responsive, production-grade web application.

### 14.1 Project Setup
- ⏳ Vite + React 19 + TypeScript
- ⏳ Tailwind CSS v4 + Shadcn UI
- ⏳ Redux Toolkit + RTK Query
- ⏳ React Router DOM v6
- ⏳ Framer Motion
- ⏳ React Hook Form + Zod
- ⏳ Dark / Light mode toggle
- ⏳ Axios instance with interceptors

### 14.2 Auth Pages
- ⏳ `/` — Landing page (hero, features, how it works, CTA)
- ⏳ `/auth/register` — Registration form
- ⏳ `/auth/login` — Login form
- ⏳ `/auth/verify-email` — Email verification status page
- ⏳ `/auth/forgot-password` — Forgot password
- ⏳ `/auth/reset-password` — Reset password

### 14.3 Core Pages
- ⏳ `/dashboard` — User dashboard (stats, recent activity)
- ⏳ `/explore` — Vehicle search + filter page (map + list view)
- ⏳ `/vehicles/:id` — Vehicle details page
- ⏳ `/vehicles/new` — Add new vehicle (multi-step form)
- ⏳ `/my-vehicles` — My vehicles list
- ⏳ `/kyc` — KYC submission page

### 14.4 Swap & Booking Pages
- ⏳ `/swaps` — My swaps list
- ⏳ `/swaps/:id` — Swap details + actions
- ⏳ `/bookings` — My bookings list
- ⏳ `/bookings/:id` — Booking details + actions

### 14.5 Other Pages
- ⏳ `/chat` — Real-time chat
- ⏳ `/notifications` — Notifications list
- ⏳ `/profile` — My profile + edit
- ⏳ `/profile/:id` — Public user profile

### 14.6 Admin Pages
- ⏳ `/admin` — Admin dashboard + analytics
- ⏳ `/admin/kyc` — KYC review queue
- ⏳ `/admin/vehicles` — Vehicle approval queue
- ⏳ `/admin/users` — User management
- ⏳ `/admin/swaps` — Swap management
- ⏳ `/admin/bookings` — Booking management
- ⏳ `/admin/disputes` — Dispute resolution

---

## PHASE 15 — DevOps & Deployment

> **Goal:** CI/CD pipeline, cloud deployment, production config.

- ⏳ `docker-compose.yml` — Local dev environment
- ⏳ `.github/workflows/ci.yml` — GitHub Actions CI (lint, test, type-check)
- ⏳ `.github/workflows/deploy-backend.yml` — Deploy to Render
- ⏳ `.github/workflows/deploy-frontend.yml` — Deploy to Vercel
- ⏳ `README.md` — Full project documentation
- ⏳ Production environment variables setup
- ⏳ Database migration strategy

---

## Current Progress Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1 — Foundation + Auth | ✅ Complete | 100% |
| Phase 2 — KYC | ✅ Complete | 100% |
| Phase 3 — Vehicles | ✅ Complete | 100% |
| Phase 4 — Search | ⏳ Pending | 0% |
| Phase 5 — Swap Flow | ⏳ Pending | 0% |
| Phase 6 — Booking Flow | ⏳ Pending | 0% |
| Phase 7 — Payments | ⏳ Pending | 0% |
| Phase 8 — Inspections | ⏳ Pending | 0% |
| Phase 9 — Real-time | ⏳ Pending | 0% |
| Phase 10 — Reviews | ⏳ Pending | 0% |
| Phase 11 — Disputes | ⏳ Pending | 0% |
| Phase 12 — Admin APIs | ⏳ Pending | 0% |
| Phase 13 — Background Jobs | ⏳ Pending | 0% |
| Phase 14 — Frontend | ⏳ Pending | 0% |
| Phase 15 — DevOps | ⏳ Pending | 0% |
