# 🏦 Carter Bank Voucher Redemption System

A full-stack MERN Voucher Management System that allows users to browse, redeem, and manage vouchers through a points-based rewards system. The platform includes AI-powered voucher description generation, PDF receipt generation, email notifications, analytics dashboards, and comprehensive admin management tools.

---

## ✨ Features

### 👤 User Features

- User registration and login with JWT authentication
- Google OAuth social login
- Browse vouchers by category
- Search vouchers by title or description
- Redeem vouchers using reward points
- Automatic voucher code generation
- Download PDF receipts
- Receive voucher confirmations via email
- View redemption history
- Profile management with image upload
- Mobile-responsive user interfaces

### 🛠️ Admin Features

- Full voucher management (CRUD)
- Category management
- User management and account activation/deactivation
- Voucher usage tracking and redemption limits
- Dashboard analytics and statistics
- AI-powered voucher description generation using Google Gemini
- Image upload optimization using Sharp
- Order and redemption monitoring

---

## 🚀 Tech Stack

### Frontend

- **React 19** - Core UI framework for building interactive user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing and navigation
- **React Hook Form** - Form state management and validation
- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API requests with interceptors
- **Recharts** - Data visualization and analytics charts
- **React Hot Toast** - User-friendly notification system
- **Lucide React** - Icon library for UI elements

### Backend

- **Node.js** - JavaScript runtime environment (core architecture)
- **Express.js** - Web application framework for API routes
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling and validation
- **JWT Authentication** - Secure token-based authentication
- **Bcrypt** - Password hashing for security
- **Nodemailer** - Email sending service for notifications
- **Multer** - File upload middleware for images
- **Sharp** - High-performance image processing and optimization
- **Puppeteer** - PDF receipt generation from HTML
- **Google Gemini API** - AI-powered voucher description generation
- **Passport.js** - Google OAuth 2.0 authentication strategy

---

## 📸 Core Functionalities

### Voucher Management

- Create and manage vouchers
- Category-based organization
- Voucher image uploads
- Usage limitations
- Unique voucher code generation

### Reward Redemption

- Points-based redemption system
- Balance validation
- Redemption tracking
- Order history management

### AI Integration

Generate professional voucher descriptions instantly using Google Gemini.

### Receipt System

- PDF receipt generation with Puppeteer
- Email delivery
- Downloadable transaction records

---

## 📂 Project Structure

