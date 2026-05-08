import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authMiddleware)

const createSchema = z.object({
  participantId: z.string().uuid(),
})

const conversationInclude = {
  participants: {
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
}

// ─── GET /conversations ───────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: conversationInclude,
    orderBy: { updatedAt: 'desc' },
  })

  // Flatten participants to just user objects
  const mapped = conversations.map((c) => ({
    ...c,
    participants: c.participants.map((p) => p.user),
    lastMessage: c.messages[0] ?? null,
    unreadCount: 0,
  }))

  res.json({ conversations: mapped })
})

// ─── POST /conversations ──────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const result = createSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors })
    return
  }

  const userId = req.user!.userId
  const { participantId } = result.data

  if (userId === participantId) {
    res.status(400).json({ error: 'Cannot create conversation with yourself' })
    return
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: conversationInclude,
  })

  if (existing) {
    res.json({
      conversation: {
        ...existing,
        participants: existing.participants.map((p) => p.user),
        lastMessage: existing.messages[0] ?? null,
        unreadCount: 0,
      },
    })
    return
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: participantId }],
      },
    },
    include: conversationInclude,
  })

  res.status(201).json({
    conversation: {
      ...conversation,
      participants: conversation.participants.map((p) => p.user),
      lastMessage: conversation.messages[0] ?? null,
      unreadCount: 0,
    },
  })
})

export default router