// Global test setup and teardown
const mongoose = require('mongoose')

// Set test environment FIRST (before any imports)
process.env.NODE_ENV = 'test'
process.env.MONGO_URI = 'mongodb://localhost:27017/fastchat-test'
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters_long_here_for_testing'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_minimum_32_characters_long_here_for_testing'
process.env.JWT_ACCESS_EXPIRES = '15m'
process.env.JWT_REFRESH_EXPIRES = '7d'
process.env.ALLOWED_ORIGINS = 'http://localhost:3000'
process.env.LOG_LEVEL = 'error'
process.env.MAX_FILE_SIZE = '5242880'

// Increase timeout for all tests
jest.setTimeout(30000)

// Mock logger
jest.mock('@config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}))

// Global afterAll hook
afterAll(async () => {
  // Force close all connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }

  // Clear all timers
  jest.clearAllTimers()
})