```bash
cpvoucher/
│
├── 📁 backend/                            # 🖥️ Express.js REST API Server
│   │
│   ├── 📄 .env                            # Environment variables (gitignored)
│   ├── 📄 .env.example                    # Template for required env vars
│   ├── 📄 package.json                    # Backend dependencies & scripts
│   ├── 📄 package-lock.json
│   ├── 📄 server.js                       # Express app entry point, middleware, routes
│   ├── 📄 seed.js                         # Database seeder (populates test data)
│   │
│   ├── 📁 config/                         # Configuration modules
│   │   ├── 📄 db.js                       # Mongoose MongoDB connection setup
│   │   ├── 📄 email.js                    # Nodemailer transporter configuration
│   │   └── 📄 passport.js                 # Passport.js JWT configuration
│   │
│   ├── 📁 middleware/                     # Express middleware
│   │   ├── 📄 auth.js                     # JWT access/refresh token verification
│   │   ├── 📄 admin.js                    # Admin role authorization guard
│   │   └── 📄 upload.js                   # Multer file upload handler (profiles, vouchers, receipts)
│   │
│   ├── 📁 models/                         # Mongoose data models
│   │   ├── 📄 User.js                     # User: name, email, password, role, points, profileImg
│   │   ├── 📄 Voucher.js                  # Voucher: title, description, points, category, image, stock
│   │   ├── 📄 Category.js                 # Category: name, description, icon, isActive
│   │   ├── 📄 CartItem.js                 # Active cart item: user, voucher, quantity, addedAt
│   │   ├── 📄 CartItemHistory.js          # Redeemed/checked-out cart history record
│   │   └── 📄 RefreshToken.js             # Refresh token storage for secure rotation
│   │
│   ├── 📁 controllers/                    # Route handler logic
│   │   ├── 📄 authController.js           # Register, login, logout, refresh token, getMe
│   │   ├── 📄 voucherController.js        # CRUD: create, list, get, update, delete vouchers
│   │   ├── 📄 categoryController.js       # CRUD: create, list, get, update, delete categories
│   │   ├── 📄 cartController.js           # Add to cart, remove from cart, checkout (redeem points)
│   │   ├── 📄 DashboardController.js      # Admin dashboard: stats, charts, user counts, voucher counts
│   │   ├── 📄 OrderHistoryController.js   # User order/redeem history listing
│   │   └── 📄 uploadController.js         # Handle file upload requests & responses
│   │
│   ├── 📁 routes/                         # Express route definitions
│   │   ├── 📄 authRoutes.js               # /api/auth/* (register, login, logout, refresh, me)
│   │   ├── 📄 voucherRoutes.js            # /api/vouchers/* (CRUD + filtering)
│   │   ├── 📄 categoryRoutes.js           # /api/categories/* (CRUD)
│   │   ├── 📄 cartRoutes.js               # /api/cart/* (add, remove, checkout, list)
│   │   ├── 📄 orderHistoryRoutes.js       # /api/orders/* (user history, admin all history)
│   │   ├── 📄 uploadRoutes.js             # /api/upload/* (file images)
│   │   └── 📄 adminRoutes.js              # /api/admin/* (protected: dashboard, user management, system)
│   │
│   ├── 📁 services/                       # Business logic services
│   │   ├── 📄 emailService.js             # Send transactional emails (welcome, receipts, notifications)
│   │   ├── 📄 receiptService.js           # Generate PDF receipts for voucher redemptions
│   │   └── 📄 gemini.js                   # Google Gemini AI integration (admin analytics/reports)
│   │
│   └── 📁 uploads/                        # Uploaded file storage
│       ├── 📁 profiles/                   # User profile picture uploads
│       ├── 📁 receipts/                   # Generated PDF receipt files
│       └── 📁 vouchers/                   # Voucher image uploads
│
├── 📁 frontend/                           # 🎨 React 19 + Vite SPA Client
│   │
│   ├── 📄 .env                            # Environment variables (gitignored)
│   ├── 📄 .env.example                    # Template for required frontend env vars
│   ├── 📄 .gitignore                      # Frontend git ignore rules
│   ├── 📄 index.html                      # Vite HTML entry point
│   ├── 📄 package.json                    # Frontend dependencies (React, Tailwind, etc.)
│   ├── 📄 package-lock.json
│   ├── 📄 vite.config.js                  # Vite bundler configuration
│   ├── 📄 eslint.config.js                # ESLint flat config (linting rules)
│   ├── 📄 README.md
│   │
│   ├── 📁 public/                         # Static assets (served as-is)
│   │   ├── 📄 cbvicon.svg                 # Favicon / app icon
│   │   ├── 📄 cbvlogo.svg                 # Main logo
│   │   ├── 📄 cbvlogo2.svg                # Logo variant
│   │   ├── 📄 cbvlogotext.svg             # Logo with text
│   │   ├── 📄 cbvnavbar.svg               # Navbar logo
│   │   ├── 📄 cbvnavbaradmin.svg          # Admin navbar logo
│   │   └── 📄 icons.svg                   # SVG sprite icons
│   │
│   └── 📁 src/                            # Application source code
│       │
│       ├── 📄 main.jsx                    # React DOM entry point (BrowserRouter, Providers)
│       ├── 📄 App.jsx                     # Root component (route definitions)
│       ├── 📄 index.css                   # Global Tailwind CSS styles
│       │
│       ├── 📁 assets/                     # Imported assets (bundled by Vite)
│       │   ├── 📄 hero.png                # Homepage hero banner image
│       │   ├── 📄 react.svg               # React logo
│       │   └── 📄 vite.svg                # Vite logo
│       │
│       ├── 📁 config/                     # Client-side configuration
│       │   └── 📄 api.js                  # Axios instance (base URL, interceptors, auth headers)
│       │
│       ├── 📁 hooks/                      # Custom React hooks
│       │   └── 📄 useAuth.jsx             # Auth context provider & hook (user state, login/logout)
│       │
│       ├── 📁 components/                 # 🧩 Reusable UI components
│       │   ├── 📄 Navbar.jsx              # Top navigation bar (user session, links)
│       │   ├── 📄 Sidebar.jsx             # Admin sidebar navigation menu
│       │   ├── 📄 AdminMobileNav.jsx      # Admin mobile bottom/top navigation
│       │   ├── 📄 BottomNav.jsx           # Mobile bottom navigation bar
│       │   ├── 📄 Footer.jsx              # Site footer with links
│       │   ├── 📄 VoucherCard.jsx         # Voucher display card (image, title, points)
│       │   ├── 📄 CategoryPill.jsx        # Category filter pill button
│       │   ├── 📄 PointsBadge.jsx         # User points balance display badge
│       │   ├── 📄 SkeletonCard.jsx        # Loading skeleton placeholder
│       │   ├── 📄 EmptyState.jsx          # Empty state placeholder (no data message)
│       │   ├── 📄 InlineError.jsx         # Inline error message component
│       │   ├── 📄 ProtectedRoute.jsx      # Route guard: redirects unauthenticated users
│       │   └── 📄 AdminRoute.jsx          # Route guard: restricts to admin role only
│       │
│       └── 📁 pages/                      # 📄 Page-level components (one per route)
│           │
│           ├── 📁 user/                   # User-facing pages
│           │   ├── 📄 Home.jsx            # Voucher listing / browse page
│           │   └── 📄 ProfileUser.jsx     # User profile & settings page
│           │   # (Other expected pages: Cart, VoucherDetail, Orders, etc.)
│           │
│           ├── 📁 admin/                  # Admin panel pages
│           │   ├── 📄 Dashboard.jsx       # Main admin dashboard overview
│           │   ├── 📄 UserList.jsx        # User management (list, search, edit)
│           │   ├── 📄 SystemOverview.jsx  # System stats & health overview
│           │   └── 📄 AnalyticsReports.jsx# Analytics, charts & AI reports (Gemini)
│           │   # (Other expected pages: VoucherManagement, CategoryManagement, etc.)
│           │
│           └── 📁 shared/                 # Shared/public pages
│               # (Expected: Login, Register, ForgotPassword, NotFound, etc.)
|
├── 📄 .gitignore                          # Git ignored files
├── 📄 EC2_SETUP_GUIDE.md                  # AWS EC2 deployment instructions
├── 📄 package.json                        # Root workspace package scripts
├── 📄 package-lock.json
├── 📄 README.md                           # Project overview & setup guide
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 deploy.yml                  # GitHub Actions: auto-deploy to EC2 on push
└──
---

## ⚙️ Installation

### Prerequisites

- Node.js v18+ (v22 recommended)
- MongoDB v5+ (local or MongoDB Atlas)
- npm or yarn
- Git

### Clone Repository

```bash
git clone https://github.com/hilmihashim472/cpvoucher.git
cd cpvoucher
```

### Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or manually:
cd backend
npm install

cd ../frontend
npm install
```

