import type { PartyMsg } from '../party/protocol';

// ponytail: split out of usePartyState.ts so vitest (which can't resolve bare
// app specifiers like `utils/events`) can import the pure reducer directly.

export interface Bubble { id: number; msg: PartyMsg }
export interface Floating { id: number; emoji: string; left: number }

export interface PartyState {
    participants: string[];
    groupState: string;
    waiting: string[];
    bubbles: Bubble[];
    reactions: Floating[];
    chatLog: PartyMsg[];
}

export type PartyAction =
    | { type: 'message'; msg: PartyMsg; id: number; now: number }
    | { type: 'groupState'; state: string }
    | { type: 'participants'; names: string[] }
    | { type: 'expire'; id: number };

export const initialPartyState: PartyState = {
    participants: [], groupState: 'Idle', waiting: [], bubbles: [], reactions: [], chatLog: []
};

export function partyReducer(s: PartyState, a: PartyAction): PartyState {
    switch (a.type) {
        case 'participants':
            return { ...s, participants: a.names };
        case 'groupState':
            return { ...s, groupState: a.state, waiting: a.state === 'Playing' ? [] : s.waiting };
        case 'expire':
            return {
                ...s,
                bubbles: s.bubbles.filter(b => b.id !== a.id),
                reactions: s.reactions.filter(r => r.id !== a.id)
            };
        case 'message': {
            const { msg, id } = a;
            if (msg.kind === 'wait') {
                return s.waiting.includes(msg.from) ? s : { ...s, waiting: [...s.waiting, msg.from] };
            }
            if (msg.kind === 'ready') return { ...s, waiting: s.waiting.filter(n => n !== msg.from) };
            if (msg.kind === 'react') {
                return { ...s, reactions: [...s.reactions, { id, emoji: msg.body, left: 70 + (id % 25) }] };
            }
            return { ...s, bubbles: [...s.bubbles, { id, msg }].slice(-3), chatLog: [...s.chatLog, msg] };
        }
    }
}
