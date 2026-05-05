import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents } from '@whatsapp-clone/types'
import { verifyToken } from '../lib/jwt'
import prisma from '../lib/prisma'

// Track online users: userId → socketId
const onlineUsers = new Map<string, string>()

export function initSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents>
): void {

  // ─── Auth middleware ──────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined

    if (!token) {
      next(new Error('No token provided'))
      return
    }

    try {
      const payload = verifyToken(token)
      socket.data.userId = payload.userId
      socket.data.username = payload.username
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  // ─── Connection ───────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.data.userId as string

    // Mark user as online
    onlineUsers.set(userId, socket.id)
    io.emit('user:online', userId)

    console.log(`✅ ${socket.data.username} connected (${socket.id})`)

    // ─── Join conversation rooms ────────────────────────
    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId)
    })

    // ─── Send message ───────────────────────────────────
    socket.on('message:send', async ({ conversationId, content }) => {
      try {
        // Verify sender is a participant
        const participant = await prisma.conversationParticipant.findUnique({
          where: {
            conversationId_userId: { conversationId, userId },
          },
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

        // Broadcast to everyone in the room (including sender)
        io.to(conversationId).emit('message:new', {
          ...message,
          createdAt: message.createdAt.toISOString(),
          sender: {
            ...message.sender,
            createdAt: new Date().toISOString(),
          },
        })
      } catch (err) {
        console.error('message:send error', err)
      }
    })

    // ─── Message delivered ──────────────────────────────
    socket.on('message:delivered', async (messageId) => {
      try {
        const message = await prisma.message.update({
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

    // ─── Disconnect ─────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId)
      io.emit('user:offline', userId)
      console.log(`❌ ${socket.data.username} disconnected`)
    })
  })
}

export { onlineUsers }