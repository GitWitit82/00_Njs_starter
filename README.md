# Workflow Template and Project Management System

A scalable project management system built with Next.js, ShadCN, Prisma ORM, and PostgreSQL. The system allows admins to create reusable workflows with phases, tasks, and associated forms/checklists.

## Features

- 🔄 Workflow Management
- 📋 Project Creation and Tracking
- ✅ Task and Form Management
- 👥 User Management with Role-based Access
- 📊 Dashboards and Analytics
- 🌓 Dark/Light Theme Support
- 📱 Responsive Collapsible Sidebar

## Tech Stack

- **Frontend:** Next.js 14 (App Router), ShadCN (Radix + TailwindCSS)
- **Backend:** Next.js API routes using Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth (JWT-based)
- **Form Handling:** React Hook Form, Zod Validation
- **Styling:** TailwindCSS, CSS Variables

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- pgAdmin (for database management)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/WorkFlowPMS"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Create an admin user:
```bash
npm run seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser

6. Login with the default admin credentials:
   - Username: Admin User
   - Password: 1234

## Authentication and Authorization

The system uses NextAuth.js with the following features:

- JWT-based authentication
- Role-based access control (ADMIN, MANAGER, USER)
- Protected routes and API endpoints
- Secure password handling with bcrypt

### Available Routes

- `/auth/login` - Login page
- `/users` - User management (requires ADMIN role)
- `/dashboard` - User dashboard
- `/settings` - User settings

### Role-Based Access

- **ADMIN**: Full access to all features including user management
- **MANAGER**: Access to management features and user areas
- **USER**: Access to basic dashboard and assigned tasks

### Security Features

- Username/password authentication
- Secure password hashing with bcrypt
- JWT token-based session management
- Protected API routes with role-based middleware
- CSRF protection

## UI/UX Features

- 🌓 Dark/Light theme support with system preference detection
- 📱 Responsive collapsible sidebar for better mobile experience
- 🎨 Modern and clean interface using ShadCN components
- ⚡ Fast page transitions with Next.js App Router
- 🎯 Consistent spacing and layout across pages

## Development

The project follows modern development practices:

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Component-based architecture
- Custom hooks for shared logic
- Zod for runtime type validation
- React Server Components for better performance

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [ShadcnUI Documentation](https://ui.shadcn.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
