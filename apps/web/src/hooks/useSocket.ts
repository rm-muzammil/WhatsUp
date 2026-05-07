'use client'

import { useEffect } from 'react'
import { connectSocket, getSocket } from '@/lib/socket'
import { useMessagesStore } from '@/store/messages'
import { useConversationsStore } from '@/store/conversations'
import { useTypingStore } from '@/store/typing'

export function useSocket() {
  const addMessage = useMessagesStore((s) => s.addMessage)
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus)
  const markConversationRead = useMessagesStore((s) => s.markConversationRead)
  const updateLastMessage = useConversationsStore((s) => s.updateLastMessage)
  const setTyping = useTypingStore((s) => s.setTyping)
  const clearTyping = useTypingStore((s) => s.clearTyping)

  useEffect(() => {
    if (typeof window === 'undefined') return

    connectSocket()
    const socket = getSocket()

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

            // If this conversation is active, mark as read immediately
            const activeId = useConversationsStore.getState().activeConversationId
            if (activeId === message.conversationId) {
              socket.emit('message:read', { conversationId: message.conversationId })
            }
          }
        }
      } catch {}
    })

    socket.on('message:status', ({ messageId, status }) => {
      useConversationsStore.getState().conversations.forEach((c) => {
        updateMessageStatus(c.id, messageId, status)
      })
    })

    socket.on('message:read', ({ conversationId }) => {
      markConversationRead(conversationId)
    })

    socket.on('typing:start', ({ conversationId, userId, username }) => {
      setTyping(conversationId, userId, username)
    })

    socket.on('typing:stop', ({ conversationId, userId }) => {
      clearTyping(conversationId, userId)
    })

    return () => {
      socket.off('message:new')
      socket.off('message:status')
      socket.off('message:read')
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [])

  // Join new conversations
  const conversations = useConversationsStore((s) => s.conversations)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const socket = getSocket()
    if (socket.connected && conversations.length > 0) {
      conversations.forEach((c) => socket.emit('conversation:join', c.id))
    }
  }, [conversations.length])
}