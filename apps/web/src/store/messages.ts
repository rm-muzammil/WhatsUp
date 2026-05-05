import { create } from 'zustand'
import { Message, MessageStatus } from '@whatsapp-clone/types'

interface MessagesState {
  messagesByConversation: Record<string, Message[]>
  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessageStatus: (
    conversationId: string,
    messageId: string,
    status: MessageStatus
  ) => void
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messagesByConversation: {},

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messagesByConversation[conversationId] ?? []
      const alreadyExists = existing.some((m) => m.id === message.id)
      if (alreadyExists) return state
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [...existing, message],
        },
      }
    }),

  updateMessageStatus: (conversationId, messageId, status) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (
          state.messagesByConversation[conversationId] ?? []
        ).map((m) => (m.id === messageId ? { ...m, status } : m)),
      },
    })),
}))