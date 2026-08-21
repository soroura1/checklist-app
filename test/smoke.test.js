/**
 * ⛔ SCAFFOLDING. THIS PROVES THE HARNESS RUNS, AND NOTHING ELSE.
 *
 * Reset to infrastructure on 2026-08-21. Every test of the offline field client
 * was deleted with the client itself.
 *
 * ⚠️ A green suite over an empty `src` certifies nothing, so the second test
 * fails the day real code lands and forces this file to be replaced rather than
 * left underneath it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';

test('the test harness runs', () => {
  assert.equal(1, 1);
});

test('⚠️ and there is still nothing here — this fails the day a real module lands', () => {
  const src = readdirSync(new URL('../src', import.meta.url));
  assert.deepEqual(src, ['main.jsx'],
    'src/ has grown — delete test/smoke.test.js and write a real test for what you added');
});
