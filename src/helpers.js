export function debounce (callback, wait) {
  let timeout = null

  return function () {
    const callNow = !timeout
    const next = () => callback.apply(this, arguments)

    clearTimeout(timeout)
    timeout = setTimeout(next, wait)

    if (callNow) {
      next()
    }
  }
}

export function isFunction (fn) {
  return typeof fn === 'function'
}
