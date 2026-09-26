import { pluginManager } from 'components/pluginManager';
import { PluginType } from 'types/plugin';

export interface SyncPlayGroupInfo {
    GroupId: string;
    GroupName?: string;
    Participants?: string[];
    State?: string;
}

export interface SyncPlayManager {
    isSyncPlayEnabled(): boolean;
    getGroupInfo(): SyncPlayGroupInfo | null;
    getController(): { play(options: { ids: string[] }): Promise<unknown> };
}

export function getSyncPlayManager(): SyncPlayManager | undefined {
    return pluginManager.firstOfType(PluginType.SyncPlay)?.instance?.Manager as SyncPlayManager | undefined;
}
