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
