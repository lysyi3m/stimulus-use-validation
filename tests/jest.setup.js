import 'mutationobserver-shim'
import 'regenerator-runtime/runtime'
import '@testing-library/jest-dom'
import hyperform from 'hyperform'

hyperform(window, {
  validEvent: false
})
