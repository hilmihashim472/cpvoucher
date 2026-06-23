# 🎟️ CP Voucher Management System

A full-stack MERN Voucher Management System that allows users to browse, redeem, and manage vouchers through a points-based rewards system. The platform includes AI-powered voucher description generation, PDF receipt generation, email notifications, analytics dashboards, and comprehensive admin management tools.

---

## ✨ Features

### 👤 User Features

- User registration and login with JWT authentication
- Browse vouchers by category
- Search vouchers by title or description
- Redeem vouchers using reward points
- Automatic voucher code generation
- Download PDF receipts
- Receive voucher confirmations via email
- View redemption history
- Profile management with image upload
- Mobile-responsive user interface

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

- React 19
- Vite
- React Router DOM
- React Hook Form
- Tailwind CSS 4
- Axios
- Recharts
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Nodemailer
- Multer
- Sharp
- Puppeteer
- Google Gemini API

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

- PDF receipt generation
- Email delivery
- Downloadable transaction records

---

## 📂 Project Structure

```bash
cpvoucher/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   └── uploads/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── config/
│   └── src/
│
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

- Node.js v18+
- MongoDB v5+
- npm

### Clone Repository

```bash
git clone https://github.com/hilmihashim472/cpvoucher.git
cd cpvoucher
```

### Install Dependencies

```bash
npm run install:all
```

Or manually:

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder.

```env
MONGO_URI=mongodb://localhost:27017/cpvoucher

JWT_SECRET=your_jwt_secret

NODE_ENV=development

FRONTEND_URL=http://localhost:5137

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

---

## 🗄️ Database Seeding

Populate the database with sample data:

```bash
cd backend
npm run seed
```

### Sample Accounts

| Role | Email | Password |
|--------|--------|--------|
| Admin | admin@example.com | password123 |
| User | john@example.com | password123 |

---

## ▶️ Running the Application

### Start Both Frontend & Backend

```bash
npm run dev
```

### Start Separately

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

---

## 🌐 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/me
```

### Vouchers

```http
GET /api/vouchers
GET /api/vouchers/:id
GET /api/vouchers/category-counts
```

### Cart

```http
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:id
DELETE /api/cart/:id
POST   /api/cart/redeem
GET    /api/cart/history
```

### Admin

```http
GET    /api/admin/vouchers
POST   /api/admin/vouchers
PATCH  /api/admin/vouchers/:id
DELETE /api/admin/vouchers/:id
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Protected Routes
- Role-Based Access Control (RBAC)
- Input Validation
- Secure File Upload Handling
- Environment Variable Protection
- CORS Configuration

---

## 📊 Key Highlights

✅ MERN Stack Architecture

✅ Google Gemini AI Integration

✅ PDF Receipt Generation

✅ Email Notification System

✅ Dashboard Analytics

✅ Image Optimization with Sharp

✅ Role-Based Authentication

✅ Responsive UI Design

---

## 👨‍💻 Team Members

- [Hilmi Hashim](https://github.com/hilmihashim472)
- [Ain Najihah](https://github.com/ainnajihah173)
- [Azri Mukhriz](https://github.com/mukhriz-bytes)

---

## 📜 License

This project is licensed under the ISC License.

---

## ⭐ Acknowledgements

- MongoDB
- Express.js
- React
- Node.js
- Google Gemini API
- Tailwind CSS
- Puppeteer
- Sharp

---

> ⚠️ Never commit `.env` files, API keys, passwords, or database credentials to public repositories.
