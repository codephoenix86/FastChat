const { authService } = require('@services')
const { ApiResponse } = require('@utils')
const { HTTP_STATUS } = require('@constants')

exports.signup = async (req, res) => {
  const { username, password, email } = req.body

  const user = await authService.signup({ username, password, email })

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse('User created successfully', { user }, HTTP_STATUS.CREATED))
}

exports.login = async (req, res) => {
  const { username, email, password } = req.body

  const result = await authService.login({ username, email, password })

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse('User logged in successfully', result))
}

exports.logout = async (req, res) => {
  const { refresh_token } = req.body

  await authService.logout(req.user.id, refresh_token)

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse('User logged out successfully'))
}

exports.refreshToken = async (req, res) => {
  const { refresh_token } = req.body

  const tokens = await authService.refreshAccessToken(refresh_token, req.user)

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse('Tokens refreshed successfully', tokens))
}