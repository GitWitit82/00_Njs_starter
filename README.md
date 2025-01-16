# Workflow PMS (Project Management System)

A modern project management system built with Next.js 13, featuring workflows, phases, tasks, and dynamic form management with version control. Specialized for vehicle wrap workflow management with multiple visualization options.

## Features

### Authentication & Authorization
- Next-Auth integration with role-based access control
- Protected routes and API endpoints
- Secure session management with JWT
- Department-based access control
- Default admin user creation with seeding
- Automatic session handling in API routes
- Credentials provider with username/password authentication

### Project Management
- Create and manage projects with streamlined workflow integration
- Automatic workflow selection based on project type
- Support for multiple project types:
  - Vehicle Wrap Projects (with VIN tracking)
  - Sign Projects
  - Mural Projects
- Project type-specific form fields and validations
- Assign project managers and team members
- Track project progress and status in real-time
- Link projects to workflows and phases
- Multiple layout options for project visualization:
  - Card-Based Layout: Clean, modern interface for quick project overview
  - Split Panel Layout: Detailed project information with task tracking
  - Kanban Board: Visual task management with status tracking
- Automated form association based on workflow selection
- Progress tracking with visual indicators
- Department-specific project views

### Workflow Management
- Pre-configured workflow templates for different project types:
  - Vehicle Wrap Standard Workflow
  - Sign Project Standard Workflow
  - Mural Project Standard Workflow
- Create custom workflows with multiple phases
- Define tasks within each phase with:
  - Priority levels
  - Man-hour estimates
  - Dependencies
  - Department assignments
- Track task completion and dependencies
- Assign tasks to team members
- Visual progress tracking
- Department-based task organization
- Automated task creation from workflow templates
- Real-time status updates
- Task priority management

### Dynamic Forms
- Create custom form templates
- Multiple field types support (text, number, checkbox, etc.)
- Form validation using Zod schema
- Form responses tracking
- Department-specific form templates
- Version control and history tracking
- Version comparison and restoration
- Form response version tracking
- Automated form assignment based on workflow
- Form completion tracking

### User Interface
- Modern and responsive design with TailwindCSS
- Three distinct layout options for project management:
  - Card-Based Layout: Mobile-friendly, clean interface
  - Split Panel Layout: Efficient side-by-side project details
  - Kanban Board: Drag-and-drop task management
- Server and client components optimization
- Loading states and error handling
- Toast notifications for user feedback
- Drag-and-drop functionality
- Version comparison interface
- Real-time progress indicators
- Status tracking visualization
- Smart form handling with React Hook Form
- Accessible UI components with proper ARIA labels

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
│   │   ├── auth/         # Authentication routes
│   │   ├── projects/     # Project management routes
│   │   └── forms/        # Form management routes
│   ├── auth/             # Authentication pages
│   ├── forms/            # Form management pages
│   ├── projects/         # Project management pages
│   ├── settings/         # Settings pages
│   └── workflows/        # Workflow management pages
├── components/           # Reusable components
│   ├── forms/           # Form-related components
│   ├── projects/        # Project-related components
│   │   ├── CreateProjectDialog.tsx  # Project creation dialog
│   │   ├── CreateProjectForm.tsx    # Project creation form
│   │   └── ProjectsTable.tsx        # Projects listing table
│   ├── ui/              # UI components
│   └── workflows/       # Workflow-related components
├── lib/                 # Utility functions and configurations
│   ├── services/       # Service layer
│   ├── auth.ts        # Auth configuration with NextAuth
│   ├── prisma.ts      # Prisma client configuration
│   └── utils.ts       # Helper functions
└── middleware.ts      # Global middleware for auth protection
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

6. Seed the database with initial data:
```bash
npx prisma db seed
```

This will create:
- Default admin user (username: "admin", password: "1234")
- Standard workflow templates for:
  - Vehicle Wrap projects
  - Sign projects
  - Mural projects

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
- Use early returns for better code readability
- Implement proper error handling
- Add accessibility features to all components

## Database Schema

The application uses a PostgreSQL database with the following main models:

- User (with role-based access)
- Project (with type-specific fields)
- Workflow (with predefined templates)
- Phase (ordered steps in workflows)
- Task (with priority and man-hour tracking)
- Department (for task assignment)
- FormTemplate (with version control)
- FormVersion (for template history)
- FormResponse (for user submissions)

