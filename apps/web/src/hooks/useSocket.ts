'use client'

import { useEffect } from 'react'
import { connectSocket, getSocket } from '@/lib/socket'
import { useMessagesStore } from '@/store/messages'
import { useConversationsStore } from '@/store/conversations'
import { useTypingStore } from '@/store/typing'
import { useAuthStore } from '@/store/auth'

export function useSocket() {
  const addMessage = useMessagesStore((s) => s.addMessage)
  const updateMessageStatus = useMessagesStore((s) => s.updateMessageStatus)
  const markConversationRead = useMessagesStore((s) => s.markConversationRead)
  const updateLastMessage = useConversationsStore((s) => s.updateLastMessage)
  const setTyping = useTypingStore((s) => s.setTyping)
  const clearTyping = useTypingStore((s) => s.clearTyping)
  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => {
    if (typeof window === 'undefined') return

    connectSocket()
    const socket = getSocket()

    socket.on('message:new', (message) => {
      addMessage(message.conversationId, message)
      updateLastMessage(message.conversationId, message)

      if (currentUser && message.sender.id !== currentUser.id) {
        socket.emit('message:delivered', message.id)

        const activeId = useConversationsStore.getState().activeConversationId
        if (activeId === message.conversationId) {
          socket.emit('message:read', { conversationId: message.conversationId })
        }
      }
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
      console.log('typing:start received', { conversationId, userId, username })
      setTyping(conversationId, userId, username)
    })

    socket.on('typing:stop', ({ conversationId, userId }) => {
      console.log('typing:stop received', { conversationId, userId })
      clearTyping(conversationId, userId)
    })

    return () => {
      socket.off('message:new')
      socket.off('message:status')
      socket.off('message:read')
      socket.off('typing:start')
      socket.off('typing:stop')
    }
  }, [currentUser])

  const conversations = useConversationsStore((s) => s.conversations)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const socket = getSocket()
    if (socket.connected && conversations.length > 0) {
      conversations.forEach((c) => socket.emit('conversation:join', c.id))
    }
  }, [conversations.length])
}