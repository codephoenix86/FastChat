const request = require('supertest')
const app = require('@/app')
const { connectTestDB, clearDatabase, disconnectTestDB } = require('./setup')
const {
  createTestUser,
  expectError,
  expectSuccess,
  generateUsername,
  generateEmail,
} = require('./helpers')
const { User, RefreshToken } = require('@models')

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDB()
  })

  afterAll(async () => {
    await disconnectTestDB()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: generateUsername(),
        email: generateEmail(),
        password: 'Password@123',
      }

      const response = await request(app).post('/api/v1/auth/signup').send(userData)

      expectSuccess(response, 201, 'User created successfully')
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.user.username).toBe(userData.username)
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.role).toBe('user')
      expect(response.body.data.user.password).toBeUndefined()

      // Verify user exists in database
      const user = await User.findOne({ email: userData.email })
      expect(user).toBeDefined()
    })

    it('should return 409 for duplicate email', async () => {
      // Create a user that already exists in the DB
      const { user } = await createTestUser()

      // signup with same email - should fail
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(), // Different username
        email: user.email, // Same email
        password: 'Password@123',
      })

      expectError(response, 409, 'CONFLICT')
      expect(response.body.error.message).toBe('Email already exists')
    })

    it('should return 409 for duplicate username', async () => {
      // Create a user that already exists in the DB
      const { user } = await createTestUser()

      // signup with same username - should fail
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: user.username, // Same username
        email: generateEmail(), // Different email
        password: 'Password@123',
      })

      expectError(response, 409, 'CONFLICT')
      expect(response.body.error.message).toBe('Username already taken')
    })

    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        email: 'invalid-email',
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for missing username', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        email: generateEmail(),
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for username too short', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: 'ab',
        email: generateEmail(),
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for username too long', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          username: 'a'.repeat(25),
          email: generateEmail(),
          password: 'Password@123',
        })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for invalid username format', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: '123invalid',
        email: generateEmail(),
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        email: generateEmail(),
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for weak password', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        email: generateEmail(),
        password: 'weakpass',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for password without uppercase', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        email: generateEmail(),
        password: 'password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for password without special character', async () => {
      const response = await request(app).post('/api/v1/auth/signup').send({
        username: generateUsername(),
        email: generateEmail(),
        password: 'Password123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('should login with username successfully', async () => {
      const { user } = await createTestUser()

      const response = await request(app).post('/api/v1/auth/login').send({
        username: user.username,
        password: 'Password@123',
      })

      expectSuccess(response, 200, 'User logged in successfully')
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.user.id).toBe(user._id.toString())
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
    })

    it('should login with email successfully', async () => {
      const { user } = await createTestUser()

      const response = await request(app).post('/api/v1/auth/login').send({
        email: user.email,
        password: 'Password@123',
      })

      expectSuccess(response, 200, 'User logged in successfully')
      expect(response.body.data.user.id).toBe(user._id.toString())
    })

    it('should return 401 for invalid username', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'nonexistent',
        password: 'Password@123',
      })

      expectError(response, 401, 'AUTHENTICATION_ERROR')
      expect(response.body.error.message).toBe('Invalid credentials')
    })

    it('should return 401 for invalid password', async () => {
      const { user } = await createTestUser()

      const response = await request(app).post('/api/v1/auth/login').send({
        username: user.username,
        password: 'WrongPassword@123',
      })

      expectError(response, 401, 'AUTHENTICATION_ERROR')
    })

    it('should return 400 when both username and email are missing', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        password: 'Password@123',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        username: 'testuser',
      })

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should store refresh token in database', async () => {
      const { user } = await createTestUser()

      const response = await request(app).post('/api/v1/auth/login').send({
        username: user.username,
        password: 'Password@123',
      })

      expectSuccess(response, 200)

      const tokenDoc = await RefreshToken.findOne({
        user: user._id,
        refreshToken: response.body.data.refreshToken,
      })

      expect(tokenDoc).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const { user, tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ refresh_token: tokens.refreshToken })

      expectSuccess(response, 200, 'User logged out successfully')

      // Verify refresh token is removed from database
      const tokenDoc = await RefreshToken.findOne({
        user: user._id,
        refreshToken: tokens.refreshToken,
      })

      expect(tokenDoc).toBeNull()
    })

    it('should return 400 for missing refresh token', async () => {
      const { tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({})

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 401 for invalid refresh token', async () => {
      const { tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({ refresh_token: 'invalid_refresh_token' })

      expectError(response, 401, 'AUTHENTICATION_ERROR')
    })

    it('should return 400 for missing access token', async () => {
      const { tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refresh_token: tokens.refreshToken })

      expectError(response, 400, 'VALIDATION_ERROR')
    })
  })

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh tokens successfully', async () => {
      const { user, tokens } = await createTestUser()

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refresh_token: tokens.refreshToken })

      expectSuccess(response, 200, 'Tokens refreshed successfully')
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeDefined()
      expect(response.body.data.accessToken).not.toBe(tokens.accessToken)
      expect(response.body.data.refreshToken).not.toBe(tokens.refreshToken)

      // Verify old token is removed
      const oldToken = await RefreshToken.findOne({
        user: user._id,
        refreshToken: tokens.refreshToken,
      })
      expect(oldToken).toBeNull()

      // Verify new token is stored
      const newToken = await RefreshToken.findOne({
        user: user._id,
        refreshToken: response.body.data.refreshToken,
      })
      expect(newToken).toBeDefined()
    })

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app).post('/api/v1/auth/refresh-token').send({})

      expectError(response, 400, 'VALIDATION_ERROR')
    })

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refresh_token: 'invalid_token' })

      expectError(response, 401, 'AUTHENTICATION_ERROR')
    })

    it('should return 401 for non-existent refresh token', async () => {
      const { tokens } = await createTestUser()

      // Delete the refresh token from database
      await RefreshToken.deleteMany({})

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refresh_token: tokens.refreshToken })

      expectError(response, 401, 'AUTHENTICATION_ERROR')
    })
  })
})
