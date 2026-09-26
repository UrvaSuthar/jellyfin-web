import type { PartyMsg } from './protocol';

// ponytail: split out of bus.ts so this stays importable without pulling in
// lib/jellyfin-apiclient / components/pluginManager (bare-specifier imports
// vitest can't resolve without webpack's `modules` config; bus.ts re-exports
// these for real consumers).
const target = new EventTarget();

export function onPartyMessage(cb: (m: PartyMsg) => void): () => void {
    const listener = (e: Event) => cb((e as CustomEvent<PartyMsg>).detail);
    target.addEventListener('party', listener);
    return () => target.removeEventListener('party', listener);
}

export function emitPartyMessage(m: PartyMsg): void {
    target.dispatchEvent(new CustomEvent('party', { detail: m }));
}
