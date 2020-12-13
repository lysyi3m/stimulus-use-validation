import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { Controller } from 'stimulus'
import { render } from './helpers'

import useValidation from '../src'

const html = `
  <form data-testid="form" data-controller="CustomForm">
    <div data-testid="emailParent" class="control">
      <label for="email">Email</label>
      <input data-testid="emailField" type="email" id="email" name="email" required>
      <p data-testid="emailMessage" class="message"></p>
    </div>
    <div data-testid="passwordParent" class="control">
      <label for="password">Password</label>
      <input data-testid="passwordField" type="password" id="password" name="password" minlength="6" required>
      <p data-testid="passwordMessage" class="message"></p>
    </div>
    <button data-testid="submitButton" type="submit" disabled>Submit</button>
  </form>
`

const customPasswordValidator = (field, form) => {
  const isValid = field.value !== 'password'

  const message = "Password should not be 'password'"

  return { isValid, message }
}

class CustomForm extends Controller {
  connect () {
    this.element[this.identifier] = this

    useValidation(this, {
      errorClassName: 'is-invalid',
      errorContainerSelector: '.message',
      parentSelector: '.control',
      validators: {
        password: customPasswordValidator
      }
    })
  }
}

describe('Basic Integration', () => {
  beforeEach(() => {
    render(html, CustomForm)
    jest.useFakeTimers()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.clearAllTimers()
  })

  it('renders', () => {
    const { getByTestId } = within(document.body)

    expect(getByTestId('submitButton')).toBeDisabled()
  })

  it('validates form on user input', () => {
    const { getByTestId } = within(document.body)

    userEvent.type(getByTestId('emailField'), 'incorrectemailaddress', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('emailParent')).toHaveClass('is-invalid')

    userEvent.type(getByTestId('passwordField'), '1234', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('passwordParent')).toHaveClass('is-invalid')

    expect(getByTestId('submitButton')).toBeDisabled()

    userEvent.type(getByTestId('emailField'), 'correct@email.address', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('emailParent')).not.toHaveClass('is-invalid')

    userEvent.type(getByTestId('passwordField'), '123456', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('passwordParent')).not.toHaveClass('is-invalid')

    expect(getByTestId('submitButton')).not.toBeDisabled()
  })

  it('can call validateForm() method', () => {
    const { getByTestId } = within(document.body)
    const { CustomForm } = getByTestId('form')

    CustomForm.validateForm()

    expect(getByTestId('emailParent')).toHaveClass('is-invalid')
    expect(getByTestId('passwordParent')).toHaveClass('is-invalid')
    expect(getByTestId('submitButton')).toBeDisabled()

    getByTestId('emailField').value = 'correct@email.address'
    getByTestId('passwordField').value = '123456'

    CustomForm.validateForm()

    expect(getByTestId('emailParent')).not.toHaveClass('is-invalid')
    expect(getByTestId('passwordParent')).not.toHaveClass('is-invalid')
    expect(getByTestId('submitButton')).not.toBeDisabled()
  })

  it('can call validateField() method', () => {
    const { getByTestId } = within(document.body)
    const { CustomForm } = getByTestId('form')

    getByTestId('emailField').value = 'incorrectemailaddress'

    CustomForm.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).toHaveClass('is-invalid')

    getByTestId('emailField').value = 'correct@email.address'

    CustomForm.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).not.toHaveClass('is-invalid')
  })

  it('accepts custom validators', () => {
    const { getByTestId } = within(document.body)
    const { CustomForm } = getByTestId('form')

    getByTestId('passwordField').value = 'password'

    CustomForm.validateField(getByTestId('passwordField'))

    expect(getByTestId('passwordParent')).toHaveClass('is-invalid')
    expect(getByTestId('passwordMessage').innerText).toMatch("Password should not be 'password'")

    getByTestId('passwordField').value = '123456'

    CustomForm.validateField(getByTestId('passwordField'))

    expect(getByTestId('passwordParent')).not.toHaveClass('is-invalid')
  })
})
