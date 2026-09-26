import { describe, expect, it, vi } from 'vitest';
import { createBufferAnnouncer, isPartyVideoEvent } from './bufferAnnouncer';

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

describe('isPartyVideoEvent', () => {
    it('is true for a video.htmlvideoplayer target', () => {
        const video = document.createElement('video');
        video.classList.add('htmlvideoplayer');
        expect(isPartyVideoEvent({ target: video } as unknown as Event)).toBe(true);
    });
    it('is false for a video without the htmlvideoplayer class', () => {
        const video = document.createElement('video');
        expect(isPartyVideoEvent({ target: video } as unknown as Event)).toBe(false);
    });
    it('is false for a non-video element', () => {
        const div = document.createElement('div');
        div.classList.add('htmlvideoplayer');
        expect(isPartyVideoEvent({ target: div } as unknown as Event)).toBe(false);
    });
});
