'use client'

import { useEffect } from 'react'
import { connectSocket, getSocket } from '@/lib/socket'
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

    const joinRooms = () => {
      const currentConvs = useConversationsStore.getState().conversations
      currentConvs.forEach((c) => socket.emit('conversation:join', c.id))
      console.log(`🔌 Joined ${currentConvs.length} rooms`)
    }

    // Join rooms immediately if already connected
    if (socket.connected) {
      joinRooms()
    }

    // Join rooms when socket connects (or reconnects)
    socket.on('connect', joinRooms)

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
      useConversationsStore.getState().conversations.forEach((c) => {
        updateMessageStatus(c.id, messageId, status)
      })
    })

    return () => {
      socket.off('connect', joinRooms)
      socket.off('message:new')
      socket.off('message:status')
    }
  }, [])

  // Also join when new conversations are added
  useEffect(() => {
    if (typeof window === 'undefined') return
    const socket = getSocket()
    if (socket.connected) {
      conversations.forEach((c) => socket.emit('conversation:join', c.id))
    }
  }, [conversations.length])
}