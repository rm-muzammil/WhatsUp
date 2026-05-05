'use client'

import { Conversation } from '@whatsapp-clone/types'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { Check, CheckCheck } from 'lucide-react'

interface Props {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { weekday: 'short' })
}

function Avatar({ name, size = 10 }: { name: string; size?: number }) {
  const colors = [
    'bg-[#d9845a]', 'bg-[#a29cc4]', 'bg-[#7bc4c4]',
    'bg-[#c4a07b]', 'bg-[#84a9d9]', 'bg-[#a9c484]',
  ]

  const safeName = name || '?'
  const color = colors[safeName.charCodeAt(0) % colors.length]

  return (
    <div
      className={cn(
        `w-${size} h-${size} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`,
        color
      )}
    >
      {safeName[0].toUpperCase()}
    </div>
  )
}

export { Avatar }

export default function ConversationItem({ conversation, isActive, onClick }: Props) {
  const currentUser = useAuthStore((s) => s.user)

  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUser?.id
  )

  const lastMsg = conversation.lastMessage
  const isMyMessage = lastMsg?.sender.id === currentUser?.id

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors',
        isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
      )}
    >
      <Avatar name={otherParticipant?.username ?? '?'} size={12} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className="text-white text-sm font-medium truncate">
            {otherParticipant?.username ?? 'Unknown'}
          </span>
          {lastMsg && (
            <span className="text-[#667781] text-xs ml-2 flex-shrink-0">
              {formatTime(lastMsg.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-0.5">
          {isMyMessage && (
            lastMsg?.status === 'READ' ? (
              <CheckCheck size={14} className="text-[#53bdeb] flex-shrink-0" />
            ) : lastMsg?.status === 'DELIVERED' ? (
              <CheckCheck size={14} className="text-[#667781] flex-shrink-0" />
            ) : (
              <Check size={14} className="text-[#667781] flex-shrink-0" />
            )
          )}
          <span className="text-[#8696a0] text-xs truncate">
            {lastMsg?.content ?? 'No messages yet'}
          </span>
        </div>
      </div>
    </div>
  )
}