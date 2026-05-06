'use client'

export const dynamic = 'force-dynamic'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useSocket } from '@/hooks/useSocket'
import Sidebar from '@/components/sidebar/Sidebar'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ChatPage() {
  const { isAuthenticated } = useRequireAuth()
  useSocket()

  if (!isAuthenticated) return null

  return (
    <>
      <Sidebar />
      <ChatWindow />
    </>
  )
}