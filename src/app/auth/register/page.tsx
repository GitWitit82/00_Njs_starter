"use client"

import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"

/**
 * Registration page component
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login">
              <Button variant="link" className="p-0 h-auto font-semibold">
                Sign in
              </Button>
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
} 