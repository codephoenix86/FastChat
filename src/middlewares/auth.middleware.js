const { errors, jwt } = require('@utils')
const { refreshTokenRepository } = require('@repositories')
const { env } = require('@config')

/**
 * Verify access token middleware
 */
exports.accessToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader?.split(' ')[1]

  if (!token) {
    throw new errors.ValidationError('Authorization token missing or malformed')
  }

  const payload = jwt.verifyToken(token, env.JWT_SECRET)
  req.user = payload
  next()
}

/**
 * Verify refresh token middleware
 */
exports.refreshToken = async (req, res, next) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    throw new errors.ValidationError('refresh_token is required')
  }

  const user = jwt.verifyToken(refresh_token, env.JWT_REFRESH_SECRET)

  const tokenDoc = await refreshTokenRepository.exists({
    user: user.id,
    refreshToken: refresh_token,
  })

  if (!tokenDoc) {
    throw new errors.AuthError('Invalid refresh token')
  }

  req.user = user
  next()
}