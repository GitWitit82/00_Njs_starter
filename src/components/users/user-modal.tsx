"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Role } from "@prisma/client"
import { useState, useEffect } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const createUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(4, {
    message: "Password must be at least 4 characters.",
  }),
  role: z.nativeEnum(Role),
})

const updateUserSchema = createUserSchema.extend({
  password: z.string().min(4).optional(),
})

type UserFormValues = z.infer<typeof createUserSchema>

interface UserModalProps {
  mode: "create" | "edit" | "delete"
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: {
    id: string
    name: string
    email: string
    role: Role
  }
  onSubmit: (values: UserFormValues) => Promise<void>
  onDelete?: () => Promise<void>
}

export function UserModal({
  mode,
  open,
  onOpenChange,
  user,
  onSubmit,
  onDelete,
}: UserModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(mode === "create" ? createUserSchema : updateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: Role.USER,
    },
  })

  // Reset form with user data when editing
  useEffect(() => {
    if (mode === "edit" && user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      })
    } else if (mode === "create") {
      form.reset({
        name: "",
        email: "",
        password: "",
        role: Role.USER,
      })
    }
  }, [mode, user, form])

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setIsLoading(true)
      // If editing and no password provided, remove it from values
      if (mode === "edit" && !values.password) {
        const { password, ...dataWithoutPassword } = values
        await onSubmit(dataWithoutPassword as UserFormValues)
      } else {
        await onSubmit(values)
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    try {
      setIsLoading(true)
      await onDelete()
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create User"
              : mode === "edit"
              ? "Edit User"
              : "Delete User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "delete"
              ? `Are you sure you want to delete ${user?.name}?`
              : "Enter the user details below."}
          </DialogDescription>
        </DialogHeader>

        {mode === "delete" ? (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password {mode === "edit" && "(leave blank to keep current)"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="password" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Role).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                    ? "Create"
                    : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 