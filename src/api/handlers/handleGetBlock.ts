import express from 'express';
import { getBlock, applyBlocks } from '../../storage/startStorage';
import { fetchBlock, client } from '../../ton/ingress';
import { warn } from "../../utils/log";

export function handleGetBlock(): express.RequestHandler {
    return async (req, res) => {
        try {
            const seqno = parseInt(req.params.seqno, 10);

            // Check if seqno is valid
            if (seqno <= 0) {
                res.status(200)
                    .set('Cache-Control', 'public, max-age=31536000')
                    .send({
                        exist: false
                    });
            }

            // Get from cache
            let storedBlock = await getBlock(seqno);
            if (storedBlock) {
                res.status(200)
                    .set('Cache-Control', 'public, max-age=31536000')
                    .send({
                        exist: true,
                        shards: storedBlock
                    });
                return;
            }

            // Check if seqno is valid
            const lastSeqno = (await client.getMasterchainInfo()).latestSeqno;
            if (seqno > lastSeqno) {
                res.status(200)
                    .set('Cache-Control', 'public, max-age=5')
                    .send({
                        exist: false
                    });
            }

            // Get from backend
            let fetched = await fetchBlock(seqno);

            // Apply to cache
            await applyBlocks([{ seq: fetched[0].seqno, data: fetched }]);

            // Return data
            res.status(200)
                .set('Cache-Control', 'public, max-age=31536000')
                .send({
                    exist: true,
                    shards: fetched
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