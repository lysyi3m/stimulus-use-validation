import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { Controller } from 'stimulus'
import { render } from './helpers'

import useValidation from '../src'

const html = `
  <form data-testid="form" data-controller="Form">
    <div data-testid="emailParent" class="form-group">
      <label for="email">Email</label>
      <input data-testid="emailField" type="email" class="form-control" id="email" name="email" required>
      <p class="help-block"></p>
    </div>
    <div data-testid="passwordParent" class="form-group">
      <label for="password">Password</label>
      <input data-testid="passwordField" type="password" class="form-control" id="password" name="password" minlength="6" required>
      <p class="help-block"></p>
    </div>
    <button data-testid="submitButton" type="submit" disabled>Submit</button>
  </form>
`

class Form extends Controller {
  connect () {
    this.element[this.identifier] = this

    useValidation(this)
  }
}

describe('Basic Integration', () => {
  beforeEach(() => {
    render(html, Form)
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
    expect(getByTestId('emailParent')).toHaveClass('has-error')

    userEvent.type(getByTestId('passwordField'), '1234', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('passwordParent')).toHaveClass('has-error')

    expect(getByTestId('submitButton')).toBeDisabled()

    userEvent.type(getByTestId('emailField'), 'correct@email.address', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('emailParent')).not.toHaveClass('has-error')

    userEvent.type(getByTestId('passwordField'), '123456', { bubbles: true })
    jest.runOnlyPendingTimers()
    expect(getByTestId('passwordParent')).not.toHaveClass('has-error')

    expect(getByTestId('submitButton')).not.toBeDisabled()
  })

  it('can call validateForm() method', () => {
    const { getByTestId } = within(document.body)
    const { Form } = getByTestId('form')

    Form.validateForm()

    expect(getByTestId('emailParent')).toHaveClass('has-error')
    expect(getByTestId('passwordParent')).toHaveClass('has-error')
    expect(getByTestId('submitButton')).toBeDisabled()

    getByTestId('emailField').value = 'correct@email.address'
    getByTestId('passwordField').value = '123456'

    Form.validateForm()

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')
    expect(getByTestId('passwordParent')).not.toHaveClass('has-error')
    expect(getByTestId('submitButton')).not.toBeDisabled()
  })

  it('can call validateField() method', () => {
    const { getByTestId } = within(document.body)
    const { Form } = getByTestId('form')

    Form.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).toHaveClass('has-error')

    getByTestId('emailField').value = 'correct@email.address'

    Form.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')
  })
})
