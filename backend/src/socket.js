const { Server } = require('socket.io')

let io = null

function resolveSocketOrigin(allowedOrigins, origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
    return
  }

  callback(new Error(`Origin not allowed by CORS: ${origin}`))
}

function initSocket(httpServer, allowedOrigins = []) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => resolveSocketOrigin(allowedOrigins, origin, callback),
      methods: ['GET', 'POST', 'PATCH'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`[socket] Client disconnected: ${socket.id}`)
    })
  })

  return io
}

function getIO() {
  if (!io) throw new Error('Socket.IO not initialized. Call initSocket() first.')
  return io
}

module.exports = { initSocket, getIO }
