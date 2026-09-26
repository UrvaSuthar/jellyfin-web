import { ServerConnections } from 'lib/jellyfin-apiclient';
import { joinParty as joinPartyCore, type JoinDeps } from './joinPartyCore';

export type { JoinDeps };

const defaultDeps = (): JoinDeps => {
    // anywhere: currentApiClient() is typed ApiClient|undefined; joinPartyCore's try/catch
    // turns a missing client into 'ended', so a non-null assertion here is safe.
    const apiClient = ServerConnections.currentApiClient()!;
    return {
        // getSyncPlayGroups() resolves to the raw fetch Response here (see
        // groupSelectionMenu.js), not the parsed array the apiclient.d.ts ambient type claims.
        listGroups: async () => ((await apiClient.getSyncPlayGroups()) as unknown as Response).json(),
        join: id => apiClient.joinSyncPlayGroup({ GroupId: id })
    };
};

export function joinParty(groupId: string | null, deps: JoinDeps = defaultDeps()): Promise<'joined' | 'ended'> {
    return joinPartyCore(groupId, deps);
}
