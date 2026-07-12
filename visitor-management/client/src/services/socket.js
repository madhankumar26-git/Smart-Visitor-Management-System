import { io } from 'socket.io-client'

const socket = io('/', {
  autoConnect: false,
  path: '/socket.io',
})

export default socket
