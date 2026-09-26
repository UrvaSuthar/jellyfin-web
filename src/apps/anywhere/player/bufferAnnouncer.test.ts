import { describe, expect, it, vi } from 'vitest';
import { createBufferAnnouncer } from './bufferAnnouncer';

describe('createBufferAnnouncer', () => {
    it('sends one wait per stall and one ready after it', () => {
        const send = vi.fn();
        const a = createBufferAnnouncer(send);
        a.onWaiting();
        a.onWaiting();
        a.onWaiting();
        a.onPlaying();
        a.onPlaying();
        expect(send.mock.calls).toEqual([['wait'], ['ready']]);
    });
    it('does not send ready without a prior wait', () => {
        const send = vi.fn();
        createBufferAnnouncer(send).onPlaying();
        expect(send).not.toHaveBeenCalled();
    });
});
