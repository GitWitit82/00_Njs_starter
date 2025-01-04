"use client"

import { useState } from "react"
import { Role } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Edit, Trash } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserModal } from "@/components/users/user-modal"

interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  onUserChange: () => void
}

export function UsersTable({ users, onUserChange }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete">("create")
  const [modalOpen, setModalOpen] = useState(false)

  const handleCreateUser = async (values: any) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    onUserChange()
  }

  const handleUpdateUser = async (values: any) => {
    if (!selectedUser) return

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    onUserChange()
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const response = await fetch(`/api/users/${selectedUser.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    onUserChange()
  }

  const openModal = (mode: "create" | "edit" | "delete", user?: User) => {
    setModalMode(mode)
    setSelectedUser(user)
    setModalOpen(true)
  }

  return (
    <div>
      <div className="mb-4">
        <Button onClick={() => openModal("create")}>Create User</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal("edit", user)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openModal("delete", user)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserModal
        mode={modalMode}
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
        onSubmit={modalMode === "create" ? handleCreateUser : handleUpdateUser}
        onDelete={handleDeleteUser}
      />
    </div>
  )
} 