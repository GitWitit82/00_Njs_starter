# Contributing Guidelines

This document provides guidelines for contributing to the project and avoiding common errors.

## Common Errors and How to Avoid Them

### 1. TypeScript Type Safety

#### Common Issues:
- Using `any` type
- Missing type definitions for props
- Incorrect type assertions
- Not handling null/undefined cases

#### Best Practices:
```typescript
// ❌ Bad
const Component = (props: any) => {
  const data = props.data;
  return <div>{data.title}</div>
}

// ✅ Good
interface ComponentProps {
  data: {
    title: string;
  };
}

const Component = ({ data }: ComponentProps) => {
  return <div>{data.title}</div>
}
```

### 2. React Components

#### Common Issues:
- Missing "use client" directive in client components
- Improper state management
- Memory leaks in useEffect
- Not handling loading/error states

#### Best Practices:
```typescript
"use client";

import { useState, useEffect } from "react";

interface Props {
  id: string;
}

const Component = ({ id }: Props) => {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/data/${id}`, {
          signal: controller.signal
        });
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error) setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{/* Render data */}</div>;
};
```

### 3. Next.js API Routes

#### Common Issues:
- Not using proper types for request/response
- Missing error handling
- Not validating request body
- Improper HTTP status codes

#### Best Practices:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);

    const result = await db.create(validated);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 4. Authentication and Authorization

#### Common Issues:
- Not checking session status
- Missing role validation
- Improper error handling for unauthorized access
- Not protecting API routes

#### Best Practices:
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  // Handle authorized request
}
```

### 5. Database Operations

#### Common Issues:
- Not handling database errors
- Missing transaction management
- Improper connection handling
- Not validating input data

#### Best Practices:
```typescript
import { prisma } from "@/lib/prisma";

async function createUser(data: CreateUserInput) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...data,
          profile: {
            create: data.profile
          }
        }
      });

      await tx.audit.create({
        data: {
          action: "CREATE_USER",
          userId: user.id
        }
      });

      return user;
    });

    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw new Error("User already exists");
      }
    }
    throw error;
  }
}
```

### 6. Component Props and State

#### Common Issues:
- Prop drilling
- Unnecessary state updates
- Not memoizing expensive calculations
- Improper state initialization

#### Best Practices:
```typescript
import { useMemo, useState } from "react";

interface Props {
  items: Item[];
  onSelect: (item: Item) => void;
}

const ItemList = ({ items, onSelect }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortedItems = useMemo(() => 
    [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const handleSelect = (item: Item) => {
    setSelectedId(item.id);
    onSelect(item);
  };

  return (
    <ul>
      {sortedItems.map(item => (
        <li
          key={item.id}
          className={item.id === selectedId ? "selected" : ""}
          onClick={() => handleSelect(item)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

## Pre-commit Checklist

Before committing changes:

1. **Type Safety**
   - [ ] No `any` types used
   - [ ] Props properly typed
   - [ ] Return types specified
   - [ ] Null/undefined cases handled

2. **Components**
   - [ ] "use client" directive added if needed
   - [ ] Props documented with JSDoc
   - [ ] Loading/error states handled
   - [ ] Memory leaks prevented

3. **API Routes**
   - [ ] Request/response properly typed
   - [ ] Error handling implemented
   - [ ] Input validation added
   - [ ] Proper HTTP status codes used

4. **Authentication**
   - [ ] Session checks implemented
   - [ ] Role validation added
   - [ ] Error handling for unauthorized access
   - [ ] API routes protected

5. **Database**
   - [ ] Transactions used where needed
   - [ ] Error handling implemented
   - [ ] Input validation added
   - [ ] Proper error messages set

6. **Testing**
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Edge cases covered
   - [ ] Error scenarios tested

## Common Build Errors

### 1. Type Errors
- **Error**: "Type '...' is not assignable to type '...'"
- **Solution**: Check type definitions and ensure proper type usage

### 2. Module Resolution
- **Error**: "Cannot find module '...' or its corresponding type declarations"
- **Solution**: Check import paths and ensure dependencies are installed

### 3. React Errors
- **Error**: "React Hook useEffect has missing dependencies"
- **Solution**: Add missing dependencies or use proper dependency arrays

### 4. Next.js Errors
- **Error**: "The requested module '...' does not provide an export named '...'"
- **Solution**: Check import statements and ensure proper exports

## Getting Help

If you encounter issues:

1. Check the documentation
2. Search existing issues
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Expected behavior
   - Actual behavior 