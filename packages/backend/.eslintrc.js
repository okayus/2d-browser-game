module.exports = {
  extends: ['../../.eslintrc.js'],
  env: {
    worker: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
};