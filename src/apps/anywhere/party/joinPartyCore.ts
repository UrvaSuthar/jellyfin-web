export interface JoinDeps {
    listGroups(): Promise<{ GroupId: string }[]>;
    join(id: string): Promise<unknown>;
}

export async function joinParty(groupId: string | null, deps: JoinDeps): Promise<'joined' | 'ended'> {
    if (!groupId) return 'ended';
    try {
        const groups = await deps.listGroups();
        if (!groups.some(g => g.GroupId === groupId)) return 'ended';
        await deps.join(groupId);
        return 'joined';
    } catch {
        return 'ended';
    }
}
