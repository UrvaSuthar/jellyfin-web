export type PartyKind = 'chat' | 'react' | 'wait' | 'ready';

export interface PartyMsg {
    kind: PartyKind;
    from: string;
    body: string;
}

export const REACTIONS = ['😂', '😭', '❤️', '🔥', '👏'] as const;
export const MAX_CHAT = 500;

const PREFIX = 'gw:';
const KINDS: readonly PartyKind[] = ['chat', 'react', 'wait', 'ready'];
const GUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export function encode(msg: PartyMsg) {
    return {
        Header: PREFIX + msg.kind,
        Text: JSON.stringify({ from: msg.from, body: msg.body.slice(0, MAX_CHAT) }),
        TimeoutMs: 1
    };
}

export function decode(header: string | null | undefined, text: string | null | undefined): PartyMsg | null {
    if (!header?.startsWith(PREFIX) || !text) return null;
    const kind = header.slice(PREFIX.length) as PartyKind;
    if (!KINDS.includes(kind)) return null;
    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        return null;
    }
    const { from, body } = (data ?? {}) as { from?: unknown; body?: unknown };
    if (typeof from !== 'string' || typeof body !== 'string') return null;
    if (kind === 'react' && !(REACTIONS as readonly string[]).includes(body)) return null;
    return { kind, from: from.slice(0, 64), body: body.slice(0, MAX_CHAT) };
}

export function buildInviteUrl(origin: string, groupId: string): string {
    return `${origin}/web/#/party/${groupId}`;
}

export function parseGroupId(raw: string | null | undefined): string | null {
    return raw && GUID.test(raw) ? raw : null;
}

export function waitingText(names: string[]): string {
    if (names.length === 0) return 'Waiting for the group…';
    if (names.length === 1) return `Waiting for ${names[0]}…`;
    if (names.length === 2) return `Waiting for ${names[0]} and ${names[1]}…`;
    return `Waiting for ${names[0]} and ${names.length - 1} others…`;
}
