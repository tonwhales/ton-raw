import express from 'express';
import { warn } from "../../utils/log";
import { Address } from "ton";
import { client } from "../../ton/ingress";
import { applyTransactions, getTransactions } from '../../storage/startStorage';

export function handleGetTransactions(): express.RequestHandler {
    return async (req, res) => {
        try {

            // Parse address
            const address = Address.parse(req.params.address);
            if (typeof req.query.lt !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }
            if (typeof req.query.hash !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }
            if (typeof req.query.limit !== 'string') {
                res.status(400).send('400 Bad Request');
                return;
            }

            let lt = req.query.lt;
            let hash = req.query.hash;
            let limit = parseInt(req.query.limit);
            if (limit < 10 || limit > 100) {
                res.status(400).send('400 Bad Request');
                return;
            }


            // Fetch from storage
            let stored = await getTransactions(address, lt, Math.max(10, limit));
            if (stored.end || stored.items.length >= limit) {
                res.status(200).send({ transactions: stored.items });
                return;
            }

            // Fetch from clients
            let txs = await client.getTransactions(address, { limit, lt, hash, inclusive: true });
            if (txs.length > 0) {
                await applyTransactions(txs.map((v) => ({ address: address, lt: v.id.lt, hash: v.id.hash, data: v.data })));
            }
            let existing = txs.find((v) => v.id.lt === lt);
            if (existing) {
                // Found in generic clients
                res.status(200).send({
                    transactions: txs.map((v) => ({
                        lt: v.id.lt,
                        hash: v.id.hash,
                        data: v.data
                    }))
                });
                return;
            }

            // All storages failed
            res.status(404).send('404 Not Found');
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