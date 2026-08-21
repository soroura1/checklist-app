import { createRoot } from 'react-dom/client';

/**
 * ⛔ SCAFFOLDING. THERE IS NO APPLICATION HERE YET.
 *
 * This repository was reset to its engineering and deployment infrastructure on
 * 2026-08-21, alongside `citadel` and `contracts`. The offline field client,
 * its surfaces, its locales and its tests were deleted deliberately, to be
 * rebuilt one reviewed step at a time.
 *
 * ⚠️ THIS FILE EXISTS BECAUSE VITE NEEDS AN ENTRY, AND FOR NO OTHER REASON.
 * `index.html` names it; without it `npm run build` fails and the pipeline goes
 * red for a reason that has nothing to do with the code.
 *
 * ⚠️ AND A BLANK PAGE IS AMBIGUOUS. This project has already paid for that
 * once — a production page rendered blank on 17 August while the build
 * succeeded and every check agreed, because nothing executed the page. So this
 * says what it is rather than leaving a reader to choose between "not built
 * yet" and "broken".
 */
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <main data-scaffolding="true">
      <p>This client is being rebuilt. There is nothing to use here yet.</p>
    </main>,
  );
}
