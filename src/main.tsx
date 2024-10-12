import { render } from 'preact'
import { App } from './app'

const root = document.querySelector('main')
if (root) render(<App />, root)
