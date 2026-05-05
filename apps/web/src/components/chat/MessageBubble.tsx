'use client'

import { Message } from '@whatsapp-clone/types'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import { Check, CheckCheck } from 'lucide-react'

interface Props {
  message: Message
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessageBubble({ message }: Props) {
  const currentUser = useAuthStore((s) => s.user)
  const isMe = message.sender.id === currentUser?.id

  return (
    <div className={cn('flex mb-1', isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[65%] rounded-lg px-3 py-2 shadow-sm',
          isMe ? 'bg-[#005c4b]' : 'bg-[#202c33]'
        )}
      >
        <p className="text-white text-sm leading-relaxed break-words">
          {message.content}
        </p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-[#667781]">
            {formatTime(message.createdAt)}
          </span>
          {isMe && (
            message.status === 'READ' ? (
              <CheckCheck size={14} className="text-[#53bdeb]" />
            ) : message.status === 'DELIVERED' ? (
              <CheckCheck size={14} className="text-[#667781]" />
            ) : (
              <Check size={14} className="text-[#667781]" />
            )
          )}
        </div>
      </div>
    </div>
  )
}