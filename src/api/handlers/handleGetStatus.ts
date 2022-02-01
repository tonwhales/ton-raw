import express from 'express';
import { getSyncState } from '../../storage/startStorage';
import { warn } from "../../utils/log";

export function handleGetStatus(): express.RequestHandler {
    return async (req, res) => {
        try {
            let fresh = await getSyncState('blocks_fresh');
            let historic = await getSyncState('blocks_historic');
            res.status(200)
                .set('Cache-Control', 'public, must-revalidate, max-age=5')
                .send({
                    seq_fresh: parseInt(fresh || '0', 10),
                    seq_historic: parseInt(historic || '0', 10)
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