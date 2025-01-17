import { toast } from "sonner"

export type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type ToastActionElement = React.ReactElement<{
  altText: string
  onClick: () => void
}>

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, action, variant } = props
      toast[variant === "destructive" ? "error" : "success"](title, {
        description,
        action,
      })
    },
  }
} 