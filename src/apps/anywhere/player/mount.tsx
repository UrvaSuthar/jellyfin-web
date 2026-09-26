import React from 'react';
import { createRoot } from 'react-dom/client';
import PartyOverlay from './PartyOverlay';

export function mountPartyOverlay(el: HTMLElement): () => void {
    const root = createRoot(el);
    root.render(<PartyOverlay />);
    return () => root.unmount();
}
