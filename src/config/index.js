/**
 * Configuration barrel export
 * Centralizes all configuration modules
 */
module.exports = {
  env: require('./env'),
  db: require('./db'),
  logger: require('./logger'),
}