import { debounce, isFunction } from './helpers'

const defaultOptions = {
  delay: 500,
  errorClassName: 'has-error',
  errorContainerSelector: '.help-block',
  parentSelector: '.form-group',
  validators: {}
}

const nativeValidators = [
  'badInput',
  'patternMismatch',
  'rangeOverflow',
  'rangeUnderflow',
  'stepMismatch',
  'tooLong',
  'tooShort',
  'typeMismatch',
  'valueMissing'
]

export default function useValidation (controller, options = {}) {
  const {
    delay,
    errorClassName,
    errorContainerSelector,
    parentSelector,
    validators
  } = Object.assign(defaultOptions, options)

  const toggleMessage = (field, isValid) => {
    const parent = field.closest(parentSelector)

    if (!parent) return

    parent.classList.toggle(errorClassName, !isValid)

    const errorContainer = parent.querySelector(errorContainerSelector)

    if (!errorContainer) return

    errorContainer.innerText = field.validationMessage
  }

  const toggleSubmitButtons = (isDisabled) => {
    const submitButtons = controller.element.querySelectorAll(
      'input[type=submit], button[type=submit]'
    )

    submitButtons.forEach(button => {
      button.disabled = isDisabled
    })
  }

  const validateField = (field) => {
    if (!field) return

    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(field.nodeName)) return

    let isValid = nativeValidators.every(key => !field.validity[key])

    if (isFunction(validators[field.name])) {
      const {
        isValid: isValidatorValid,
        message
      } = validators[field.name](field, controller.element)

      isValid = isValid ? isValidatorValid : isValid

      field.setCustomValidity(isValid ? '' : message)
    }

    toggleMessage(field, isValid)
    toggleSubmitButtons(!isValid)

    return { isValid }
  }

  const validateForm = () => {
    for (const field of controller.element.elements) {
      if (field.willValidate || isFunction(validators[field.name])) {
        validateField(field)
      }
    }
  }

  const handleInput = debounce((e) => validateField(e.target), delay)

  const handleFocusOut = (e) => validateField(e.target)

  const init = () => {
    controller.element.addEventListener('input', handleInput, false)
    controller.element.addEventListener('focusout', handleFocusOut, false)

    const controllerDisconnect = controller.disconnect.bind(controller)

    Object.assign(controller, {
      validateForm,
      validateField,
      disconnect: () => {
        controller.element.removeEventListener('input', handleInput, false)
        controller.element.removeEventListener('focusout', handleFocusOut, false)

        controllerDisconnect()
      }
    })
  }

  init()
}
