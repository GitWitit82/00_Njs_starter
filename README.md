# Workflow PMS

A modern workflow and project management system built with Next.js 13, featuring role-based access control, task management, and department organization.

## Features

- 🔐 Authentication with NextAuth.js
- 👥 Role-based access control (Admin, Manager, User)
- 📋 Workflow management with phases and tasks
- 🎨 Department management with color coding
- 🔄 Drag and drop task reordering
- 📊 Task prioritization and time estimation
- 🎯 Progress tracking and status updates
- 🎨 Modern UI with Tailwind CSS and Shadcn UI

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **State Management**: React Context

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/workflow-pms.git
   cd workflow-pms
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables in the `.env` file.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
workflow-pms/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── styles/          # Global styles
├── prisma/              # Database schema and migrations
└── public/             # Static assets
```

## Recent Updates

- Added department management functionality
  - Create, edit, and delete departments
  - Assign colors to departments for visual organization
  - Associate tasks with departments
  - View tasks by department
- Enhanced task management
  - Added estimated hours field (minimum 0.25 hours)
  - Improved task reordering with drag and drop
  - Added department selection in task creation/editing
- Improved error handling and user feedback
  - Clear error messages for API failures
  - Loading states for better UX
  - Validation feedback for form inputs

## License

MIT License - feel free to use this project for your own purposes.
