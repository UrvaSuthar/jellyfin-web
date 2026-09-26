// The htmlvideoplayer plugin can tear down and recreate the <video> element
// mid-party (e.g. moving to the next item) without the OSD view itself being
// destroyed. Binding listeners directly to that element means they're left on
// a detached node after such a swap. Media events don't bubble, but they do
// pass through the capture phase, so callers bind this predicate on
// `document` with `{ capture: true }` instead of binding to the element.
export function isPartyVideoEvent(e: Event): boolean {
    return e.target instanceof HTMLVideoElement && e.target.classList.contains('htmlvideoplayer');
}

export function createBufferAnnouncer(send: (kind: 'wait' | 'ready') => void) {
    let stalled = false;
    return {
        onWaiting() {
            if (stalled) return;
            stalled = true;
            send('wait');
        },
        onPlaying() {
            if (!stalled) return;
            stalled = false;
            send('ready');
        }
    };
}
