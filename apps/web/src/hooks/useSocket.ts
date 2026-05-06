'use client'

import { useEffect } from 'react'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { useMessagesStore } from '@/store/messages'
import { useConversationsStore } from '@/store/conversations'

export function useSocket() {
  const addMessage = useMessagesStore((s) => s.addMessage)
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus)
  const updateLastMessage = useConversationsStore((s) => s.updateLastMessage)
  const conversations = useConversationsStore((s) => s.conversations)

  useEffect(() => {
    if (typeof window === 'undefined') return

    connectSocket()
    const socket = getSocket()

    conversations.forEach((c) => socket.emit('conversation:join', c.id))

    socket.on('message:new', (message) => {
      addMessage(message.conversationId, message)
      updateLastMessage(message.conversationId, message)

      try {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          const parsed = JSON.parse(stored)
          const userId = parsed?.state?.user?.id
          if (userId && message.sender.id !== userId) {
            socket.emit('message:delivered', message.id)
          }
        }
      } catch {}
    })

    socket.on('message:status', ({ messageId, status }) => {
      conversations.forEach((c) => {
        updateMessageStatus(c.id, messageId, status)
      })
    })

    return () => {
      socket.off('message:new')
      socket.off('message:status')
    }
  }, [conversations.length])
}