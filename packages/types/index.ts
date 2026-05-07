// ─── User ───────────────────────────────────────────────
export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  createdAt: string
}

// ─── Message ────────────────────────────────────────────
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: MessageStatus
  readAt: string | null
  createdAt: string
  sender: Pick<User, 'id' | 'username' | 'avatarUrl'>
}

// ─── Conversation ────────────────────────────────────────
export interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message | null
  unreadCount: number
  updatedAt: string
}

// ─── Socket events ───────────────────────────────────────
export interface ServerToClientEvents {
  'message:new': (message: Message) => void
  'message:status': (payload: { messageId: string; status: MessageStatus }) => void
  'message:read': (payload: { conversationId: string; readerId: string }) => void
  'user:online': (userId: string) => void
  'user:offline': (userId: string) => void
  'typing:start': (payload: { conversationId: string; userId: string; username: string }) => void
  'typing:stop': (payload: { conversationId: string; userId: string }) => void
}

export interface ClientToServerEvents {
  'message:send': (payload: { conversationId: string; content: string }) => void
  'message:delivered': (messageId: string) => void
  'message:read': (payload: { conversationId: string }) => void
  'conversation:join': (conversationId: string) => void
  'conversation:leave': (conversationId: string) => void
  'typing:start': (payload: { conversationId: string }) => void
  'typing:stop': (payload: { conversationId: string }) => void
}