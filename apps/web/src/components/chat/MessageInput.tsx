'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSend: (content: string) => void
  disabled?: boolean
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#202c33]">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        rows={1}
        disabled={disabled}
        className={cn(
          'flex-1 bg-[#2a3942] text-white placeholder-[#667781]',
          'rounded-lg px-4 py-2.5 text-sm outline-none resize-none',
          'max-h-32 overflow-y-auto leading-relaxed',
          'disabled:opacity-50'
        )}
        style={{ height: 'auto' }}
        onInput={(e) => {
          const el = e.currentTarget
          el.style.height = 'auto'
          el.style.height = Math.min(el.scrollHeight, 128) + 'px'
        }}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          'transition-colors duration-200',
          value.trim()
            ? 'bg-[#00a884] hover:bg-[#06cf9c] text-white'
            : 'bg-[#2a3942] text-[#667781]'
        )}
      >
        <Send size={18} />
      </button>
    </div>
  )
}