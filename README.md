# Delivery Management System

A full-stack web application for managing delivery orders with real-time updates. Supports three user roles: Buyer, Seller, and Admin.

## Features

- **Authentication**: JWT-based login and registration for all roles
- **Real-time Updates**: Socket.io for live dashboard updates
- **Order Management**: Create, track, and manage orders through 7 stages
- **Role-based Access**: Different dashboards and permissions for each role
- **Admin Controls**: Associate buyers, view stats, and detailed logs

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI, Socket.io-client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: MongoDB
- **Real-time**: Socket.io

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd delivery-management-system/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and update MongoDB URI and JWT secret

4. Start MongoDB (if using local instance)

5. Run the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd delivery-management-system/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Register as a Buyer, Seller, or Admin
2. Login with your credentials
3. Use the respective dashboard based on your role

### Buyer
- Create new orders with multiple items
- View order progress in real-time

### Seller
- View assigned orders in a table
- Move orders to the next stage
- Delete orders

### Admin
- View all orders and statistics
- Associate buyers to orders
- View detailed order history and logs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Orders
- `GET /api/orders/buyer` - Get buyer's active order
- `POST /api/orders` - Create new order (buyer)
- `GET /api/orders/seller` - Get seller's orders
- `PUT /api/orders/:id/next-stage` - Move order to next stage (seller)
- `DELETE /api/orders/:id` - Delete order (seller)

### Admin
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/associate-buyer` - Associate buyer to order
- `GET /api/admin/orders/:id/details` - Get order details and logs
- `GET /api/admin/stats` - Get system statistics

## Deployment

### Backend
- Deploy to Heroku, Vercel, or similar
- Set environment variables in deployment platform

### Frontend
- Build the app: `npm run build`
- Deploy to Netlify, Vercel, or similar

## Live Link

https://maheshdeliverymanagmentsystem.netlify.app/

## GitHub Repository

https://github.com/kdurgamaheshm/Delivery-Managment-System/

