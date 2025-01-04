# Workflow Template and Project Management System

A scalable project management system built with Next.js, ShadCN, Prisma ORM, and PostgreSQL. The system allows admins to create reusable workflows with phases, tasks, and associated forms/checklists.

## Features

- 🔄 Workflow Management
- 📋 Project Creation and Tracking
- ✅ Task and Form Management
- 👥 User Management with Role-based Access
- 📊 Dashboards and Analytics

## Tech Stack

- **Frontend:** Next.js, ShadCN (Radix + TailwindCSS)
- **Backend:** Next.js API routes using Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** NextAuth (JWT-based)
- **Form Handling:** React Hook Form, Zod Validation
- **Styling:** TailwindCSS

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15
- pgAdmin (for database management)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/WorkFlowPMS"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
