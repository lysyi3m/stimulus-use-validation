import { Application } from 'stimulus'

export function render (html, controller) {
  document.body.innerHTML = html

  const application = Application.start()

  application.register(controller.name, controller)
}
