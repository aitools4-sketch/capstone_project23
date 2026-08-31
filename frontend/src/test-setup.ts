import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver {
  root = null
  rootMargin = ''
  thresholds: ReadonlyArray<number> = []
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
