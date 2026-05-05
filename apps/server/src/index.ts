// import express from 'express'
// import http from 'http'
// import cors from 'cors'
// import cookieParser from 'cookie-parser'
// import { Server } from 'socket.io'
// import { ServerToClientEvents, ClientToServerEvents } from '@whatsapp-clone/types'

// import authRoutes from './routes/auth'
// import conversationRoutes from './routes/conversations'
// import messageRoutes from './routes/messages'
// import userRoutes from './routes/users'
// import { initSocket } from './socket'

// const app = express()
// const httpServer = http.createServer(app)

// // ─── Socket.io ────────────────────────────────────────────
// const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
//   cors: {
//     origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
//     credentials: true,
//   },
// })

// initSocket(io)

// // ─── Middleware ───────────────────────────────────────────
// app.use(cors({
//   origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
//   credentials: true,
// }))
// app.use(express.json())
// app.use(cookieParser())

// // ─── Routes ───────────────────────────────────────────────
// app.use('/auth', authRoutes)
// app.use('/conversations', conversationRoutes)
// app.use('/conversations/:conversationId/messages', messageRoutes)
// app.use('/users', userRoutes)

// app.get('/health', (_, res) => res.json({ status: 'ok' }))

// // ─── Start ────────────────────────────────────────────────
// const PORT = process.env.PORT ?? 4000

// httpServer.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`)
// })
import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io'
import { ServerToClientEvents, ClientToServerEvents } from '@whatsapp-clone/types'

import authRoutes from './routes/auth'
import conversationRoutes from './routes/conversations'
import messageRoutes from './routes/messages'
import userRoutes from './routes/users'
import { initSocket } from './socket'

const app = express()
const httpServer = http.createServer(app)

// ─── Middleware FIRST ─────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// ─── Socket.io ────────────────────────────────────────────
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})

initSocket(io)

// ─── Routes ───────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/conversations', conversationRoutes)
app.use('/conversations/:conversationId/messages', messageRoutes)
app.use('/users', userRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

// ─── Start ────────────────────────────────────────────────
const PORT = process.env.PORT ?? 4000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})