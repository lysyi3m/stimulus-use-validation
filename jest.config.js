module.exports = {
  transform: {
    '^.+\\.js': 'babel-jest'
  },
  verbose: true,
  setupFilesAfterEnv: ['./tests/jest.setup.js']
}
