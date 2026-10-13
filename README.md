# Nexora — E-Commerce Platform

**Nexora** is a modern, responsive e-commerce web application built to provide users with a simple and convenient online shopping experience.

## 🚀 Features
- User registration and login
- Product browsing and categories
- Shopping cart management
- Order processing and management
- Paystack Test Mode integration
- Responsive user interface

## 🛠️ Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Payment:** Paystack API (Test Mode)
- **Version Control:** Git & GitHub

## ⚙️ Installation

**1. Clone the repository**
```bash
git clone YOUR_REPOSITORY_URL
cd ecommercewebsite
```

**2. Install dependencies**

Run `npm install` inside both the frontend and backend directories.

**3. Configure environment variables**

Create a `.env` file in the backend directory and add your required database connection, authentication, and payment credentials. Set `PAYSTACK_SECRET_KEY` on the backend and `VITE_PAYSTACK_PUBLIC_KEY` in the frontend environment. Use keys from the same Paystack environment (both test keys or both live keys); configure the frontend variable when building/deploying the client.

**4. Start the application**

Run the appropriate development scripts from each directory:

```bash
npm run dev
```

## 🔄 How It Works
Users browse products, add items to their cart, and proceed to checkout. The backend processes requests, MongoDB stores application data, and Paystack handles payment processing when configured.

## 🎯 Project Objective
To demonstrate practical full-stack development skills, including frontend design, REST API development, database integration, authentication, and payment gateway integration.

## 🔮 Future Improvements
- Admin dashboard
- Product reviews and ratings
- Advanced search and filtering
- Order tracking and notifications

## 👨‍💻 Author
**Developed as a full-stack web development project.**

GitHub: YOUR_GITHUB_PROFILE_URL
