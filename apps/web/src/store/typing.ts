import { create } from 'zustand'

interface TypingState {
  // conversationId → Set of usernames currently typing
  typingByConversation: Record<string, Record<string, string>>
  setTyping: (conversationId: string, userId: string, username: string) => void
  clearTyping: (conversationId: string, userId: string) => void
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByConversation: {},

  setTyping: (conversationId, userId, username) =>
    set((state) => ({
      typingByConversation: {
        ...state.typingByConversation,
        [conversationId]: {
          ...(state.typingByConversation[conversationId] ?? {}),
          [userId]: username,
        },
      },
    })),

  clearTyping: (conversationId, userId) =>
    set((state) => {
      const current = { ...(state.typingByConversation[conversationId] ?? {}) }
      delete current[userId]
      return {
        typingByConversation: {
          ...state.typingByConversation,
          [conversationId]: current,
        },
      }
    }),
}))