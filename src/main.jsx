import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { EntryScreen } from './features/entry/EntryScreen.jsx';
import { Navigation } from './layout/navigation.jsx';
import { BundleStore } from './offline/bundle-store.js';
import { SURFACES } from './surfaces.js';
import { setLocale, t } from './locales/index.js';

setLocale('en');
const store = new BundleStore();

/** Cached age is ALWAYS visible — never inferred silently by the user. */
function CachedAge() {
  const days = store.ageDays();
  return <p>{days === null ? t('offline.none') : t('offline.cached_age').replace('{days}', Math.round(days))}</p>;
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const surface = SURFACES.find((s) => s.path === path) ?? SURFACES[0];
  const go = (p) => { window.history.pushState({}, '', p); setPath(p); };

  return (
    <>
      <Navigation onNavigate={go} />
      {surface.id === 'entry' && <EntryScreen onContinue={() => go('/find')} />}
      {surface.id === 'find' && <main><h1>{t('find.heading')}</h1><CachedAge /></main>}
      {surface.id === 'tool' && <main><h1>{t('surface.tool.title')}</h1><CachedAge /></main>}
      {surface.id === 'offline' && <main><h1>{t('offline.heading')}</h1><CachedAge /></main>}
    </>
  );
}
createRoot(document.getElementById('root')).render(<App />);
