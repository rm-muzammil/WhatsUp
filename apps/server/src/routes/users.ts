import { Router, Response } from 'express'
import {prisma} from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

// ─── GET /users/search?q=username ────────────────────────
router.get('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string) ?? ''

  if (q.length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' })
    return
  }

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: 'insensitive' },
      NOT: { id: req.user!.userId }, // exclude self
    },
    select: { id: true, username: true, email: true, avatarUrl: true },
    take: 10,
  })

  res.json({ users })
})

export default router