Refer to `prisma/schema.prisma` for the complete schema definition.

## Authentication

The system uses NextAuth.js with the following features:
- JWT-based session handling
- Credentials provider for username/password login
- Role-based access control
- Protected API routes
- Secure session management
- Automatic token refresh

Default admin credentials:
- Username: admin
- Password: 1234

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Implementation Status

### Completed Features ✅
1. **Authentication**
   - NextAuth.js integration with JWT
   - Credentials provider implementation
   - Protected routes and API endpoints
   - Default admin user creation
   - Session management and validation
   - Automatic token refresh
   - User role management

2. **Project Types & Workflows**
   - Vehicle Wrap projects with VIN tracking
   - Sign projects with standard workflow
   - Mural projects with phased approach
   - Type-specific form fields and validation
   - Automatic workflow selection based on project type
   - Smart form field handling (conditional fields)

3. **Database & Schema**
   - PostgreSQL setup with Prisma
   - Complete schema implementation
   - Database migrations
   - Seeding system for:
     - Default admin user
     - Standard workflow templates
     - Project type configurations
   - Basic CRUD operations

4. **Form Components**
   - Project creation form with validation
   - Dynamic field rendering
   - Form state management
   - Error handling and feedback
   - Loading states
   - Date selection with validation
   - Responsive layout

### In Progress 🚧
1. **Project Management**
   - Project creation with workflow selection ✅
   - Project type validation ✅
   - Session handling in API routes ✅
   - Project listing view
   - Project details page
   - Progress tracking implementation
   - Project status management

2. **Task Management**
   - Task schema implementation ✅
   - Basic task creation ✅
   - Task assignment system
   - Task status updates
   - Task dependencies
   - Real-time updates

3. **Workflow Templates**
   - Basic workflow templates ✅
   - Phase definitions ✅
   - Task definitions ✅
   - Template customization
   - Workflow cloning
   - Template versioning

### Pending Features 📋
1. **Department Management**
   - Department schema ✅
   - Department creation interface
   - User-department assignment
   - Department-based views
   - Access control implementation
   - Department task management

2. **User Management**
   - User roles and permissions ✅
   - User profile management
   - Team management
   - Activity logging
   - User preferences
   - Password reset flow

3. **Reporting & Analytics**
   - Project progress reports
   - Time tracking
   - Resource utilization
   - Performance metrics
   - Export functionality
   - Dashboard implementation

4. **UI/UX Enhancements**
   - Responsive design improvements
   - Dark mode implementation
   - Accessibility enhancements
   - Performance optimizations
   - Loading skeletons
   - Error boundaries

5. **Integrations**
   - Calendar integration
   - File storage system
   - Notification system
   - Email integration
   - API documentation
   - Webhook support

### Known Issues 🐛
1. **Project Creation**
   - Form reset behavior needs refinement
   - Date validation edge cases
   - Error message clarity

2. **Authentication**
   - Session refresh mechanism
   - Token expiration handling
   - Error state recovery

3. **Performance**
   - Initial load time optimization needed
   - API response caching
   - Client-side state management

## Changelog

### [0.1.0] - 2024-01-15
#### Added
- Initial project setup with Next.js 13
- Authentication system with NextAuth.js
- Basic project creation functionality
- Workflow templates for different project types
- Database schema and migrations
- Seeding script for initial data

#### Changed
- Updated project structure for better organization
- Enhanced form validation with Zod
- Improved workflow selection UX
- Better error handling in API routes

#### Fixed
- Session handling in project creation
- Workflow selection validation
- Form reset behavior
- Date handling in project form

### [0.0.1] - 2024-01-14
#### Added
- Project initialization
- Basic Next.js setup
- Initial database schema
- Authentication foundation

## Roadmap

### Short-term Goals (Next 2 Weeks)
1. Complete project management features
2. Implement task management system
3. Add basic reporting functionality
4. Enhance user interface and experience

### Medium-term Goals (Next 2 Months)
1. Department management system
2. Advanced form features
3. File management integration
4. Enhanced reporting and analytics

### Long-term Goals (6+ Months)
1. Mobile application
2. API for third-party integrations
3. Advanced analytics and ML features
4. White-label solution
