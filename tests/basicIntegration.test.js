import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { Controller } from 'stimulus'
import { render } from './helpers'

import useValidation from '../src'

const html = `
  <form data-testid="form" data-controller="Form" novalidate="novalidate" onsubmit="return false;">
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
    <button data-testid="submitButton" type="submit">Submit</button>
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

  it('validates form on submit button click', () => {
    const { getByTestId } = within(document.body)
    const form = getByTestId('form')

    expect(getByTestId('submitButton')).not.toBeDisabled()

    userEvent.click(getByTestId('submitButton'))

    expect(getByTestId('submitButton')).toBeDisabled()

    expect(form.hasErrors()).toBeTruthy()
  })

  it('validates incorrect form', () => {
    const { getByTestId } = within(document.body)
    const form = getByTestId('form')

    userEvent.type(getByTestId('emailField'), 'incorrectemailaddress', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.type(getByTestId('passwordField'), '1234', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.click(getByTestId('submitButton'))

    expect(getByTestId('submitButton')).toBeDisabled()

    expect(form.hasErrors()).toBeTruthy()
  })

  it('validates correct form', () => {
    const { getByTestId } = within(document.body)
    const form = getByTestId('form')

    userEvent.type(getByTestId('emailField'), 'correct@email.address', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.type(getByTestId('passwordField'), '123456', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.click(getByTestId('submitButton'))

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')
    expect(getByTestId('passwordParent')).not.toHaveClass('has-error')

    expect(form.hasErrors()).toBeFalsy()
  })

  it('validates form on user input', () => {
    const { getByTestId } = within(document.body)

    userEvent.type(getByTestId('emailField'), 'incorrectemailaddress', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.type(getByTestId('passwordField'), '1234', { bubbles: true })
    jest.runOnlyPendingTimers()

    userEvent.click(getByTestId('submitButton'))

    expect(getByTestId('emailParent')).toHaveClass('has-error')
    expect(getByTestId('passwordParent')).toHaveClass('has-error')

    userEvent.type(getByTestId('emailField'), 'correct@email.address', { bubbles: true })
    jest.runOnlyPendingTimers()

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')

    userEvent.type(getByTestId('passwordField'), '123456', { bubbles: true })
    jest.runOnlyPendingTimers()

    expect(getByTestId('passwordParent')).not.toHaveClass('has-error')
  })

  it('can call validateForm() method', () => {
    const { getByTestId } = within(document.body)
    const form = getByTestId('form')

    form.validateForm()

    expect(getByTestId('emailParent')).toHaveClass('has-error')
    expect(getByTestId('passwordParent')).toHaveClass('has-error')

    expect(form.hasErrors()).toBeTruthy()

    getByTestId('emailField').value = 'correct@email.address'
    getByTestId('passwordField').value = '123456'

    form.validateForm()

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')
    expect(getByTestId('passwordParent')).not.toHaveClass('has-error')

    expect(form.hasErrors()).toBeFalsy()
  })

  it('can call validateField() method', () => {
    const { getByTestId } = within(document.body)
    const form = getByTestId('form')

    form.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).toHaveClass('has-error')

    getByTestId('emailField').value = 'correct@email.address'

    form.validateField(getByTestId('emailField'))

    expect(getByTestId('emailParent')).not.toHaveClass('has-error')
  })
})
