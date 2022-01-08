import express from 'express';
import { getBlock, applyBlocks } from '../../storage/startStorage';
import { fetchBlock, getClient, ingress } from '../../ton/ingress';
import { warn } from "../../utils/log";

export function handleGetBlock(): express.RequestHandler {
    return async (req, res) => {
        try {
            const seqno = parseInt(req.params.seqno, 10);

            // Get from cache
            let storedBlock = await getBlock(seqno);
            if (storedBlock) {
                res.status(200).send({
                    exist: true,
                    shards: storedBlock
                });
                return;
            }

            // Check if seqno is valid
            if (seqno <= 0) {
                res.status(200).send({
                    exist: false
                });
            }
            const lastSeqno = (await getClient(ingress.clients).getMasterchainInfo()).latestSeqno;
            if (seqno > lastSeqno) {
                res.status(200).send({
                    exist: false
                });
            }

            // Get from backend
            let fetched = await fetchBlock(seqno, [ingress.historical]);

            // Apply to cache
            await applyBlocks([{ seq: fetched[0].seqno, data: fetched }]);

            // Return data
            res.status(200).send({
                exist: true,
                shards: fetched
            });
        } catch (e) {
            warn(e);
            res.status(500).send('500 Internal Error');
        }
    };
}