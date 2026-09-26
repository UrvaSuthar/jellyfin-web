import { describe, expect, it, vi } from 'vitest';
import { emitPartyMessage, onPartyMessage } from './events';
import { relayUrl } from './relayUrl';

describe('relayUrl', () => {
    const g = '2198a24a-d64a-4284-98fe-a96bb65c966c';
    it('uses wss for https servers (Funnel) and ws for http', () => {
        expect(relayUrl('https://x.ts.net', 'tok', g)).toBe(`wss://x.ts.net/PartyRelay/ws?api_key=tok&groupId=${g}`);
        expect(relayUrl('http://localhost:8097', 'tok', g)).toBe(`ws://localhost:8097/PartyRelay/ws?api_key=tok&groupId=${g}`);
    });
    it('keeps a base path and tolerates a trailing slash', () => {
        expect(relayUrl('https://h/jellyfin/', 't', g)).toBe(`wss://h/jellyfin/PartyRelay/ws?api_key=t&groupId=${g}`);
        expect(relayUrl('https://h/jellyfin', 't', g)).toBe(`wss://h/jellyfin/PartyRelay/ws?api_key=t&groupId=${g}`);
    });
    it('escapes the token', () => {
        // eslint-disable-next-line sonarjs/no-clear-text-protocols -- exercising the plain-http branch
        expect(relayUrl('http://h', 'a&b', g)).toContain('api_key=a%26b');
    });
});

describe('event bus', () => {
    it('delivers to subscribers and unsubscribes', () => {
        const cb = vi.fn();
        const off = onPartyMessage(cb);
        emitPartyMessage({ kind: 'chat', from: 'a', body: 'hi' });
        off();
        emitPartyMessage({ kind: 'chat', from: 'a', body: 'again' });
        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb).toHaveBeenCalledWith({ kind: 'chat', from: 'a', body: 'hi' });
    });
});
