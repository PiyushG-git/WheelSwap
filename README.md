# WheelSwap

WheelSwap is a Peer-to-Peer Vehicle Swap & Rental Platform designed to enable users to temporarily swap their vehicles or rent them out in a secure, decentralized fashion.

### 🌐 Deployed Applications
- **Frontend Client**: [https://wheel-swap-chi.vercel.app](https://wheel-swap-chi.vercel.app)
- **Backend Server API**: [https://wheelswap-backend.onrender.com/api/v1](https://wheelswap-backend.onrender.com/api/v1)

## 🚀 Technology Stack
- **Backend**: Node.js, Express, TypeScript, Prisma (PostgreSQL), Redis (Caching), Cloudinary (Media storage)
- **Database**: PostgreSQL
- **Caching & Session Storage**: Redis

## 📋 Features Completed (Phases 1-3)
- **Phase 1 (Foundation & Auth)**: Express backend structure, custom error handling, JWT login/registration with Refresh Token rotation, and SMTP email verification.
- **Phase 2 (KYC)**: Identity verification flow (Aadhaar & Driving License upload to Cloudinary) and Admin approval/rejection endpoints.
- **Phase 3 (Vehicles)**: Vehicle listing management, Multer-based image uploading (up to 10 images), availability calendars, and public search/filtering.

## 🛠️ Local Development Setup

1. **Environment Variables**:
   Copy `backend/.env.example` to `backend/.env` and update the database and redis credentials.

2. **Docker Setup**:
   Launch database and cache servers:
   ```bash
   docker-compose up -d
   ```

3. **Migrations and Seeding**:
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Run Server**:
   ```bash
   npm run dev
   ```
