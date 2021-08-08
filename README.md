# stimulus-use-validation

![Node.js CI](https://github.com/lysyi3m/stimulus-use-validation/workflows/Node.js%20CI/badge.svg?branch=master)
[![npm version](https://badge.fury.io/js/%40lysyi3m%2Fstimulus-use-validation.svg)](https://badge.fury.io/js/%40lysyi3m%2Fstimulus-use-validation)

Lightweight, zero dependency, customizable mixin for [Stimulus](https://stimulusjs.org/) to handle form validation easily. Heavily rely on Constraint Validation API with support for custom validators.

## Installation

```sh
$ npm install --save @lysyi3m/stimulus-use-validation
```

or using [Yarn](https://yarnpkg.com/):
```sh
$ yarn add @lysyi3m/stimulus-use-validation
```

## Usage

```js
import { Controller } from 'stimulus'
import useValidation from '@lysyi3m/stimulus-use-validation'

export default class extends Controller {
  connect() {
    useValidation(this, {
      // options
    })
  }
}
```

## Options

| Option| Description | Default value |
|-----------------------|-------------|---------------------|
| `disable` | Disable submit button if there are any errors | `true` |
| `errorClassName` | Class name attached to invalid form control | `""` |
| `errorSelector` | Selector to match DOM element, where validation message will be rendered  | `.help-block` |
| `form` | HTMLElement which form validation will be attached to. `this.element` if not specified | `undefined` |
| `parentErrorClassName` | Class name attached to DOM element, containing invalid form control | `has-error` |
| `parentSelector` | Selector to match DOM element, contain form control and error container elements | `.form-group` |
| `validators` | Custom validators, mapped like `'[field_name]': validatorFunc` | `{}` |

## Validators

Custom validators are functions, which accept two arguments: `field` and `form` (useful for complex validations implementation, based on several form fields) and return an object like `{ isValid: Bool, message: String }`


Example:

```js

const customPasswordValidator = (field, form) => {
  const isValid = field.value !== 'password'

  const message = "Password should not be 'password'"

  return { isValid, message }
}

```
