'use client'

import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import { User } from '@whatsapp-clone/types'
import { Avatar } from './ConversationItem'

interface Props {
  onConversationCreated: (conversationId: string) => void
}

export default function SearchUsers({ onConversationCreated }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)

  const search = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await api.get(`/users/search?q=${q}`)
      setResults(res.data.users)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const startConversation = async (userId: string) => {
    setCreating(userId)
    try {
      const res = await api.post('/conversations', { participantId: userId })
      onConversationCreated(res.data.conversation.id)
      setQuery('')
      setResults([])
    } catch {
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center bg-[#202c33] rounded-lg mx-3 mb-2 px-3 py-2 gap-2">
        <Search size={16} className="text-[#667781]" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search or start new chat"
          className="bg-transparent text-white text-sm flex-1 outline-none placeholder-[#667781]"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }}>
            <X size={16} className="text-[#667781]" />
          </button>
        )}
        {loading && <Loader2 size={14} className="text-[#667781] animate-spin" />}
      </div>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 z-10 bg-[#1f2c34] border border-[#2a3942] rounded-lg mx-3 shadow-xl overflow-hidden">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => startConversation(user.id)}
              disabled={creating === user.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] transition-colors"
            >
              <Avatar name={user.username} size={9} />
              <div className="text-left">
                <p className="text-white text-sm">{user.username}</p>
                <p className="text-[#667781] text-xs">{user.email}</p>
              </div>
              {creating === user.id && (
                <Loader2 size={14} className="ml-auto text-[#00a884] animate-spin" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}