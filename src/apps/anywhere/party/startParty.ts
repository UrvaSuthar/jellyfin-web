import toast from 'components/toast/toast';
import Events from 'utils/events';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import { copy } from 'scripts/clipboard';
import { buildInviteUrl } from './protocol';
import { getSyncPlayManager } from './syncPlay';

async function shareInvite(url: string) {
    try {
        if (navigator.share) {
            await navigator.share({ title: 'Watch with me', url });
            return;
        }
        await copy(url); // anywhere: reuses the existing clipboard fallback chain
        toast('Invite link copied');
    } catch {
        toast(url); // ponytail: last resort, user copies it by hand
    }
}

export async function startParty(item: { Id: string; Name?: string }): Promise<void> {
    const apiClient = ServerConnections.currentApiClient();
    const manager = getSyncPlayManager();
    if (!apiClient || !manager) {
        toast('Watch together is not available');
        return;
    }
    const user = await apiClient.getCurrentUser();
    const joined = new Promise<void>(resolve => {
        const onEnabled = (_e: unknown, enabled: boolean) => {
            if (!enabled) return;
            Events.off(manager, 'enabled', onEnabled);
            resolve();
        };
        Events.on(manager, 'enabled', onEnabled);
    });
    await apiClient.createSyncPlayGroup({ GroupName: `${user.Name}'s party` });
    await joined;
    const groupId = manager.getGroupInfo()?.GroupId;
    await manager.getController().play({ ids: [item.Id] });
    if (groupId) await shareInvite(buildInviteUrl(window.location.origin, groupId));
}
