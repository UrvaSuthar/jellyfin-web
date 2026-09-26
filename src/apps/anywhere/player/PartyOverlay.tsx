import React, { useCallback, useEffect, useState } from 'react';
import { sendToParty } from '../party/bus';
import { REACTIONS, waitingText, type PartyMsg } from '../party/protocol';
import { createBufferAnnouncer, isPartyVideoEvent } from './bufferAnnouncer';
import { usePartyState } from './usePartyState';
import './PartyOverlay.scss';

const initial = (name: string) => name.slice(0, 1).toUpperCase();

// ponytail: rendered via .map(renderChatLine) instead of an inline arrow so
// the JSX's key isn't structurally tied to the .map() call (matches the
// TextLines.tsx convention elsewhere in this codebase).
const renderChatLine = (m: PartyMsg, i: number) => (
    <div key={i}><b>{m.from}</b> {m.body}</div>
);

export default function PartyOverlay() {
    const s = usePartyState();
    const [picker, setPicker] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [draft, setDraft] = useState('');
    const inParty = s.participants.length > 0;

    useEffect(() => {
        if (!inParty) return;
        // anywhere: bind on document (capture phase) rather than the current
        // <video> element — the htmlvideoplayer plugin can swap in a fresh
        // element mid-party (e.g. next item) without this effect re-running,
        // which would otherwise leave the announcer on a detached node.
        const a = createBufferAnnouncer(kind => {
            void sendToParty(kind, '');
        });
        const onWaiting = (e: Event) => {
            if (isPartyVideoEvent(e)) a.onWaiting();
        };
        const onPlaying = (e: Event) => {
            if (isPartyVideoEvent(e)) a.onPlaying();
        };
        document.addEventListener('waiting', onWaiting, true);
        document.addEventListener('playing', onPlaying, true);
        return () => {
            document.removeEventListener('waiting', onWaiting, true);
            document.removeEventListener('playing', onPlaying, true);
        };
    }, [inParty]);

    const togglePicker = useCallback(() => setPicker(p => !p), []);
    const openChat = useCallback(() => setChatOpen(true), []);
    const closeChat = useCallback(() => setChatOpen(false), []);
    const onDraftChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value), []);
    const sendReaction = useCallback((emoji: string) => {
        void sendToParty('react', emoji);
        setPicker(false);
    }, []);
    const onSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setDraft(current => {
            const text = current.trim();
            if (!text) return current;
            void sendToParty('chat', text);
            return '';
        });
    }, []);

    if (!inParty) return null;

    return (
        <div className='anywhereParty'>
            <div className='anywhereParty-avatars' title={s.participants.join(', ')}>
                {s.participants.slice(0, 4).map(n => <span key={n} className='anywhereParty-avatar'>{initial(n)}</span>)}
                <span className='anywhereParty-chip'>👥 {s.participants.length}</span>
            </div>

            {s.groupState === 'Waiting' && (
                <div className='anywhereParty-waiting' role='status'>⏳ {waitingText(s.waiting)}</div>
            )}

            <div className='anywhereParty-bubbles'>
                {s.bubbles.map(b => (
                    <div key={b.id} className='anywhereParty-bubble'>
                        <span className='anywhereParty-avatar small'>{initial(b.msg.from)}</span>
                        {b.msg.body}
                    </div>
                ))}
            </div>

            {s.reactions.map(r => (
                <span key={r.id} className='anywhereParty-float' style={{ left: `${r.left}%` }}>{r.emoji}</span>
            ))}

            <div className='anywhereParty-actions'>
                <button type='button' className='anywhereParty-chip' onClick={togglePicker} aria-label='React'>😊</button>
                <button type='button' className='anywhereParty-chip' onClick={openChat} aria-label='Open chat'>💬</button>
                {picker && (
                    <div className='anywhereParty-picker'>
                        {REACTIONS.map(e => (
                            <button
                                type='button'
                                key={e}
                                // eslint-disable-next-line react/jsx-no-bind
                                onClick={() => sendReaction(e)}
                            >{e}</button>
                        ))}
                    </div>
                )}
            </div>

            {chatOpen && (
                <div className='anywhereParty-sheet' role='dialog' aria-label='Party chat'>
                    <div className='anywhereParty-sheetHead'>
                        <strong>Watch party</strong>
                        <button type='button' onClick={closeChat} aria-label='Close chat'>✕</button>
                    </div>
                    <div className='anywhereParty-log'>
                        {s.chatLog.map(renderChatLine)}
                    </div>
                    <form onSubmit={onSubmit}>
                        <input value={draft} maxLength={500} onChange={onDraftChange} placeholder='Message…' aria-label='Message' />
                    </form>
                </div>
            )}
        </div>
    );
}
