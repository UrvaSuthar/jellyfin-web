export function relayUrl(serverAddress: string, token: string, groupId: string): string {
    const base = serverAddress.endsWith('/') ? serverAddress : serverAddress + '/';
    // eslint-disable-next-line compat/compat
    const url = new URL('PartyRelay/ws', base);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.searchParams.set('api_key', token);
    url.searchParams.set('groupId', groupId);
    return url.toString();
}
