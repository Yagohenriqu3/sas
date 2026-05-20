require('dotenv').config()

const http = require('http')
const express = require('express')
const cors = require('cors')
const routes = require('./src/routes')
const { notFoundHandler, errorHandler } = require('./src/middlewares/errorHandler')
const { initSocket } = require('./src/socket')

const app = express()
const PORT = process.env.PORT || 3333
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174'
const allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)

function corsOriginResolver(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true)
    return
  }

  callback(new Error(`Origin not allowed by CORS: ${origin}`))
}

app.use(cors({ origin: corsOriginResolver }))
app.use(express.json())

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(routes)
app.use(notFoundHandler)
app.use(errorHandler)

const httpServer = http.createServer(app)
initSocket(httpServer, allowedOrigins)

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
