const { jwt } = require('@utils')
const { logger, env } = require('@config')

/**
 * Socket.io authentication middleware
 * Verifies JWT token from socket handshake and attaches userId to socket
 */
const authenticate = (socket, next) => {
  try {
    const { token } = socket.handshake.auth

    if (!token) {
      logger.warn('Socket connection attempt without token', {
        socketId: socket.id,
        address: socket.handshake.address,
      })
      return next(new Error('Authentication token is missing'))
    }

    const payload = jwt.verifyToken(token, env.JWT_SECRET)
    socket.userId = payload.id

    logger.debug('Socket authenticated', {
      socketId: socket.id,
      userId: payload.id,
    })

    next()
  } catch (err) {
    logger.warn('Socket authentication failed', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      socketId: socket.id,
    })
    next(new Error(err.message))
  }
}

module.exports = { authenticate }