---

## 🔐 Environment Variables

Create `.env` files based on the example files provided:

### Backend

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```bash
cp backend/.env.example backend/.env
```

### Frontend

Copy `frontend/.env.example` to `frontend/.env` and fill in your values:

```bash
cp frontend/.env.example frontend/.env
```

**Required variables include:**
- MongoDB connection string
- JWT secret key
- Email credentials (Gmail)
- Google OAuth credentials
- API URLs

See the `.env.example` files in each folder for the complete list of required variables.

---

## 🗄️ Database Seeding

Populate the database with sample data:

```bash
cd backend
npm run seed
```

### Sample Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| User | john@example.com | password123 |

---

## ▶️ Running the Application

### Development Mode

Start both frontend and backend concurrently:

```bash
npm run dev
```

### Start Separately

Backend (port 5000):

```bash
npm run dev:backend
# or
cd backend && npm run dev
```

Frontend (port 5173):

```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

### Production Mode

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

---

## 🌐 API Endpoints

### Authentication

```http
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login user
POST /api/auth/refresh           - Refresh access token
POST /api/auth/logout            - Logout user
GET  /api/auth/me                - Get current user
PUT  /api/auth/me                - Update user profile
DELETE /api/auth/profile-picture - Remove profile picture

POST /api/auth/forgot-password   - Request password reset
POST /api/auth/reset-password    - Reset password with token

