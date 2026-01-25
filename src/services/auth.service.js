const { userRepository, refreshTokenRepository } = require('@repositories')
const { errors, jwt } = require('@utils')
const { logger } = require('@config')
const { verifyCredentials } = require('./auth/credentials')

const { AuthError, ConflictError } = errors
const { generateTokens } = jwt

class AuthService {
  async signup(userData) {
    try {
      const user = await userRepository.create(userData)

      logger.info('User registered successfully', {
        userId: user._id,
        username: user.username
      })

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    } catch (err) {
      logger.error('Signup failed:', {
        error: err.message,
        stack: err.stack,
        name: err.name
      })
      if (err.code === 11000) {
        if (err.keyPattern.email) {
          throw new ConflictError('Email already exists')
        }
        if (err.keyPattern.username) {
          throw new ConflictError('Username already taken')
        }
      }
      throw err
    }
  }

  async login(credentials) {
    const user = await verifyCredentials(credentials)

    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    }

    const tokens = await generateTokens(payload)

    // Store refresh token
    await refreshTokenRepository.create({
      user: user._id,
      refreshToken: tokens.refreshToken,
    })

    logger.info('User logged in successfully', {
      userId: user._id,
      username: user.username
    })

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    }
  }

  async logout(userId, refreshToken) {
    const result = await refreshTokenRepository.deleteOne({
      user: userId,
      refreshToken,
    })

    if (result.deletedCount === 0) {
      throw new AuthError('Invalid refresh token')
    }

    logger.info('User logged out successfully', { userId })
  }

  async refreshAccessToken(oldRefreshToken, user) {
    // Verify refresh token exists in database
    const tokenDoc = await refreshTokenRepository.findOne({
      user: user.id,
      refreshToken: oldRefreshToken,
    })

    if (!tokenDoc) {
      throw new AuthError('Invalid refresh token')
    }

    // Delete old refresh token
    await refreshTokenRepository.deleteOne({ _id: tokenDoc._id })

    // Generate new tokens
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    }

    const tokens = await generateTokens(payload)

    // Store new refresh token
    await refreshTokenRepository.create({
      user: user.id,
      refreshToken: tokens.refreshToken,
    })

    logger.info('Tokens refreshed successfully', { userId: user.id })

    return tokens
  }
}

module.exports = new AuthService()