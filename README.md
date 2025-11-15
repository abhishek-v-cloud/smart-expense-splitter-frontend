# Smart Expense Splitter - Frontend

A modern React frontend application for managing shared expenses within groups. This client provides an intuitive interface for users to create groups, track expenses, calculate settlements, and generate reports.

## Features

- **User Authentication**: Secure login and registration system
- **Group Management**: Create and manage expense groups with multiple members
- **Expense Tracking**: Add, edit, and delete expenses with categories
- **Settlement Calculations**: Automatic calculation of who owes what
- **Real-time Updates**: Live updates of group balances and settlements
- **Export Reports**: Generate CSV reports for expense summaries
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Toast Notifications**: User-friendly feedback for all actions

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens stored in cookies
- **UI Notifications**: React Toastify
- **Styling**: CSS Modules
- **Development**: ESLint for code quality

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 16 or higher)
- npm or yarn package manager
- Access to the Smart Expense Splitter backend API

## Installation

1. Clone the repository and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Getting Started
1. Register a new account or login with existing credentials
2. Create your first expense group
3. Add members to your group by their email addresses
4. Start adding expenses and track settlements

### Key Features
- **Dashboard**: View all your groups and create new ones
- **Group Details**: Manage members, expenses, and settlements for a specific group
- **Expense Categories**: Organize expenses by type (food, accommodation, transport, etc.)
- **Settlement Tracking**: See who owes money and mark payments as settled
- **Report Export**: Download CSV reports for expense analysis

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Project Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── ExpenseItem.jsx/css
│   │   ├── GroupCard.jsx/css
│   │   ├── LoadingSpinner.jsx/css
│   │   ├── Navbar.jsx/css
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   └── SettlementCard.jsx/css
│   ├── pages/
│   │   ├── Auth.css
│   │   ├── Dashboard.jsx/css
│   │   ├── GroupDetail.jsx/css
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx/css
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## API Integration

This client communicates with the Smart Expense Splitter backend API hosted at:
`https://smart-expense-splitter-backend.vercel.app`

The API provides endpoints for:
- User authentication
- Group management
- Expense operations
- Settlement calculations
- Report generation