GET  /api/auth/google            - Google OAuth login
GET  /api/auth/google/callback   - Google OAuth callback
```

### Vouchers

```http
GET    /api/vouchers             - Get all vouchers
GET    /api/vouchers/:id         - Get voucher by ID
GET    /api/vouchers/category-counts - Get category counts
```

### Cart

```http
GET    /api/cart                 - Get user's cart
POST   /api/cart                 - Add item to cart
PUT    /api/cart/:id             - Update cart item quantity
DELETE /api/cart/:id             - Remove item from cart
POST   /api/cart/redeem          - Redeem vouchers
GET    /api/cart/history         - Get redemption history
```

### Admin

```http
GET    /api/admin/vouchers       - Get all vouchers (admin)
POST   /api/admin/vouchers       - Create voucher (admin)
PATCH  /api/admin/vouchers/:id   - Update voucher (admin)
DELETE /api/admin/vouchers/:id   - Delete voucher (admin)
GET    /api/admin/users          - Get all users (admin)
PATCH  /api/admin/users/:id      - Update user (admin)
GET    /api/admin/orders         - Get all orders (admin)
GET    /api/admin/analytics      - Get analytics data (admin)
```

---

## 🔒 Security Features

- JWT Authentication with refresh tokens
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Access Control (RBAC)
- Input Validation
- Secure File Upload Handling
- Environment Variable Protection
- CORS Configuration
- HTTPOnly Cookies for refresh tokens
- Token rotation and family invalidation

---

## 📊 Key Highlights

✅ MERN Stack Architecture

✅ Google Gemini AI Integration

✅ PDF Receipt Generation with Puppeteer

✅ Email Notification System with Nodemailer

✅ Dashboard Analytics with Recharts

✅ Image Optimization with Sharp

✅ Role-Based Authentication

✅ Google OAuth Social Login

✅ Responsive UI Design with Tailwind CSS

✅ Points-Based Redemption System

---

## 🚀 Deployment

### EC2 Deployment (AWS)

This project includes automated deployment to AWS EC2 using GitHub Actions.

**Prerequisites:**
- AWS EC2 instance (Ubuntu 22.04)
- GitHub repository secrets configured
- Domain name (optional but recommended for Google OAuth)

**Setup Instructions:**

See [EC2_SETUP_GUIDE.md](./EC2_SETUP_GUIDE.md) for detailed deployment instructions.

**Quick Deploy:**

1. Push to `master` branch
2. GitHub Actions automatically deploys to EC2
3. Backend runs on PM2 (port 5000)
4. Nginx serves frontend and proxies API requests

**Manual Deployment:**

```bash
# On your EC2 instance
cd ~/cpvoucher
git pull origin master

# Update backend
cd backend
npm install
pm2 restart cpvoucher-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Test Email Locally

Use [MailHog](https://github.com/mailhog/MailHog) or [Ethereal Email](https://ethereal.email/) for testing email functionality without sending real emails.

---

## 📝 Development Notes

### PDF Generation

PDF receipts are generated using Puppeteer. Ensure Chrome/Chromium dependencies are installed on the server:

```bash
# Ubuntu/Debian
sudo apt install -y libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64 chromium-browser
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Team Members

- [Hilmi Hashim](https://github.com/hilmihashim472)
- [Ain Najihah](https://github.com/ainnajihah173)
- [Azri Mukhriz](https://github.com/mukhriz-bytes)

---

## 📜 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgements

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Puppeteer](https://pptr.dev/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [Passport.js](http://www.passportjs.org/)

---

## 📞 Support

For support, email mukhrizbusiness@gmail.com or create an issue in this repository.

---

> ⚠️ **Security Notice:** Never commit `.env` files, API keys, passwords, or database credentials to public repositories. Always use environment variables and keep secrets secure.

---

## 🗺️ Roadmap

- [x] User authentication (email/password)
- [x] Google OAuth integration
- [x] Voucher browsing and redemption
- [x] PDF receipt generation
- [x] Email notifications
- [x] Admin dashboard
- [x] AI-powered descriptions
- [x] Points system
- [x] Order history
- [x] EC2 deployment automation
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Referral system
