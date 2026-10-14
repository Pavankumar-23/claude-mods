import { test, expect } from 'claude-code/testing'

import { pick, tierOf } from './pick'

test('routes prompts to tiers', async () => {
  expect(pick('find the root cause of this deadlock').tier).toBe('opus')
  expect(pick('rename foo to bar').tier).toBe('haiku')
  expect(pick('add a button to the settings screen').tier).toBe('sonnet')
  expect(tierOf('claude-opus-5-5')).toBe('opus')
})
