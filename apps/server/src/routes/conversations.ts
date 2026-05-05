import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

const createSchema = z.object({
  participantId: z.string().uuid(),
})

// ─── GET /conversations ───────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  res.json({ conversations })
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

  // Check if conversation already exists between these two users
  const existing = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
  })

  if (existing) {
    res.json({ conversation: existing })
    return
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: participantId }],
      },
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
  })

  res.status(201).json({ conversation })
})

export default router