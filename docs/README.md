# fastchat Documentation

Complete documentation for the fastchat real-time chat application.

## Getting Started

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project

## API Documentation

- **[REST API Reference](API_REST.md)** - Complete HTTP endpoint documentation
  - Authentication endpoints
  - User management
  - Chat operations
  - Message handling
- **[WebSocket API](API_WEBSOCKET.md)** - Socket.io events and real-time features
  - Connection handling
  - Chat room events
  - Message status updates
  - Typing indicators

## Architecture & Design

- **[Architecture Overview](ARCHITECTURE.md)** - System design and architectural patterns
  - System architecture diagrams
  - Request flow
  - Database schema
  - Design patterns
  - WebSocket architecture

- **[Testing Guide](TESTING.md)** - Testing strategy and best practices
  - Test architecture
  - Unit vs integration tests
  - Running tests
  - Writing new tests
  - Coverage requirements

## Deployment & Operations

- **[Deployment Guide](DEPLOYMENT.md)** - Production setup and operations
  - Environment configuration
  - Security best practices
  - Performance optimization
  - Scaling strategies
  - Monitoring and logging

- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
  - Setup issues
  - Runtime errors
  - Database problems
  - WebSocket issues

## Additional Resources

### Project Files

- [.env.example](../.env.example) - Environment configuration template
- [package.json](../package.json) - Dependencies and scripts
- [jest.config.js](../jest.config.js) - Test configuration

### Code Organization

- `src/config/` - Application configuration
- `src/controllers/` - HTTP request handlers
- `src/middlewares/` - Express middleware
- `src/models/` - MongoDB schemas
- `src/repositories/` - Database access layer
- `src/routes/` - API route definitions
- `src/services/` - Business logic
- `src/sockets/` - WebSocket implementation
- `src/tests/` - Test suites
- `src/utils/` - Utility functions

## Quick Links

- [GitHub Repository](https://github.com/codephoenix86/fastchat)
- [Report Issues](https://github.com/codephoenix86/fastchat/issues)
- [Discussions](https://github.com/codephoenix86/fastchat/discussions)

## Documentation Updates

This documentation is maintained alongside the codebase. If you find any issues or have suggestions for improvements, please:

1. Check existing [issues](https://github.com/codephoenix86/fastchat/issues)
2. Create a new issue if needed
3. Submit a pull request with improvements

Last updated: January 2026
