import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'components/toast/toast';
import Loading from 'components/loading/LoadingComponent';
import { joinParty } from 'apps/anywhere/party/joinParty';
import { parseGroupId } from 'apps/anywhere/party/protocol';

export const Component = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        void joinParty(parseGroupId(groupId)).then(result => {
            if (result === 'ended') {
                toast('This party has ended');
                navigate('/home', { replace: true });
            }
            // on 'joined', SyncPlay starts the synced player itself
        });
    }, [groupId, navigate]);

    return <Loading />;
};
