/**
 * The surface inventory — the same discipline as `citadel`.
 *
 * IMPLEMENTED ≠ ROUTED ≠ REACHABLE ≠ DEPLOYED. Three tests read this, each
 * catching what the others cannot.
 */
export const SURFACES = [
  { id: 'entry', path: '/', title: 'Entry', status: 'reachable', inNavigation: false,
    reason: 'The front door. Not in navigation because you arrive here — and it states the scope boundary BEFORE any credential decision.',
    release: 'R1' },
  { id: 'find', path: '/find', title: 'Find a checklist', status: 'reachable', inNavigation: true,
    reason: 'Search and filter across every taxonomy axis.', release: 'R1' },
  { id: 'tool', path: '/tool', title: 'Read a checklist', status: 'reachable', inNavigation: true,
    reason: 'Read, print, export a reference. Shows cached age and any execution refusal.', release: 'R1' },
  { id: 'offline', path: '/offline', title: 'Offline content', status: 'reachable', inNavigation: true,
    reason: 'Download a bundle, see its age, see what has been withdrawn.', release: 'R1' },
];

/** R1 is READ-ONLY. These need a facility seat, which arrives with identity at R2. */
export const PLANNED_SURFACES = [
  { id: 'run',     title: 'Run a checklist',  release: 'R2', needs: 'a facility seat' },
  { id: 'history', title: 'Facility history', release: 'R2', needs: 'a facility seat' },
  { id: 'adapt',   title: 'Local adaptation', release: 'R2', needs: 'a facility seat' },
];

export const navigableSurfaces = () => SURFACES.filter((s) => s.inNavigation);
export const reachableSurfaces = () => SURFACES.filter((s) => s.status === 'reachable');
export const surfaceByPath = (p) => SURFACES.find((s) => s.path === p);
