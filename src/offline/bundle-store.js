/**
 * The offline store — ★ R1 E6–E9.
 *
 * ============================================================================
 * THE MOST SAFETY-SENSITIVE CODE IN THIS APP
 * ============================================================================
 *
 * This app supports preparedness work AWAY FROM A DESK — readiness rounds,
 * walkthroughs, audits, drill preparation. That work genuinely happens in
 * corridors, on phones, at odd hours, with poor signal.
 *
 * It is NOT for use during a live incident. But the same offline capability that
 * makes it useful in a corridor is what makes a WITHDRAWN INSTRUCTION dangerous:
 * a device that has not synced for weeks will happily serve content that was
 * pulled for a reason.
 *
 * So expiry here is RISK-TIERED, and the withdrawal list is honoured BEFORE
 * content is served — regardless of how old the bundle is.
 *
 * Enforcement mechanism E14.
 */

import { offlineAvailability } from '@citadel/contracts/rules';

const KEY_BUNDLE = 'citadel.bundle.v1';
const KEY_WITHDRAWN = 'citadel.withdrawn.v1';
const KEY_QUEUE = 'citadel.queue.v1';

/**
 * Local storage is a CACHE and a PENDING-WRITE QUEUE. Never authoritative.
 *
 * The temptation is to give the field app its own store "for offline". That produces two sources of
 * truth and a sync problem. The queue drains and then holds nothing.
 */
export class BundleStore {
  #storage;
  #now;

  constructor({ storage = globalThis.localStorage, now = () => new Date() } = {}) {
    this.#storage = storage;
    this.#now = now;
  }

  #read(key) {
    const raw = this.#storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  #write(key, value) {
    this.#storage?.setItem(key, JSON.stringify(value));
  }

  /**
   * Store a downloaded bundle, verifying its integrity first.
   *
   * A bundle that fails its checksum is REFUSED, not stored with a warning — content whose integrity
   * cannot be established is worse than no content, because it looks authoritative.
   */
  async store(bundle, { verify = true } = {}) {
    if (verify) {
      const actual = await sha256(JSON.stringify(bundle.tools));
      if (actual !== bundle.checksum) {
        return { ok: false, refusal: 'bundle-integrity-failed', expected: bundle.checksum, actual };
      }
    }
    this.#write(KEY_BUNDLE, { ...bundle, cachedAt: this.#now().toISOString() });
    // The withdrawal list travels WITH the bundle and is stored separately, so a
    // later sync can update it even if the bundle itself is not refreshed.
    this.#write(KEY_WITHDRAWN, bundle.withdrawalList ?? []);
    return { ok: true, tools: bundle.tools.length };
  }

  /** Update the withdrawal list on ANY contact — cheaper than a full bundle, and more urgent. */
  syncWithdrawalList(ids) {
    this.#write(KEY_WITHDRAWN, ids);
  }

  get cachedAt() {
    const b = this.#read(KEY_BUNDLE);
    return b ? new Date(b.cachedAt) : null;
  }

  get catalogueVersion() {
    return this.#read(KEY_BUNDLE)?.catalogueVersion ?? null;
  }

  /** How old is the cached copy? ALWAYS shown to the user — never inferred silently. */
  ageDays() {
    const at = this.cachedAt;
    return at ? (this.#now() - at) / 86_400_000 : null;
  }

  /**
   * ★ Read a tool from the cache, applying the risk-tiered expiry rule.
   *
   * Returns the availability decision, never a bare tool — the caller must render
   * WHY something is unavailable, not merely that it is.
   */
  read(toolId) {
    const bundle = this.#read(KEY_BUNDLE);
    if (!bundle) return { available: false, reason: 'no-bundle' };

    const tool = bundle.tools.find((t) => t.id === toolId);
    if (!tool) return { available: false, reason: 'not-in-bundle' };

    const withdrawn = new Set(this.#read(KEY_WITHDRAWN) ?? []);

    // The rule lives in `contracts` because checklist-app must apply it and
    // checklist-api must agree with it. A rule implemented on both sides of a
    // service boundary diverges, and both copies look correct.
    const decision = offlineAvailability(tool, new Date(bundle.cachedAt), this.#now(), withdrawn);
    return { ...decision, tool, catalogueVersion: bundle.catalogueVersion };
  }

  /** Everything readable right now, with each one's availability decision attached. */
  list() {
    const bundle = this.#read(KEY_BUNDLE);
    if (!bundle) return [];
    return bundle.tools.map((t) => ({ ...this.read(t.id), tool: t }));
  }

  /**
   * A queued write that cannot sync is VISIBLE to the user, never silently dropped.
   *
   * A field user who completed work and lost it to a silent sync failure will not use the app again.
   * (R1 records nothing — runs arrive at R2 — but the queue exists now so the failure mode is
   * designed rather than discovered.)
   */
  queue(item) {
    const q = this.#read(KEY_QUEUE) ?? [];
    q.push({ ...item, queuedAt: this.#now().toISOString(), attempts: 0 });
    this.#write(KEY_QUEUE, q);
    return q.length;
  }
  pending() {
    return this.#read(KEY_QUEUE) ?? [];
  }
}

async function sha256(text) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(text).digest('hex');
}
