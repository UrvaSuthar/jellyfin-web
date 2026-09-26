import { useEffect, useReducer } from 'react';
import Events from 'utils/events';
import { onPartyMessage, startRelayWatcher } from '../party/bus';
import { getSyncPlayManager } from '../party/syncPlay';
import { initialPartyState, partyReducer } from './partyReducer';

export type { Bubble, Floating, PartyAction, PartyState } from './partyReducer';
export { initialPartyState, partyReducer } from './partyReducer';

let nextId = 1;

export function usePartyState() {
    const [state, dispatch] = useReducer(partyReducer, initialPartyState);

    useEffect(() => {
        startRelayWatcher(); // connect to PartyRelay for the current group (idempotent)
        const manager = getSyncPlayManager();
        const refresh = () => dispatch({ type: 'participants', names: manager?.getGroupInfo()?.Participants ?? [] });
        const onState = (_e: unknown, groupState: string) => {
            dispatch({ type: 'groupState', state: groupState });
            refresh();
        };
        refresh();
        if (manager) {
            Events.on(manager, 'group-state-update', onState);
            Events.on(manager, 'enabled', refresh);
        }
        const off = onPartyMessage(msg => {
            const id = nextId++;
            dispatch({ type: 'message', msg, id, now: Date.now() });
            if (msg.kind === 'chat' || msg.kind === 'react') {
                setTimeout(() => dispatch({ type: 'expire', id }), msg.kind === 'chat' ? 6000 : 2500);
            }
        });
        const poll = setInterval(refresh, 5000); // ponytail: Participants has no change event for GroupUpdate; poll is cheap
        return () => {
            off();
            clearInterval(poll);
            if (manager) {
                Events.off(manager, 'group-state-update', onState);
                Events.off(manager, 'enabled', refresh);
            }
        };
    }, []);

    return state;
}
