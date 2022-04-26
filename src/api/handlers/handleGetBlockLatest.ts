import express from 'express';
import { getSyncState } from '../../storage/startStorage';
import { warn } from "../../utils/log";

export function handleGetBlockLatest(): express.RequestHandler {
    return async (req, res) => {
        try {
            let state = await getSyncState('blocks_simple');
            if (!state) {
                res.status(500).send('500 Internal Error');
                return;
            }
            res.status(200)
                .set('Cache-Control', 'public, must-revalidate, max-age=5')
                .send({
                    seqno: parseInt(state, 10)
                });
        } catch (e) {
            warn(e);
            try {
                res.status(500).send('500 Internal Error');
            } catch (e) {
                warn(e);
            }
        }
    };
}