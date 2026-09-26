import { describe, expect, it, vi } from 'vitest';
import { joinParty } from './joinPartyCore';

const id = '2198a24a-d64a-4284-98fe-a96bb65c966c';

describe('joinParty', () => {
    it('joins an existing group', async () => {
        const join = vi.fn().mockResolvedValue(undefined);
        const r = await joinParty(id, { listGroups: async () => [{ GroupId: id }], join });
        expect(r).toBe('joined');
        expect(join).toHaveBeenCalledWith(id);
    });
    it('reports ended for missing groups and junk ids without calling join', async () => {
        const join = vi.fn();
        expect(await joinParty(id, { listGroups: async () => [], join })).toBe('ended');
        expect(await joinParty(null, { listGroups: async () => [{ GroupId: id }], join })).toBe('ended');
        expect(join).not.toHaveBeenCalled();
    });
    it('reports ended when the server refuses', async () => {
        const join = vi.fn().mockRejectedValue(new Error('403'));
        expect(await joinParty(id, { listGroups: async () => [{ GroupId: id }], join })).toBe('ended');
    });
});
