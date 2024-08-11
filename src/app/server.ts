'use server'

import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { saveMessage } from './api/server-actions/save-message'
import { fetchMessages } from './api/server-actions/fetch-messages'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(handler)

  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log({ socketId: socket.id })

    socket.on('new message', async (message) => {
      const { messageId } = await saveMessage({
        message,
      })

      if (messageId) {
        const { messages } = await fetchMessages({ tripId: message.tripId })
        io.emit('get messages', messages)
      }
    })

    socket.on('fetch messages', async (tripId) => {
      const { messages } = await fetchMessages({ tripId })
      io.emit('get messages', messages)
    })
  })

  httpServer
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`Ready on http://${hostname}:${port}`)
    })
})
