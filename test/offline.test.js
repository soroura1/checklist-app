/**
 * ★ Offline behaviour — the safety-sensitive part of this app.
 *
 * The scenario every one of these guards against: a device that has not synced for weeks, in a
 * corridor, serving an instruction that was withdrawn for a reason.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { BundleStore } from '../src/offline/bundle-store.js';

/** A minimal in-memory localStorage. */
function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
    clear: () => m.clear(),
  };
}

const tool = (o = {}) => ({ id: 'HZ-HVCA-001', riskTier: 'general', ...o });

function bundleOf(tools, withdrawalList = []) {
  return {
    catalogueVersion: '1.0.0',
    generatedAt: '2026-01-01T00:00:00Z',
    checksum: createHash('sha256').update(JSON.stringify(tools)).digest('hex'),
    tools,
    withdrawalList,
  };
}

let storage;
beforeEach(() => { storage = memoryStorage(); });

const at = (iso) => () => new Date(iso);
const DAY = 86_400_000;

describe('integrity', () => {
  test('a bundle whose checksum matches is stored', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    const r = await s.store(bundleOf([tool()]));
    assert.equal(r.ok, true);
    assert.equal(r.tools, 1);
  });

  test('★ a bundle failing its checksum is REFUSED, not stored with a warning', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    const bad = { ...bundleOf([tool()]), checksum: 'deadbeef' };
    const r = await s.store(bad);
    assert.equal(r.ok, false);
    assert.equal(r.refusal, 'bundle-integrity-failed');
    assert.equal(
      s.read('HZ-HVCA-001').reason,
      'no-bundle',
      'nothing was stored — content whose integrity cannot be established is worse than no content, ' +
        'because it looks authoritative',
    );
  });
});

describe('cached age is always knowable', () => {
  test('age is reported in days', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool()]));
    const later = new BundleStore({ storage, now: at('2026-01-11T00:00:00Z') });
    assert.equal(Math.round(later.ageDays()), 10);
  });

  test('age is null when nothing is cached — never zero, which would read as fresh', () => {
    assert.equal(new BundleStore({ storage }).ageDays(), null);
  });
});

describe('★ risk-tiered expiry (E14)', () => {
  test('fresh content of either tier is available', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool(), tool({ id: 'FIRE-EVAC-001', riskTier: 'high' })]));
    const later = new BundleStore({ storage, now: at('2026-01-04T00:00:00Z') });
    assert.equal(later.read('HZ-HVCA-001').available, true);
    assert.equal(later.read('FIRE-EVAC-001').available, true);
  });

  test('EXPIRED GENERAL content warns and CONTINUES — a stale supply checklist is still useful', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool()]));
    const much = new BundleStore({ storage, now: at('2026-06-01T00:00:00Z') });   // ~150 days
    const r = much.read('HZ-HVCA-001');
    assert.equal(r.available, true, 'blocking it strands a field user for no safety gain');
    assert.equal(r.staleness, 'expired-warn');
  });

  test('★ EXPIRED HIGH-RISK content STOPS — the failure mode is a withdrawn evacuation instruction', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool({ id: 'FIRE-EVAC-001', riskTier: 'high' })]));
    const later = new BundleStore({ storage, now: at('2026-02-01T00:00:00Z') });   // 31 days
    const r = later.read('FIRE-EVAC-001');
    assert.equal(r.available, false);
    assert.equal(r.refusal, 'cached-content-expired');
  });

  test('the two tiers diverge at the SAME age — that divergence is the design', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool(), tool({ id: 'FIRE-EVAC-001', riskTier: 'high' })]));
    const later = new BundleStore({ storage, now: at('2026-02-01T00:00:00Z') });
    assert.equal(later.read('HZ-HVCA-001').available, true, 'general continues');
    assert.equal(later.read('FIRE-EVAC-001').available, false, 'high-risk stops');
  });
});

describe('★ the withdrawal list', () => {
  test('is honoured BEFORE content is served — even on a perfectly fresh bundle', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool()], ['HZ-HVCA-001']));
    const r = new BundleStore({ storage, now: at('2026-01-02T00:00:00Z') }).read('HZ-HVCA-001');
    assert.equal(r.available, false);
    assert.equal(r.refusal, 'withdrawn-content-may-not-be-executed');
  });

  test('can be updated on ANY contact, without refreshing the whole bundle', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool()]));
    assert.equal(s.read('HZ-HVCA-001').available, true);

    // A brief moment of connectivity — far cheaper than a full bundle, and more urgent.
    s.syncWithdrawalList(['HZ-HVCA-001']);
    assert.equal(
      s.read('HZ-HVCA-001').available,
      false,
      'the list must be updatable independently — a withdrawal is more urgent than a refresh',
    );
  });

  test('withdrawal beats freshness AND beats tier', async () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    await s.store(bundleOf([tool({ riskTier: 'general' })], ['HZ-HVCA-001']));
    assert.equal(s.read('HZ-HVCA-001').refusal, 'withdrawn-content-may-not-be-executed');
  });
});

describe('the pending queue', () => {
  test('a queued write is visible, never silently dropped', () => {
    const s = new BundleStore({ storage, now: at('2026-01-01T00:00:00Z') });
    s.queue({ kind: 'run', toolId: 'HZ-HVCA-001' });
    const pending = s.pending();
    assert.equal(pending.length, 1);
    assert.ok(pending[0].queuedAt, 'a queued item records when it was queued');
    assert.equal(
      pending[0].attempts,
      0,
      'attempts are tracked so a stuck item can be SHOWN to the user — a field user who lost ' +
        'completed work to a silent sync failure will not use the app again',
    );
  });
});
