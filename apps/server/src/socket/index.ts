import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents } from '../types'
import { verifyToken } from '../lib/jwt'
import prisma from '../lib/prisma'

const onlineUsers = new Map<string, string>()

// Track typing timeouts per user per conversation
const typingTimeouts = new Map<string, NodeJS.Timeout>()

export function initSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>
): void {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    if (!token) { next(new Error('No token provided')); return }
    try {
      const payload = verifyToken(token)
      socket.data.userId = payload.userId
      socket.data.username = payload.username
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const userId = socket.data.userId as string
    const username = socket.data.username as string

    onlineUsers.set(userId, socket.id)
    io.emit('user:online', userId)

    console.log(`✅ ${username} connected (${socket.id})`)

    // Auto-join all conversation rooms
    try {
      const participations = await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true },
      })
      participations.forEach(({ conversationId }) => {
        socket.join(conversationId)
      })
      console.log(`📦 ${username} joined ${participations.length} rooms`)
    } catch (err) {
      console.error('Error auto-joining rooms:', err)
    }

    // ── Join / leave ─────────────────────────────────────
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId)
    })

    // ── Send message ─────────────────────────────────────
    socket.on('message:send', async ({ conversationId, content }) => {
      try {
        const participant = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId } },
        })
        if (!participant) return

        const message = await prisma.message.create({
          data: { conversationId, senderId: userId, content },
          include: {
            sender: { select: { id: true, username: true, avatarUrl: true } },
          },
        })

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })

        socket.join(conversationId)

        io.to(conversationId).emit('message:new', {
          ...message,
          readAt: null,
          createdAt: message.createdAt.toISOString(),
          sender: {
            ...message.sender,
            // createdAt: new Date().toISOString(),
          },
        })
      } catch (err) {
        console.error('message:send error', err)
      }
    })

    // ── Message delivered ────────────────────────────────
    socket.on('message:delivered', async (messageId) => {
      try {
        const message = await prisma.message.findUnique({
          where: { id: messageId },
        })
        if (!message || message.status !== 'SENT') return

        await prisma.message.update({
          where: { id: messageId },
          data: { status: 'DELIVERED' },
        })

        io.to(message.conversationId).emit('message:status', {
          messageId,
          status: 'DELIVERED',
        })
      } catch (err) {
        console.error('message:delivered error', err)
      }
    })

    // ── Mark conversation as read ────────────────────────
    socket.on('message:read', async ({ conversationId }) => {
      try {
        // Mark all unread messages in this conversation as READ
        await prisma.message.updateMany({
          where: {
            conversationId,
            status: { not: 'READ' },
            senderId: { not: userId }, // only mark others' messages
          },
          data: {
            status: 'READ',
            readAt: new Date(),
          },
        })

        // Notify everyone in the room
        io.to(conversationId).emit('message:read', {
          conversationId,
          readerId: userId,
        })
      } catch (err) {
        console.error('message:read error', err)
      }
    })

    // ── Typing indicators ────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      // Broadcast to others in room (not sender)
      socket.to(conversationId).emit('typing:start', {
        conversationId,
        userId,
        username,
      })

      // Auto-stop typing after 3 seconds of no activity
      const key = `${userId}:${conversationId}`
      const existing = typingTimeouts.get(key)
      if (existing) clearTimeout(existing)

      const timeout = setTimeout(() => {
        socket.to(conversationId).emit('typing:stop', {
          conversationId,
          userId,
        })
        typingTimeouts.delete(key)
      }, 3000)

      typingTimeouts.set(key, timeout)
    })

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop', {
        conversationId,
        userId,
      })

      const key = `${userId}:${conversationId}`
      const existing = typingTimeouts.get(key)
      if (existing) {
        clearTimeout(existing)
        typingTimeouts.delete(key)
      }
    })

    // ── Disconnect ───────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('user:offline', userId)

      // Clean up typing timeouts
      typingTimeouts.forEach((timeout, key) => {
        if (key.startsWith(userId)) {
          clearTimeout(timeout)
          typingTimeouts.delete(key)
        }
      })

      console.log(`❌ ${username} disconnected`)
    })
  })
}

export { onlineUsers }