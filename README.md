# Workflow PMS

A modern workflow and project management system built with Next.js 13, TypeScript, and Prisma.

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **API**: REST with Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

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

4. Update `.env` with your database and authentication credentials.

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

## Development Guidelines

### Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form-related components
│   └── auth/             # Authentication components
├── lib/                  # Utility functions and configurations
│   ├── prisma.ts        # Prisma client
│   └── auth.ts          # NextAuth configuration
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Follow the contributing guidelines in CONTRIBUTING.md

### Component Guidelines

1. **Client Components**
   - Add "use client" directive
   - Define prop types with interfaces
   - Use proper error boundaries

2. **Server Components**
   - Avoid useState and useEffect
   - Handle data fetching at the component level
   - Use proper error handling

### API Guidelines

1. **Route Handlers**
   - Use proper types for request/response
   - Implement error handling
   - Follow RESTful conventions

2. **Authentication**
   - Check session status
   - Validate user roles
   - Handle unauthorized access

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run start
```

## Common Issues

See CONTRIBUTING.md for common issues and solutions.

## License

MIT License - see LICENSE for details
