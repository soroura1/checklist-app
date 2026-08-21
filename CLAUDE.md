# `checklist-app` — status

**Last updated:** 2026-08-21 · ⛔ **RESET TO INFRASTRUCTURE. THERE IS NO APPLICATION HERE.**

On **2026-08-21** the owner chose to start the product over. The offline field client was deleted
from this repository — its entry, its surfaces inventory, its layout, its locales, the offline
bundle store and all three test files.

What remains is the build, the pipeline, the repository check and the governance files, plus two
scaffolding files that say so in their own first lines: `src/main.jsx`, because vite needs an entry,
and `test/smoke.test.js`, because the pipeline runs `npm test` and a missing glob is a red pipeline.

★ **The smoke test earned its place on its first run.** It asserts that `src/` contains nothing but
the entry — and it failed immediately, because `git rm -r` had left `src/features` behind as an
empty directory. A trivial test that fails when it should is worth more than a thorough one nobody
watches.

⚠️ **The contracts pin still resolves.** This repository pins `@citadel/contracts#v0.2.1`, a tag, and
a tag is immutable — so resetting `contracts` on `main` cannot reach it.

---

**Last updated:** 2026-08-17 · R1 code built, **undeployed**
**Topology:** [`../CLAUDE.md`](../CLAUDE.md) — no port allocated yet. **Do not guess one.**

## The standalone field client

Read-only in R1. Reads the same catalogue as `citadel`, through the same contract.

## ★ Its cache policy differs from `citadel`'s. Do not unify them.

| | |
|---|---|
| **`checklist-app`** browsing a checklist | **Serves stale, and states its age** |
| **`citadel`** giving a capability recommendation | **Refuses stale** |

**A stale checklist is still useful in the field. A stale recommendation is misleading.** The
inconsistency **is** the design, and the reasoning lives beside the code so a later engineer does not
tidy it away.

## Offline — risk-tiered expiry (`E14`)

| Tier | Behaviour when the bundle is stale |
|---|---|
| `general` | Warns and continues |
| `high` | **Stops** |

⚠️ **The withdrawal list is honoured BEFORE content is served**, not after. Withdrawn content stays
**readable** — the record matters — and stops being **executable**.

The bundle carries a checksum and is integrity-checked on load.

## Not in R1

Runs, local adaptation and sync are **R2** — they need a facility seat. Schema and code for them must
not appear here early; a table created for a feature two releases away quietly claims a name the
future needs.

```bash
export PATH="/opt/homebrew/opt/node@26/bin:$PATH"
npm test && ./check-repo.sh
```
