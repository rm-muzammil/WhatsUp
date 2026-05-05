'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function useRequireAuth() {
  const router = useRouter()
  const { isAuthenticated, user, token } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace('/login')
    }
  }, [isAuthenticated, token, router])

  return { user, token, isAuthenticated }
}