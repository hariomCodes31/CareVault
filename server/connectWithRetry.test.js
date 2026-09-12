import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectWithRetry } from './config/connectWithRetry.js';
test('retries failed initial connections and stops after recovery', async () => {
  let attempts = 0, retries = 0;
  const delays = [];
  const result = await connectWithRetry(async () => { if (++attempts < 3) throw new Error('Network unavailable'); return 'connected'; }, { wait: async ms => { delays.push(ms); }, onRetry: () => retries++ });
  assert.equal(result, 'connected'); assert.equal(attempts, 3); assert.equal(retries, 2); assert.deepEqual(delays, [5000, 5000]);
});
test('does not retry a successful connection', async () => {
  assert.equal(await connectWithRetry(async () => 'connected', { wait: () => { throw new Error('Unexpected retry'); } }), 'connected');
});
