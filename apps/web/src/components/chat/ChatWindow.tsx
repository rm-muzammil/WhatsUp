'use client'

import { useEffect, useRef } from 'react'
import { useConversationsStore } from '@/store/conversations'
import { useMessagesStore } from '@/store/messages'
import { useAuthStore } from '@/store/auth'
import { useTypingStore } from '@/store/typing'
import { getSocket } from '@/lib/socket'
import api from '@/lib/axios'
import { Avatar } from '../sidebar/ConversationItem'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import { MessageSquare } from 'lucide-react'

export default function ChatWindow() {
  const currentUser = useAuthStore((s) => s.user)
  const { activeConversationId, conversations } = useConversationsStore()
  const { messagesByConversation, setMessages } = useMessagesStore()
  const typingByConversation = useTypingStore((s) => s.typingByConversation)

  const bottomRef = useRef<HTMLDivElement>(null)

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  )

  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== currentUser?.id
  )

  const messages = activeConversationId
    ? messagesByConversation[activeConversationId] ?? []
    : []

  const typingUsers = activeConversationId
    ? Object.values(typingByConversation[activeConversationId] ?? {})
    : []

  // Fetch messages + mark as read when conversation changes
  useEffect(() => {
    if (!activeConversationId) return

    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/conversations/${activeConversationId}/messages`
        )
        setMessages(activeConversationId, res.data.messages)
      } catch {}
    }

    fetchMessages()

    const socket = getSocket()
    socket.emit('conversation:join', activeConversationId)

    // Mark conversation as read when opened
    socket.emit('message:read', { conversationId: activeConversationId })
  }, [activeConversationId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (content: string) => {
    if (!activeConversationId) return
    const socket = getSocket()
    socket.emit('message:send', {
      conversationId: activeConversationId,
      content,
    })
  }

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#222e35] gap-4">
        <div className="w-20 h-20 rounded-full bg-[#2a3942] flex items-center justify-center">
          <MessageSquare size={36} className="text-[#667781]" />
        </div>
        <div className="text-center">
          <h2 className="text-[#e9edef] text-xl font-light">WhatsUp</h2>
          <p className="text-[#667781] text-sm mt-1">
            Select a conversation or search for a user to start chatting
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33] flex-shrink-0">
        <Avatar name={otherParticipant?.username ?? '?'} size={10} />
        <div>
          <p className="text-white text-sm font-medium">
            {otherParticipant?.username ?? 'Unknown'}
          </p>
          {typingUsers.length > 0 ? (
            <p className="text-[#00a884] text-xs">typing...</p>
          ) : (
            <p className="text-[#667781] text-xs">online</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.8'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#667781] text-sm bg-[#182229] px-4 py-2 rounded-lg">
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator names={typingUsers} />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        conversationId={activeConversationId}
      />
    </div>
  )
}