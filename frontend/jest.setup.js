// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfills para APIs do navegador necessárias para o nock
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Polyfill para fetch e Response API
global.Response = require('node-fetch').Response
global.Request = require('node-fetch').Request
global.Headers = require('node-fetch').Headers
global.fetch = require('node-fetch')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock localStorage
const localStorageMock = (function() {
  let store = {}
  return {
    getItem: function(key) {
      return store[key] || null
    },
    setItem: function(key, value) {
      store[key] = value.toString()
    },
    removeItem: function(key) {
      delete store[key]
    },
    clear: function() {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock Fetch API
global.fetch = jest.fn()

// Mock dispatchEvent
window.dispatchEvent = jest.fn()
