# Workflow PMS (Project Management System)

A modern project management system built with Next.js 13, featuring workflows, phases, tasks, and dynamic form management with version control.

## Features

### Authentication & Authorization
- Next-Auth integration with role-based access control
- Protected routes and API endpoints
- Secure session management

### Project Management
- Create and manage projects
- Assign project managers and team members
- Track project progress and status
- Link projects to workflows and phases

### Workflow Management
- Create custom workflows with multiple phases
- Define tasks within each phase
- Track task completion and dependencies
- Assign tasks to team members

### Dynamic Forms
- Create custom form templates
- Multiple field types support (text, number, checkbox, etc.)
- Form validation and error handling
- Form responses tracking
- Department-specific form templates
- Version control and history tracking
- Version comparison and restoration
- Form response version tracking

### User Interface
- Modern and responsive design with TailwindCSS
- Server and client components optimization
- Loading states and error handling
- Toast notifications for user feedback
- Drag-and-drop functionality
- Version comparison interface

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Components**: Radix UI + Shadcn UI
- **State Management**: React Server Components + Client Hooks
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Development**: ESLint + Prettier

## Project Structure

```
src/
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   │   └── forms/         # Form management API routes
│   │       └── templates/ # Form template and version routes
│   ├── auth/              # Authentication pages
│   ├── forms/             # Form management pages
│   ├── projects/          # Project management pages
│   ├── settings/          # Settings pages
│   └── workflows/         # Workflow management pages
├── components/            # Reusable components
│   ├── forms/            # Form-related components
│   │   ├── FormBuilder.tsx       # Form builder component
│   │   ├── FormVersionControl.tsx # Version control component
│   │   ├── FormVersionDiff.tsx   # Version comparison component
│   │   └── FormPreview.tsx       # Form preview component
│   ├── projects/         # Project-related components
│   ├── ui/               # UI components
│   └── workflows/        # Workflow-related components
├── lib/                   # Utility functions and configurations
│   ├── services/         # Service layer
│   │   └── form-version.service.ts # Form version management
│   ├── auth.ts           # Auth configuration
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
└── middleware.ts         # Global middleware
```

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

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Seed the database:
```bash
npx prisma db seed
```

7. Start the development server:
```bash
npm run dev
```

## Development Guidelines

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write JSDoc comments for functions and components
- Use semantic commit messages
- Create feature branches for new development
- Write tests for critical functionality

## Database Schema

The application uses a PostgreSQL database with the following main models:

- User
- Project
- Workflow
- Phase
- Task
- Department
- FormTemplate
- FormVersion
- FormResponse

Refer to `prisma/schema.prisma` for the complete schema definition.

## Form Version Control

The system includes comprehensive form version control:

- Version history tracking
- Changelog documentation
- Version comparison
- Version restoration
- Active version management
- Response version tracking

### Version Management API

```typescript
// Get all versions
GET /api/forms/templates/:id/versions

// Get specific version
GET /api/forms/templates/:id/versions/:versionId

// Create new version
POST /api/forms/templates/:id/versions

// Update version
PATCH /api/forms/templates/:id/versions/:versionId

// Restore version
POST /api/forms/templates/:id/versions/:versionId/restore
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
