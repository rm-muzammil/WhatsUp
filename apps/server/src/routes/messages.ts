import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router({ mergeParams: true })

router.use(authMiddleware)

const sendSchema = z.object({
  content: z.string().min(1).max(2000),
})

// ─── GET /conversations/:conversationId/messages ──────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId
  const { conversationId } = req.params

  // Verify user is part of this conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })

  if (!participant) {
    res.status(403).json({ error: 'Not a participant of this conversation' })
    return
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
  })

  res.json({ messages })
})

// ─── POST /conversations/:conversationId/messages ─────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = sendSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors })
    return
  }

  const userId = req.user!.userId
  const { conversationId } = req.params
  const { content } = result.data

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  })

  if (!participant) {
    res.status(403).json({ error: 'Not a participant of this conversation' })
    return
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, content },
    include: {
      sender: { select: { id: true, username: true, avatarUrl: true } },
    },
  })

  // Update conversation's updatedAt so it floats to top of list
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  res.status(201).json({ message })
})

export default router