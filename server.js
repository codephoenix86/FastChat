const app = require('./src/app')
const http = require('http')
const logger = require('./src/config/logger')
const env = require('./src/config/validateEnv')
const { connectDB, disconnectDB } = require('./src/config/db')
const { socketServer } = require('./src/sockets')

const server = http.createServer(app)
const io = socketServer.init(server)

// Track shutdown state to prevent multiple shutdown attempts
let isShuttingDown = false

// Graceful shutdown handler
const gracefulShutdown = async signal => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal')
    return
  }

  isShuttingDown = true
  logger.info(`${signal} received, starting graceful shutdown`)

  // Set a force shutdown timeout (but don't keep process alive)
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)

  try {
    // Stop accepting new HTTP connections
    await new Promise((resolve, reject) => {
      server.close(err => {
        if (err) reject(err)
        else resolve()
      })
    })
    logger.info('HTTP server closed')

    // Close Socket.io connections
    await new Promise(resolve => {
      io.close(() => {
        logger.info('Socket.io server closed')
        resolve()
      })
    })

    // Close database connection
    await disconnectDB()

    logger.info('Graceful shutdown completed')

    process.exit(0)
  } catch (err) {
    logger.error('Error during shutdown:', err)
    process.exit(1)
  }
}

// Start server
;(async () => {
  try {
    // Validate environment variables
    const config = env()
    
    // Connect to database
    await connectDB()

    // Start listening
    server.listen(config.PORT, () => {
      logger.info(`Server listening on port ${config.PORT}`)
      logger.info(`Environment: ${config.NODE_ENV}`)
      logger.info('Application started successfully')
    })

    // Register shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // Handle uncaught errors
    process.on('uncaughtException', err => {
      logger.error('Uncaught exception:', err)
      gracefulShutdown('uncaughtException')
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason)
      gracefulShutdown('unhandledRejection')
    })
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
})()