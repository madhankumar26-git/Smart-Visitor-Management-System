import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import socket from '../services/socket'

export default function useSocket(callback) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.token) {
      socket.disconnect()
      return
    }

    if (!socket.connected) {
      socket.auth = { token: user.token }
      socket.connect()
    }

    if (callback) {
      socket.on('visitor-event', callback)
    }

    return () => {
      if (callback) {
        socket.off('visitor-event', callback)
      }
    }
  }, [user?.token, callback])
}
