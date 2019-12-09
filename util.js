const abort = (message, code = 1) => {
  console.error(message)
  process.exit(code)
}

const enforce = (condition, message, code) => {
  if (!condition) abort(message, code)
}

const enforceOrThrowError = (condition, message) => {
  if (!condition) throw new Error(message)
}

const enforceOrThrowWarn = (condition, message) => {
  if (!condition) {
    console.warn(message)
    return false
  }
  return true
}

module.exports = {
  abort,
  enforce,
  enforceOrThrowError,
  enforceOrThrowWarn
}
