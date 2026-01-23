const jwt = require('jsonwebtoken')

const { AuthError } = require('../errors/errors')
const { env } = require('../../config')

/**
 * Generate access and refresh tokens
 * @param {Object} payload - User data to encode in token
 * @returns {Object} - { accessToken, refreshToken }
 */
exports.generateTokens = payload => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  })

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES,
  })

  return { accessToken, refreshToken }
}

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key
 * @returns {Object} - Decoded payload
 */
exports.verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'SyntaxError') {
      throw new AuthError('Invalid token')
    }
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('Token expired')
    }
    if (err.name === 'NotBeforeError') {
      throw new AuthError('Token is not active yet')
    }
    throw new AuthError('Authentication failed')
  }
}