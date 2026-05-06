import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '@whatsapp-clone/types'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (typeof window === 'undefined') {
    throw new Error('Socket can only be used in the browser')
  }

  if (!socket) {
    const token = localStorage.getItem('token')
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
      auth: { token },
      autoConnect: false,
    })
  }

  return socket
}

export function connectSocket(): void {
  if (typeof window === 'undefined') return
  const s = getSocket()
  if (!s.connected) s.connect()
}

export function disconnectSocket(): void {
  if (typeof window === 'undefined') return
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}