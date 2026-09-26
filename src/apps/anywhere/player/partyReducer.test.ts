import { describe, expect, it } from 'vitest';
import { initialPartyState, partyReducer } from './partyReducer';

const msg = (kind: 'chat' | 'react' | 'wait' | 'ready', from: string, body = '') => ({ type: 'message' as const, msg: { kind, from, body }, id: Math.random(), now: 0 });

describe('partyReducer', () => {
    it('tracks who we are waiting for', () => {
        let s = partyReducer(initialPartyState, msg('wait', 'mahiii'));
        expect(s.waiting).toEqual(['mahiii']);
        s = partyReducer(s, msg('wait', 'mahiii'));
        expect(s.waiting).toEqual(['mahiii']);
        s = partyReducer(s, msg('ready', 'mahiii'));
        expect(s.waiting).toEqual([]);
    });

    it('clears waiting when the group plays again even if a ready was lost', () => {
        let s = partyReducer(initialPartyState, msg('wait', 'mahiii'));
        s = partyReducer(s, { type: 'groupState', state: 'Playing' });
        expect(s.waiting).toEqual([]);
    });

    it('keeps at most 3 bubbles and full chat log', () => {
        let s = initialPartyState;
        for (const t of ['1', '2', '3', '4']) s = partyReducer(s, msg('chat', 'a', t));
        expect(s.bubbles.map(b => b.msg.body)).toEqual(['2', '3', '4']);
        expect(s.chatLog).toHaveLength(4);
    });

    it('expires bubbles and reactions', () => {
        let s = partyReducer(initialPartyState, msg('chat', 'a', 'hi'));
        s = partyReducer(s, msg('react', 'a', '❤️'));
        s = partyReducer(s, { type: 'expire', id: s.bubbles[0].id });
        s = partyReducer(s, { type: 'expire', id: s.reactions[0].id });
        expect(s.bubbles).toEqual([]);
        expect(s.reactions).toEqual([]);
    });
});
