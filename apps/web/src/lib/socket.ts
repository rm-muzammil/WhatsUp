import { io, Socket } from 'socket.io-client'
import { ServerToClientEvents, ClientToServerEvents } from '@whatsapp-clone/types'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
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
  const s = getSocket()
  if (!s.connected) s.connect()
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}