# Workflow PMS (Project Management System)

A modern project management system built with Next.js 13, featuring workflow management, phase organization, and task tracking.

## Features

- **Authentication & Authorization**
  - Role-based access control (Admin, Manager)
  - Secure authentication using NextAuth.js
  - Protected API routes and pages

- **Workflow Management**
  - Create, edit, and delete workflows
  - Organize workflows with phases
  - Track tasks within phases
  - Drag-and-drop reordering of phases and tasks

- **Task Management**
  - Create and manage tasks within phases
  - Set task priorities (Low, Medium, High)
  - Track estimated hours (minimum 0.25 hours)
  - Task descriptions and status tracking

- **User Interface**
  - Modern, responsive design using TailwindCSS
  - Shadcn UI components for consistent styling
  - Breadcrumb navigation for easy workflow traversal
  - Interactive tables with expandable rows

## Tech Stack

- **Frontend**
  - Next.js 13 (App Router)
  - React
  - TailwindCSS
  - Shadcn UI
  - React Hook Form
  - Zod Validation

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL
  - NextAuth.js

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/workflow-pms.git
cd workflow-pms
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Fill in your environment variables in the `.env` file.

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

## Project Structure

```
workflow-pms/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── workflows/      # Workflow-specific components
│   ├── lib/                # Utility functions and configurations
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## API Routes

### Workflows
- `GET /api/workflows` - Get all workflows
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/[id]` - Get a specific workflow
- `PUT /api/workflows/[id]` - Update a workflow
- `DELETE /api/workflows/[id]` - Delete a workflow

### Phases
- `GET /api/workflows/[id]/phases` - Get phases for a workflow
- `POST /api/workflows/[id]/phases` - Create a new phase
- `PUT /api/workflows/[id]/phases` - Reorder phases
- `GET /api/workflows/[id]/phases/[phaseId]` - Get a specific phase
- `PUT /api/workflows/[id]/phases/[phaseId]` - Update a phase
- `DELETE /api/workflows/[id]/phases/[phaseId]` - Delete a phase

### Tasks
- `GET /api/workflows/[id]/phases/[phaseId]/tasks` - Get tasks for a phase
- `POST /api/workflows/[id]/phases/[phaseId]/tasks` - Create a new task
- `PUT /api/workflows/[id]/phases/[phaseId]/tasks/reorder` - Reorder tasks
- `DELETE /api/workflows/[id]/phases/[phaseId]/tasks/[taskId]` - Delete a task

## Recent Updates

- Added proper error handling for API routes
- Implemented task reordering functionality
- Fixed params handling in Next.js route handlers
- Added workflow data to phase responses
- Updated task validation to enforce minimum hours of 0.25
- Improved API response consistency

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
