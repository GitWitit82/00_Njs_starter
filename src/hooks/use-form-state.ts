'use client'

import { useState } from 'react'

interface FormState<T> {
  data: T
  errors: Record<string, string[]>
  isPending: boolean
}

/**
 * Custom hook for managing form state
 * @param initialData Initial form data
 * @returns Form state and actions
 */
export function useFormState<T extends Record<string, unknown>>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isPending: false,
  })

  const setData = (data: T) => {
    setState((prev) => ({ ...prev, data }))
  }

  const setErrors = (errors: Record<string, string[]>) => {
    setState((prev) => ({ ...prev, errors }))
  }

  const setPending = (isPending: boolean) => {
    setState((prev) => ({ ...prev, isPending }))
  }

  const reset = () => {
    setState({
      data: initialData,
      errors: {},
      isPending: false,
    })
  }

  return {
    ...state,
    setData,
    setErrors,
    setPending,
    reset,
  }
} 