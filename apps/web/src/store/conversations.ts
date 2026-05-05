import { create } from 'zustand'
import { Conversation, Message } from '@whatsapp-clone/types'

interface ConversationsState {
  conversations: Conversation[]
  activeConversationId: string | null
  setConversations: (convs: Conversation[]) => void
  setActiveConversation: (id: string) => void
  addOrUpdateConversation: (conv: Conversation) => void
  updateLastMessage: (conversationId: string, message: Message) => void
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  conversations: [],
  activeConversationId: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addOrUpdateConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conv.id)
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c.id === conv.id ? conv : c
          ),
        }
      }
      return { conversations: [conv, ...state.conversations] }
    }),

  updateLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: message, updatedAt: message.createdAt }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    })),
}))