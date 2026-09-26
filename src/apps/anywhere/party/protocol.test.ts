import { describe, expect, it } from 'vitest';
import { buildInviteUrl, decode, encode, MAX_CHAT, parseGroupId, waitingText } from './protocol';

describe('encode/decode', () => {
    it('round-trips a chat message', () => {
        const e = encode({ kind: 'chat', from: 'mahiii', body: 'hi' });
        expect(e.Header).toBe('gw:chat');
        expect(e.TimeoutMs).toBe(1);
        expect(decode(e.Header, e.Text)).toEqual({ kind: 'chat', from: 'mahiii', body: 'hi' });
    });

    it('ignores non-party messages so normal toasts still work', () => {
        expect(decode('Server restarting', 'in 5 minutes')).toBeNull();
        expect(decode(undefined, 'x')).toBeNull();
    });

    it('rejects unknown kinds and bad JSON', () => {
        expect(decode('gw:hack', '{"from":"a","body":"b"}')).toBeNull();
        expect(decode('gw:chat', 'not json')).toBeNull();
        expect(decode('gw:chat', '{"from":5,"body":"b"}')).toBeNull();
    });

    it('caps chat length', () => {
        const m = decode('gw:chat', JSON.stringify({ from: 'a', body: 'x'.repeat(10000) }));
        expect(m?.body.length).toBe(MAX_CHAT);
    });

    it('keeps hostile text as plain text (rendering must not use HTML)', () => {
        const m = decode('gw:chat', JSON.stringify({ from: 'a', body: '<img src=x onerror=alert(1)>' }));
        expect(m?.body).toBe('<img src=x onerror=alert(1)>');
    });

    it('only accepts known reactions', () => {
        expect(decode('gw:react', '{"from":"a","body":"❤️"}')?.body).toBe('❤️');
        expect(decode('gw:react', '{"from":"a","body":"💩"}')).toBeNull();
    });
});

describe('invite links', () => {
    const id = '2198a24a-d64a-4284-98fe-a96bb65c966c';
    it('builds and parses', () => {
        expect(buildInviteUrl('https://x.ts.net', id)).toBe(`https://x.ts.net/web/#/party/${id}`);
        expect(parseGroupId(id)).toBe(id);
    });
    it('rejects junk ids', () => {
        expect(parseGroupId('../../etc')).toBeNull();
        expect(parseGroupId('')).toBeNull();
        expect(parseGroupId(undefined)).toBeNull();
    });
});

describe('waitingText', () => {
    it('names who we wait for', () => {
        expect(waitingText([])).toBe('Waiting for the group…');
        expect(waitingText(['mahiii'])).toBe('Waiting for mahiii…');
        expect(waitingText(['a', 'b'])).toBe('Waiting for a and b…');
        expect(waitingText(['a', 'b', 'c'])).toBe('Waiting for a and 2 others…');
    });
});
