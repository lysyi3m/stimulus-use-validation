import { debounce, isFunction, isFormControl } from './helpers'

export class Validation {
  defaults = {
    disable: true,
    errorClassName: '',
    errorSelector: '.help-block',
    form: undefined,
    parentErrorClassName: 'has-error',
    parentSelector: '.form-group',
    validators: {}
  }

  nativeValidators = [
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

  constructor (controller, options = {}) {
    this.options = Object.assign(this.defaults, options)
    this.form = this.options.form || controller.element
    this.fieldsValidity = {}

    const handleChange = debounce(this._handleChange, 300)

    this.form.addEventListener('submit', this._handleSubmit, false)

    for (const field of this.form.elements) {
      field.addEventListener('input', handleChange, false)
      field.addEventListener('blur', this._handleChange, false)
    }

    const controllerDisconnect = controller.disconnect.bind(controller)

    this.form.hasErrors = this.hasErrors
    this.form.validateField = this.validateForm
    this.form.validateForm = this.validateForm

    Object.assign(controller, {
      disconnect: () => {
        this.form.removeEventListener('submit', this._handleSubmit, false)

        for (const field of this.form.elements) {
          field.removeEventListener('input', handleChange, false)
          field.removeEventListener('blur', this._handleChange, false)
        }

        controllerDisconnect()
      }
    })
  }

  hasErrors = () => {
    return Object.values(this.fieldsValidity).some(value => !value)
  }

  validateField = (field) => {
    let isValid = this.nativeValidators.every(key => !field.validity[key])

    if (isValid && isFunction(this.options.validators[field.name])) {
      const {
        isValid: isValidatorValid,
        message
      } = this.options.validators[field.name](field, this.form)

      isValid = isValidatorValid

      field.setCustomValidity(isValid ? '' : message)
    }

    this.fieldsValidity[field.name] = isValid

    this._toggleMessage(field, isValid)
  }

  validateForm = () => {
    const { disable, validators } = this.options

    for (const field of this.form.elements) {
      if (isFormControl(field) && (field.willValidate || isFunction(validators[field.name]))) {
        this.validateField(field)
      }
    }

    if (disable) {
      this._toggleSubmit()
    }
  }

  _toggleMessage = (field, isValid) => {
    const { parentErrorClassName, parentSelector, errorClassName, errorSelector } = this.options

    if (errorClassName) {
      field.classList.toggle(errorClassName, !isValid)
    }

    const parent = field.closest(parentSelector)

    if (!parent) return

    parent.classList.toggle(parentErrorClassName, !isValid)

    const errorContainer = parent.querySelector(errorSelector)

    if (!errorContainer) return

    errorContainer.innerText = field.validationMessage
  }

  _toggleSubmit = () => {
    const submitButtons = this.form.querySelectorAll('input[type=submit], button[type=submit]')

    submitButtons.forEach(button => {
      button.disabled = this.hasErrors()
    })
  }

  _handleChange = (e) => {
    if (!isFormControl(e.target)) return

    if (!Object.hasOwnProperty.call(this.fieldsValidity, e.target.name)) return

    this.validateField(e.target)

    if (this.options.disable) {
      this._toggleSubmit()
    }
  }

  _handleSubmit = (e) => {
    this.validateForm()

    if (!this.hasErrors()) return true

    e.preventDefault()

    return false
  }
}

export default function useValidation (controller, options) {
  return new Validation(controller, options)
}
