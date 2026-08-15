import { t } from '../../locales/index.js';

/**
 * Entry — enforcement mechanism E1.
 *
 * States the purpose and the four boundary exclusions BEFORE any credential decision. "Before" is
 * literal: not on a page reached after signing in, and not behind a link.
 *
 * This app's use context makes that especially load-bearing. It supports preparedness work away
 * from a desk — and the same offline capability that makes it useful in a corridor is what could
 * make it look like an operational tool. The boundary must arrive first.
 */
export function EntryScreen({ onContinue }) {
  return (
    <main>
      <h1>{t('entry.heading')}</h1>
      <p>{t('entry.lede')}</p>
      <section aria-labelledby="boundary">
        <h2 id="boundary">{t('boundary.heading')}</h2>
        <p><strong>{t('boundary.statement')}</strong></p>
        <p>{t('boundary.not_intro')}</p>
        <ul>
          <li>{t('boundary.not_1')}</li>
          <li>{t('boundary.not_2')}</li>
          <li>{t('boundary.not_3')}</li>
          <li>{t('boundary.not_4')}</li>
        </ul>
      </section>
      <button type="button" onClick={onContinue}>{t('entry.continue')}</button>
    </main>
  );
}
