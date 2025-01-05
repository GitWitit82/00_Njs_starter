# Workflow PMS

A modern workflow and project management system built with Next.js 13, featuring role-based access control, task management, department organization, and a powerful form builder system.

## Features

- 🔐 Authentication with NextAuth.js
- 👥 Role-based access control (Admin, Manager, User)
- 📋 Workflow management with phases and tasks
- 🎨 Department management with color coding
- 🔄 Drag and drop task reordering
- 📊 Task prioritization and time estimation
- 🎯 Progress tracking and status updates
- 🎨 Dynamic form builder system
- 🎨 Modern UI with Tailwind CSS and Shadcn UI

## Form Builder System

Our form builder system provides a flexible way to create and manage forms within your workflows:

- **Multiple Form Types**
  - Checklists for quality control and verification
  - Standard forms for data collection
  - Custom dynamic forms for complex scenarios

- **Smart Features**
  - Department-specific styling and branding
  - Auto-population of project details
  - Conditional fields and validation
  - Custom layouts and sections
  - Form response tracking and approvals

- **Integration with Workflows**
  - Forms linked to specific phases
  - Automatic task association
  - Progress tracking through form submissions
  - Department-specific form templates

For detailed documentation on the form builder, see [Form Builder Documentation](docs/form-builder.md).

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
│   │   ├── api/         # API routes
│   │   └── forms/       # Form builder pages
│   ├── components/       # React components
│   │   └── forms/       # Form builder components
│   ├── lib/             # Utility functions and configurations
│   └── styles/          # Global styles
├── prisma/              # Database schema and migrations
├── docs/               # Documentation
└── public/             # Static assets
```

## Recent Updates

- Added Form Builder System
  - Dynamic form template creation
  - Department-specific form styling
  - Form response tracking
  - Integration with workflow phases
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

## API Documentation

### Form Builder API

The form builder system provides RESTful endpoints for managing form templates and responses:

- **Form Templates**
  - GET `/api/forms/templates` - List all templates
  - POST `/api/forms/templates` - Create new template
  - GET `/api/forms/templates/:id` - Get template details
  - PUT `/api/forms/templates/:id` - Update template
  - DELETE `/api/forms/templates/:id` - Delete template

- **Form Responses**
  - GET `/api/forms/responses` - List form responses
  - POST `/api/forms/responses` - Submit form response
  - PUT `/api/forms/responses/:id` - Update response
  - GET `/api/forms/responses/:id` - Get response details

For detailed API documentation and examples, see [Form Builder Documentation](docs/form-builder.md).

## License

MIT License - feel free to use this project for your own purposes.
