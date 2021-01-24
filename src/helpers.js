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

export function isFormControl (element) {
  if (!element) {
    return false
  }

  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(element.nodeName)) {
    return false
  }

  if (['submit', 'button', 'reset', 'hidden'].includes(element.type)) {
    return false
  }

  return true
}
