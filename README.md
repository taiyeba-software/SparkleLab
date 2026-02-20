# 🚀 SparkleLab — AI Image Editing SaaS (Learning Project)

> An educational Next.js SaaS application for learning real-world software engineering workflows including authentication, cloud processing, API architecture, and production builds.

⚠️ **Credit Notice**: This project is based on educational material from **Adrian Hajdin** at [JavaScript Mastery](https://github.com/adrianhajdin). It has been adapted, debugged, and deployed as part of a hands-on learning journey focused on solving real engineering challenges.

**Repository**: [taiyeba-software/SparkleLab](https://github.com/taiyeba-software/SparkleLab)

---

## 📋 Table of Contents

1. 🤖 [About](#about)
2. ✨ [Features](#features)
3. 🧠 [Engineering Challenges Solved](#engineering-challenges-solved)
4. ⚙️ [Tech Stack](#tech-stack)
5. 🚀 [Quick Start](#quick-start)
6. 🎯 [Learning Goals](#learning-goals)
7. 🔮 [Roadmap](#roadmap)
8. 💬 [Interview Explanation](#interview-explanation)

---

## <a name="about">🤖 About</a>

SparkleLab is an MVP (Minimum Viable Product) for an AI-powered image editing SaaS platform. It demonstrates:

- **End-to-end user workflows** from authentication → upload → processing → result
- **Cloud-native architecture** using Cloudinary for image processing
- **TypeScript-safe full-stack development** with Next.js
- **Production-ready build pipeline** with proper environment configuration
- **Protected API routes** and secure server actions

### Current Capabilities (MVP):

✅ User authentication via Clerk  
✅ Image upload & storage  
✅ Background removal (Cloudinary AI)  
✅ Community image gallery with pagination  
✅ Advanced image search  
✅ User profile management  

### Planned Features (Locked UI):

🔒 Stripe payment integration  
🔒 Image restoration  
🔒 Generative fill  
🔒 Object removal & recoloring  
🔒 Usage credits system  

---

## ✨ <a name="features">Features</a>

### 📦 Core MVP Features

👉 **Secure Authentication**: Clerk-powered sign-up, sign-in, and session management with protected routes

👉 **Image Upload & Processing**: Drag-drop upload with Cloudinary integration for secure storage and transformation

👉 **Background Removal**: AI-powered background removal using Cloudinary's transformation capabilities

👉 **Community Gallery**: Browse all user transformations with pagination and filtering

👉 **Advanced Search**: Search images by title or metadata using MongoDB queries

👉 **User Profile**: View user stats, transformation history, and credit balance

👉 **Responsive Design**: Mobile-first UI built with Shadcn/UI + Tailwind CSS

👉 **TypeScript Safety**: Full end-to-end type safety with Zod validation

### 🔒 Upcoming (MVP+ Phase)

- Stripe checkout flow
- Image restoration algorithms
- Generative fill with AI
- Object removal/recoloring tools
- Credit-based usage system

---

## 🧠 <a name="engineering-challenges-solved">Engineering Challenges Solved</a>

During development, this project encountered and resolved real-world engineering issues:

### 🔴 Challenge 1: Environment Configuration

**Problem**: Environment variables not loading correctly, causing `MONGODB_URI === undefined` errors at runtime.

**Solution**:
- Verified `.env.local` naming and key format
- Restarted dev server to reload environment context
- Added fallback env variable handling
- Implemented proper server-only secret management (no `NEXT_PUBLIC_` prefix for sensitive keys)

### 🔴 Challenge 2: MongoDB Connection Pipeline

**Problem**: `querySrv ECONNREFUSED` and DNS resolution failures with MongoDB Atlas.

**Solution**:
- Diagnosed DNS SRV record resolution issues
- Verified MongoDB Atlas IP allowlist configuration
- Tested both SRV and non-SRV connection strings
- Implemented proper connection error logging for debugging

### 🔴 Challenge 3: TypeScript Build Failures

**Problem**: Global type discovery failures in `next build` despite development working.

**Solution**:
- Updated `tsconfig.json` to include proper `types` array
- Created proper `.d.ts` declaration files
- Fixed `next-env.d.ts` auto-generation
- Validated all type imports and exports

### 🔴 Challenge 4: API Pipeline Architecture

**Problem**: Initial reliance on external APIs created fragile pipelines; needed abstraction.

**Solution**:
- Integrated Cloudinary directly for image processing
- Built typed server actions for safe client-server communication
- Implemented proper error handling with `handleError` utilities
- Added environment validation at startup

### 📊 Final Result

```bash
✅ npm run build      → Successful production build
✅ npm run dev        → Clean development environment
✅ All API routes     → Protected and typed
✅ Database connect   → Verified at startup
```

---

## <a name="tech-stack">⚙️ Tech Stack</a>

### Frontend
- **Next.js 15.5** - React framework with App Router
- **TypeScript** - Static type safety
- **React Hook Form** - Efficient form management
- **Shadcn/UI** - Unstyled, accessible component library
- **Tailwind CSS** - Utility-first styling

### Backend
- **Next.js Server Actions** - Secure server-side logic
- **Mongoose** - MongoDB object modeling
- **Zod** - Runtime schema validation

### Infrastructure
- **MongoDB** - NoSQL document database
- **Cloudinary** - Image storage, transformation, and AI
- **Clerk** - Authentication and user management
- **Stripe** - Payment processing (upcoming)

### Developer Tools
- **ESLint** - Code quality
- **TypeScript** - Type checking
- **Tailwind CSS** - Responsive design system

---

## <a name="quick-start">🚀 Quick Start</a>

### Prerequisites

Ensure you have installed:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/taiyeba-software/SparkleLab.git
cd SparkleLab

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Cloudinary
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Server Configuration
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Stripe (upcoming)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Running in Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 🎯 <a name="learning-goals">Learning Goals</a>

This project was built to learn and practice:

✅ **Environment configuration** - Managing secrets and building configuration  
✅ **Real-world debugging** - Diagnosing and solving production issues  
✅ **TypeScript mastery** - Full-stack type safety from client to server  
✅ **API architecture** - Designing typed server actions and API routes  
✅ **Cloud integration** - Working with Cloudinary, MongoDB, and Clerk  
✅ **Authentication flows** - Implementing secure user sessions with Clerk  
✅ **Database modeling** - Designing MongoDB schemas with Mongoose  
✅ **Responsive UI** - Building mobile-first interfaces with Tailwind  
✅ **Production readiness** - Creating deployable applications  

---

## 🔮 <a name="roadmap">Roadmap</a>

### Phase 1: MVP ✅ (Current)
- [x] User authentication
- [x] Image upload & storage
- [x] Background removal
- [x] Community gallery
- [x] Search functionality
- [x] User profiles

### Phase 2: Payments 🚧 (In Progress)
- [ ] Stripe checkout integration
- [ ] Credit system
- [ ] Transaction tracking
- [ ] Webhook handling

### Phase 3: Advanced Features 📋
- [ ] Image restoration
- [ ] Generative fill
- [ ] Object removal/recoloring
- [ ] Batch processing
- [ ] Export options (PNG, SVG, WebP)

### Phase 4: Optimization 📈
- [ ] Image caching strategy
- [ ] Search indexing
- [ ] Performance monitoring
- [ ] Analytics dashboard

---

## 💬 <a name="interview-explanation">Interview Explanation</a>

### What This Project Demonstrates

**Debug-First Mindset**  
Rather than recreating from scratch, I focused on diagnosing why the original codebase failed (environment issues, MongoDB connection problems, TypeScript build errors) and systematically fixed each layer.

**Production Engineering**  
The project shows understanding of:
- Environment variable safety and naming conventions
- Build pipeline stability (TypeScript, ESLint)
- Database connection resilience
- Proper error handling and logging

**Real-World Architecture**  
- Type-safe server actions instead of raw API calls
- Separation of concerns (models, actions, components)
- Secure credential management
- Scalable Mongoose schema design

**MVP Thinking**  
The codebase ships exactly what's needed for an MVP:
- ✅ Authentication works
- ✅ Core transformation works
- ✅ No unnecessary complexity
- 🔒 Advanced features clearly marked as "upcoming"

### Explaining Incomplete Features

When asked about Stripe integration:

> "The payment flow is intentionally stubbed out with a placeholder alert. The foundation is there (schema, database), but I focused MVP value first: authentication, image processing, and user workflows. Stripe can be integrated in Phase 2 without affecting the core app architecture."

### Green Flags This Sends

✅ **You understand debugging** — Fixed real environment and build issues  
✅ **You respect original creators** — Given proper credit to Adrian Hajdin  
✅ **You shipped a working MVP** — App runs and core features work  
✅ **You can explain decisions** — Clear about what's done and why  
✅ **You know what's incomplete** — Honest about missing features  
✅ **You think about production** — Considered type safety, error handling, secrets  

---

## 🙏 Credits

This project is based on educational material and architectural guidance from:

**Adrian Hajdin**  
- GitHub: [@adrianhajdin](https://github.com/adrianhajdin)
- YouTube: [JavaScript Mastery](https://www.youtube.com/@javascriptmastery)

All architectural patterns, design decisions, and initial codebase belong to the original creator. This version includes extensive debugging, adaptation, environment fixes, and deployment practice.

---

## 📝 License

This project is for educational purposes. Please respect the original creator's work.

---

## 🤝 Support

For questions about how the project works or debugging tips:

1. Check the [todo.md](./todo.md) file for known issues and solutions
2. Review environment configuration carefully (most issues are env-related)
3. Verify Cloudinary, MongoDB, and Clerk credentials

---

## 🚀 Deploy

This project is already deployed to:

- **Vercel** 


Environmental variables must be set in the deployment platform's secrets manager.

---

**This README represents an interview-safe, production-focused version of an educational SaaS platform.**
