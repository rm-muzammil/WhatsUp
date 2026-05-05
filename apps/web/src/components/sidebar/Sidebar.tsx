'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useConversationsStore } from '@/store/conversations'
import { disconnectSocket } from '@/lib/socket'
import api from '@/lib/axios'
import { LogOut, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ConversationItem, { Avatar } from './ConversationItem'
import SearchUsers from './SearchUsers'
import { Conversation } from '@whatsapp-clone/types'

export default function Sidebar() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversation,
    addOrUpdateConversation,
  } = useConversationsStore()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations')
        setConversations(res.data.conversations)
      } catch {}
    }
    fetchConversations()
  }, [])

  const handleLogout = () => {
    disconnectSocket()
    clearAuth()
    router.replace('/login')
  }

  const handleConversationCreated = async (conversationId: string) => {
    try {
      const res = await api.get('/conversations')
      setConversations(res.data.conversations)
      setActiveConversation(conversationId)
    } catch {}
  }

  return (
    <div className="w-[380px] flex-shrink-0 border-r border-[#2a3942] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#202c33]">
        <div className="flex items-center gap-3">
          {user && <Avatar name={user.username} size={10} />}
          <span className="text-white text-sm font-medium">{user?.username}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#aebac1] hover:text-white transition-colors p-1.5 rounded-full hover:bg-[#2a3942]"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="pt-3 pb-1">
        <SearchUsers onConversationCreated={handleConversationCreated} />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <MessageSquare size={40} className="text-[#667781]" />
            <p className="text-[#667781] text-sm">
              No conversations yet. Search for a user to start chatting.
            </p>
          </div>
        ) : (
          conversations.map((conv: Conversation) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onClick={() => setActiveConversation(conv.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
