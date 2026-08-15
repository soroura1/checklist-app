import { navigableSurfaces } from '../surfaces.js';
import { t } from '../locales/index.js';

/**
 * DERIVED from the surface inventory, never hand-written.
 *
 * A hand-written navigation bar and an inventory drift, and the drift is invisible — which is how
 * the prior attempt shipped six screens nobody could reach.
 */
export function Navigation({ onNavigate }) {
  return (
    <nav aria-label={t('nav.label')}>
      <ul>
        {navigableSurfaces().map((s) => (
          <li key={s.id}>
            <a href={s.path} onClick={(e) => { e.preventDefault(); onNavigate?.(s.path); }}>
              {t(`surface.${s.id}.title`)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
