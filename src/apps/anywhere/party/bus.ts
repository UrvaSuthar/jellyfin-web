import { ServerConnections } from 'lib/jellyfin-apiclient';
import Events from 'utils/events';
import { emitPartyMessage, onPartyMessage } from './events';
import { decode, encode, type PartyKind } from './protocol';
import { relayUrl } from './relayUrl';
import { getSyncPlayManager } from './syncPlay';

export { onPartyMessage, emitPartyMessage };

let socket: WebSocket | null = null;
let socketGroup: string | null = null;
let myName = 'You';
let watching = false;

function syncRelay(): void {
    const groupId = getSyncPlayManager()?.getGroupInfo()?.GroupId ?? null;
    if (groupId === socketGroup) return;
    const old = socket;
    socket = null;
    socketGroup = groupId;
    old?.close();
    const apiClient = ServerConnections.currentApiClient();
    if (!groupId || !apiClient) return;

    void apiClient.getCurrentUser().then((u: { Name?: string | null }) => {
        myName = u.Name ?? 'You';
    });
    const ws = new WebSocket(relayUrl(apiClient.serverAddress(), apiClient.accessToken(), groupId));
    ws.onmessage = e => {
        try {
            const frame = JSON.parse(String(e.data)) as { Header?: string; Text?: string };
            const msg = decode(frame.Header, frame.Text);
            if (msg) emitPartyMessage(msg);
        } catch {
            // ignore junk frames
        }
    };
    ws.onclose = () => {
        if (socket !== ws) return;
        socket = null;
        socketGroup = null;
        setTimeout(syncRelay, 3000); // ponytail: fixed 3 s retry, add backoff if a dead server ever floods logs
    };
    socket = ws;
}

export function startRelayWatcher(): void {
    const manager = getSyncPlayManager();
    if (!manager) return;
    if (!watching) {
        Events.on(manager, 'enabled', syncRelay);
        watching = true;
    }
    syncRelay();
}

export async function sendToParty(kind: PartyKind, body: string): Promise<void> {
    syncRelay();
    // ponytail: frames sent while (re)connecting are dropped; chat is ephemeral by design
    if (socket?.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(encode({ kind, from: myName, body })));
    if (kind === 'chat' || kind === 'react') emitPartyMessage({ kind, from: myName, body });
}
